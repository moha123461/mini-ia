# PASO 26. Exportar a la web tu propio MiniTransformer desde Kaggle.
# Ejecutar en el mismo cuaderno donde entrenaste Mini IA.
# Prioridad: modelo ACTUAL en memoria; si no existe, ultimo checkpoint guardado.
import base64
import json
from pathlib import Path
import torch

salida_dir = Path("/kaggle/working")
salida_dir.mkdir(parents=True, exist_ok=True)

# 1. Elegir el modelo entrenado correcto.
sesion_actual = (
    "modelo" in globals()
    and isinstance(globals()["modelo"], torch.nn.Module)
    and "caracteres" in globals()
    and "longitud_contexto" in globals()
)
if sesion_actual:
    pesos = {k: v.detach().cpu() for k, v in modelo.state_dict().items()}
    vocabulario = list(caracteres)
    contexto = int(longitud_contexto)
    fuente = "Modelo activo en este notebook (el más reciente)"
    # Guardar también los pesos originales para no perder el trabajo.
    checkpoint = salida_dir / "mini_ia_ultimo.pt"
    torch.save({
        "modelo": pesos,
        "caracteres": vocabulario,
        "longitud_contexto": contexto
    }, checkpoint)
    print("Checkpoint guardado:", checkpoint)
else:
    # Si se reinició Kaggle, usar primero el checkpoint más reciente disponible.
    candidatos = [
        "mini_ia_ultimo.pt",
        "mini_ia_v4.pt",
        "mini_ia_v3.pt",
        "mini_ia_v2.pt",
        "mi_primera_ia.pt"
    ]
    archivo = next((salida_dir / n for n in candidatos if (salida_dir / n).exists()), None)
    if archivo is None:
        raise FileNotFoundError(
            "No hay un modelo entrenado en memoria ni un .pt en /kaggle/working. "
            "Ejecuta las celdas de creación y entrenamiento o restaura el checkpoint guardado."
        )
    datos = torch.load(archivo, map_location="cpu", weights_only=True)
    pesos = datos["modelo"]
    vocabulario = list(datos["caracteres"])
    contexto = int(datos["longitud_contexto"])
    fuente = f"Checkpoint: {archivo.name}"

# 2. Comprobar la arquitectura para que la web pueda leer el archivo.
if contexto != 48:
    raise ValueError(f"Contexto {contexto}: esta versión de la web solo admite 48.")
if len(vocabulario) != len(set(vocabulario)):
    raise ValueError("Hay caracteres duplicados en el vocabulario.")
if not 2 <= len(vocabulario) <= 300:
    raise ValueError("Vocabulario fuera de rango para esta versión web.")
if len(vocabulario) != pesos["emb_palabra.weight"].shape[0]:
    raise ValueError("El vocabulario y los pesos no corresponden al mismo modelo.")
if list(pesos["emb_palabra.weight"].shape)[1] != 48:
    raise ValueError("Este modelo no usa 48 dimensiones.")
if list(pesos["emb_posicion.weight"].shape) != [48, 48]:
    raise ValueError("Este modelo no usa la codificación de posición esperada.")

# 3. Comprimir los pesos a int8: el archivo es pequeño y no necesita servidor.
partes = []
tensores = []
offset = 0
for nombre, tensor in pesos.items():
    t = tensor.detach().cpu().float().contiguous()
    if not torch.isfinite(t).all():
        raise ValueError("Peso inválido: " + nombre)
    escala = max(float(t.abs().max().item()) / 127.0, 1e-12)
    q = torch.round(t / escala).clamp(-127, 127).to(torch.int8).contiguous()
    b = q.numpy().tobytes()
    tensores.append({
        "name": nombre,
        "offset": offset,
        "length": q.numel(),
        "scale": escala
    })
    partes.append(b)
    offset += q.numel()

exportado = {
    "format": "mini-transformer-pytorch-v1",
    "name": "Mi propio Transformer entrenado en Kaggle",
    "origin": fuente,
    "context": contexto,
    "hidden": 48,
    "heads": 4,
    "feedforward": 96,
    "vocab": vocabulario,
    "tensor": tensores,
    "data": base64.b64encode(b"".join(partes)).decode("ascii")
}
ruta = salida_dir / "mi-transformer-web.json"
ruta.write_text(json.dumps(exportado, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print("✅ Modelo exportado:", ruta)
print("Fuente:", fuente)
print("Parámetros:", offset)
print("Tamaño:", round(ruta.stat().st_size / 1024, 1), "KB")
print("Ahora descarga mi-transformer-web.json desde /kaggle/working y cárgalo en el Laboratorio de Mini IA.")
