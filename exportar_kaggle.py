# Exportación de MiniTransformer desde un checkpoint .pt de Kaggle.
# Pega esta celda en tu notebook después de guardar el modelo.
import torch
import json
import base64
from pathlib import Path

archivo = Path('/kaggle/working/mi_primera_ia.pt')
if not archivo.exists():
    archivo = Path('/kaggle/working/mini_ia_v2.pt')
if not archivo.exists():
    raise FileNotFoundError('No encuentro el archivo .pt. Ejecuta primero la celda de guardado del notebook.')

checkpoint = torch.load(archivo, map_location='cpu', weights_only=True)
pesos = checkpoint['modelo']
vocabulario = list(checkpoint['caracteres'])
contexto = int(checkpoint['longitud_contexto'])
assert contexto == 48, 'El modelo debe usar contexto 48'
assert len(vocabulario) == pesos['emb_palabra.weight'].shape[0], 'El vocabulario no coincide'

parte_bytes = []
tensores = []
posicion = 0
for nombre, tensor in pesos.items():
    x = tensor.detach().cpu().float().contiguous()
    escala = max(float(x.abs().max().item()) / 127, 1e-12)
    cuantizado = torch.round(x / escala).clamp(-127, 127).to(torch.int8).contiguous()
    datos_binarios = cuantizado.numpy().tobytes()
    tensores.append({
        'name': nombre,
        'offset': posicion,
        'length': cuantizado.numel(),
        'scale': escala,
    })
    parte_bytes.append(datos_binarios)
    posicion += cuantizado.numel()

modelo_web = {
    'format': 'mini-transformer-pytorch-v1',
    'name': 'Mi MiniTransformer de Kaggle',
    'origin': 'Checkpoint personal: ' + archivo.name,
    'context': contexto,
    'hidden': 48,
    'heads': 4,
    'feedforward': 96,
    'vocab': vocabulario,
    'tensor': tensores,
    'data': base64.b64encode(b''.join(parte_bytes)).decode('ascii')
}
salida = Path('/kaggle/working/mi-transformer-web.json')
salida.write_text(json.dumps(modelo_web, ensure_ascii=False, separators=(',', ':')), encoding='utf-8')
print('Exportado:', salida)
print('Parámetros:', posicion)
print('Tamaño:', salida.stat().st_size, 'bytes')
print('Ahora descarga este JSON desde Kaggle y ábrelo en tu web Mini IA.')
