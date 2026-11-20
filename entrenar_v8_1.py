# Mini IA 8.1: entrenamiento centrado en respuestas + comparador de recuperacion.
# Ejecutar en Kaggle (CPU o GPU). No utiliza APIs de IA ni datos privados.
# Se guarda el mejor modelo, el informe de evaluacion y el JSON compatible con la web.
import base64
import copy
import json
import random
import unicodedata
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F

SEED = 42
CONTEXT = 48
PAD = "¤"
HIDDEN = 48
HEADS = 4
FF = 96
MAX_STEPS = 900
BATCH_SIZE = 16
EVAL_EVERY = 75
PATIENCE = 4
OUTPUT = Path("/kaggle/working")
OUTPUT.mkdir(parents=True, exist_ok=True)

random.seed(SEED)
torch.manual_seed(SEED)
device = "cuda" if torch.cuda.is_available() else "cpu"
if device == "cuda":
    torch.cuda.manual_seed_all(SEED)

# Cada tema tiene cuatro preguntas. Las dos primeras son para entrenar,
# la tercera para validacion y la cuarta se reserva para la prueba final.
# Las respuestas son deliberadamente cortas: el contexto del modelo es 48.
topics = [
 ("Hola.", ["hola", "buenas", "que tal", "buenos dias"]),
 ("Soy Mini IA.", ["como te llamas", "dime tu nombre", "cual es tu nombre", "que nombre tienes"]),
 ("Soy una ia pequena.", ["que eres", "quien eres", "eres una inteligencia artificial", "eres una ia"]),
 ("No tengo emociones.", ["tienes sentimientos", "puedes sentir", "sientes emociones", "tienes emociones humanas"]),
 ("Uso Python.", ["con que lenguaje te crearon", "como te programaron", "que lenguaje usaron para crearte", "con que te hicieron"]),
 ("Puedo explicar conceptos.", ["que sabes hacer", "en que puedes ayudar", "cuales son tus funciones", "que puedes hacer"]),
 ("Python es un lenguaje.", ["que es python", "explica python", "para que sirve python", "define python"]),
 ("Una ia aprende patrones.", ["que es una ia", "explica inteligencia artificial", "define inteligencia artificial", "que significa ia"]),
 ("Una red neuronal aprende.", ["que es una red neuronal", "explica una red neuronal", "define red neuronal", "como funciona una red neuronal"]),
 ("Un transformer usa atencion.", ["que es un transformer", "explica transformer", "define transformer", "como funciona un transformer"]),
 ("Entrenar es ajustar pesos.", ["que es entrenar una ia", "explica entrenamiento", "como entrenar una ia", "que significa entrenar"]),
 ("Un token es parte del texto.", ["que es un token", "explica token", "define token", "que son los tokens"]),
 ("Los datos son informacion.", ["que es un dato", "explica los datos", "define datos", "que son los datos"]),
 ("Sobreajuste es memorizar.", ["que es sobreajuste", "explica overfitting", "que pasa al memorizar", "define sobreajuste"]),
 ("Un algoritmo tiene pasos.", ["que es un algoritmo", "define algoritmo", "explica un algoritmo", "para que sirve un algoritmo"]),
 ("Programar es dar ordenes.", ["que es programar", "explica programacion", "define programacion", "para que sirve programar"]),
 ("Internet conecta equipos.", ["que es internet", "explica internet", "define internet", "como funciona internet"]),
 ("Un chatbot conversa.", ["que es un chatbot", "explica chatbot", "define chatbot", "que hace un chatbot"]),
 ("GitHub guarda codigo.", ["que es github", "explica github", "define github", "para que sirve github"]),
 ("JavaScript anima webs.", ["que es javascript", "explica javascript", "define javascript", "para que sirve javascript"]),
 ("La web muestra paginas.", ["que es una web", "explica pagina web", "define pagina web", "que es un sitio web"]),
 ("Una gpu acelera calculos.", ["que es una gpu", "explica gpu", "define gpu", "para que sirve una gpu"]),
 ("La cpu procesa ordenes.", ["que es una cpu", "explica cpu", "define cpu", "para que sirve una cpu"]),
 ("El error mide fallos.", ["que es la perdida", "explica funcion de perdida", "define perdida", "que es el loss"]),
 ("Validar mide aprendizaje.", ["que es validar un modelo", "explica validacion", "define validacion", "para que sirve validar"]),
 ("Probar mide resultados.", ["que es una prueba", "explica conjunto de prueba", "define prueba", "para que sirve el test"]),
 ("La tecnologia ayuda.", ["que es la tecnologia", "explica tecnologia", "define tecnologia", "para que sirve la tecnologia"]),
 ("La ciencia investiga.", ["que es ciencia", "explica ciencia", "define ciencia", "para que sirve ciencia"]),
 ("Adios y hasta pronto.", ["adios", "hasta luego", "nos vemos", "hasta pronto"]),
 ("De nada.", ["gracias", "muchas gracias", "te lo agradezco", "mil gracias"])
]
assert all(len(questions) == 4 for _, questions in topics)
assert len(topics) == 30

def clean_question(q):
    q = unicodedata.normalize("NFD", q.lower().strip())
    return "".join(c for c in q if unicodedata.category(c) != "Mn")

def sample(q, a):
    return f"Usuario: {clean_question(q)}\nIA: {a}\n"

train_rows = [sample(q, a) for a, qs in topics for q in qs[:2]]
valid_rows = [sample(qs[2], a) for a, qs in topics]
test_rows = [sample(qs[3], a) for a, qs in topics]
# El vocabulario incluye caracteres de todos los conjuntos, pero solamente
# train_rows se utiliza para actualizar los pesos.
chars = sorted(set("".join(train_rows + valid_rows + test_rows)) | {PAD})
assert PAD not in "".join(train_rows + valid_rows + test_rows)
to_id = {c: i for i, c in enumerate(chars)}
to_char = {i: c for c, i in to_id.items()}
pad_id = to_id[PAD]
V = len(chars)

def encode(s):
    return [to_id[c] for c in s]

def build_windows(rows):
    # Una sola secuencia por pregunta, cortada en ventanas superpuestas.
    # El modelo ve la pregunta, pero la pérdida evalúa ÚNICAMENTE la respuesta.
    # Antes se premiaba sobre todo predecir caracteres dentro de la pregunta.
    X, Y = [], []
    for row in rows:
        data = encode(row)
        answer_start = row.index("\nIA: ") + len("\nIA: ")
        for start in range(0, len(data) - 1, 24):
            fragment = data[start:start + CONTEXT + 1]
            if len(fragment) < 2:
                continue
            x = fragment[:-1]
            # -100 significa: no puntuamos esta posición al calcular la pérdida.
            y = [
                fragment[i + 1] if start + i + 1 >= answer_start else -100
                for i in range(len(x))
            ]
            if not any(target != -100 for target in y):
                continue
            padding = CONTEXT - len(x)
            X.append(x + [pad_id] * padding)
            Y.append(y + [-100] * padding)
    return torch.tensor(X, dtype=torch.long), torch.tensor(Y, dtype=torch.long)

train_x, train_y = build_windows(train_rows)
valid_x, valid_y = build_windows(valid_rows)
assert len(train_x) >= 60 and len(valid_x) >= 30

class MiniTransformer(nn.Module):
    def __init__(self):
        super().__init__()
        self.emb_palabra = nn.Embedding(V, HIDDEN)
        self.emb_posicion = nn.Embedding(CONTEXT, HIDDEN)
        layer = nn.TransformerEncoderLayer(
            d_model=HIDDEN, nhead=HEADS,
            dim_feedforward=FF, dropout=0.0, batch_first=True
        )
        self.transformer = nn.TransformerEncoder(
            layer, num_layers=1, enable_nested_tensor=False
        )
        self.salida = nn.Linear(HIDDEN, V)

    def forward(self, entrada, respuesta=None):
        n, length = entrada.shape
        positions = torch.arange(length, device=entrada.device)
        h = self.emb_palabra(entrada) + self.emb_posicion(positions)
        mask = torch.triu(torch.ones(length, length, dtype=torch.bool, device=entrada.device), diagonal=1)
        logits = self.salida(self.transformer(h, mask=mask))
        loss = None
        if respuesta is not None:
            loss = F.cross_entropy(
                logits.reshape(-1, V), respuesta.reshape(-1),
                ignore_index=-100
            )
        return logits, loss

model = MiniTransformer().to(device)
optimizer = torch.optim.AdamW(model.parameters(), lr=0.002, weight_decay=0.01)
best_state = copy.deepcopy(model.state_dict())
best_loss = float("inf")
patience_left = PATIENCE
history = []

@torch.no_grad()
def validation_loss():
    model.eval()
    total, count = 0.0, 0
    for i in range(0, len(valid_x), BATCH_SIZE):
        bx = valid_x[i:i + BATCH_SIZE].to(device)
        by = valid_y[i:i + BATCH_SIZE].to(device)
        _, loss = model(bx, by)
        n = int((by != -100).sum().item())
        total += float(loss.item()) * n
        count += n
    return total / max(count, 1)

print("Mini IA 8.1: pérdida centrada en respuestas y validación independiente")
print("Dispositivo:", device, "| Temas:", len(topics))
print("Preguntas entrenamiento:", len(train_rows), "| Validacion:", len(valid_rows), "| Prueba:", len(test_rows))
print("Vocabulario:", V, "| Parametros:", sum(p.numel() for p in model.parameters()))

for step in range(1, MAX_STEPS + 1):
    model.train()
    idx = torch.randint(len(train_x), (BATCH_SIZE,))
    bx = train_x[idx].to(device)
    by = train_y[idx].to(device)
    _, loss = model(bx, by)
    optimizer.zero_grad(set_to_none=True)
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    optimizer.step()
    if step % EVAL_EVERY == 0:
        score = validation_loss()
        train_loss = float(loss.item())
        history.append({"step": step, "train_loss": round(train_loss, 4), "validation_loss": round(score, 4)})
        print(f"Paso {step}/{MAX_STEPS} | Entrenamiento: {train_loss:.3f} | Validacion: {score:.3f}")
        if score < best_loss - 0.005:
            best_loss = score
            best_state = copy.deepcopy(model.state_dict())
            patience_left = PATIENCE
        else:
            patience_left -= 1
            if patience_left <= 0:
                print("Parada anticipada: la validacion ha dejado de mejorar.")
                break

model.load_state_dict(best_state)
model.eval()

@torch.no_grad()
def generate_answer(q, max_chars=45):
    prompt = f"Usuario: {clean_question(q)}\nIA: "
    if any(c not in to_id for c in prompt):
        return "[caracter desconocido]"
    tokens = encode(prompt)
    out = ""
    for _ in range(max_chars):
        ctx = torch.tensor([tokens[-CONTEXT:]], device=device, dtype=torch.long)
        logits, _ = model(ctx)
        options = logits[0, -1].clone()
        options[pad_id] = -float("inf")
        next_id = int(torch.argmax(options).item())
        token = to_char[next_id]
        if token == "\n":
            break
        out += token
        tokens.append(next_id)
    return out.strip()

correct = 0
examples = []
for answer, variants in topics:
    question = variants[3]  # Solo preguntas reservadas para prueba
    response = generate_answer(question)
    is_correct = response.casefold().strip() == answer.casefold().strip()
    correct += int(is_correct)
    examples.append({"question": question, "expected": answer, "generated": response, "correct": is_correct})

print(f"Transformer generativo: {correct}/{len(test_rows)} respuestas exactas en prueba")
for e in examples[:8]:
    print(f"P: {e['question']} | IA: {e['generated']} | Esperada: {e['expected']}")
print("La prueba mide estas 30 preguntas reservadas, NO la inteligencia general.")

# Comparación HONESTA: una búsqueda TF-IDF aproximada sin red neuronal.
# Entrenamos su índice usando SOLO las 60 preguntas de entrenamiento.
# No se usan respuestas ni preguntas reservadas para ajustar pesos o umbrales.
from collections import Counter
import math

def char_ngrams(text):
    bag = Counter()
    for word in clean_question(text).split():
        padded = " " + word + " "
        for n in range(2, 6):
            for i in range(len(padded) - n + 1):
                bag[padded[i:i+n]] += 1
    return bag

training_pairs = [(question, answer) for answer, variants in topics for question in variants[:2]]
bags = [char_ngrams(question) for question, _ in training_pairs]
document_frequency = Counter()
for bag in bags:
    document_frequency.update(bag.keys())

idf = {ngram: math.log((1 + len(bags)) / (1 + df)) + 1
       for ngram, df in document_frequency.items()}

def tfidf_vector(bag):
    values = {ngram: (1 + math.log(freq)) * idf[ngram]
              for ngram, freq in bag.items() if ngram in idf}
    norm = math.sqrt(sum(weight * weight for weight in values.values())) or 1
    return {ngram: weight / norm for ngram, weight in values.items()}

vectors = [tfidf_vector(bag) for bag in bags]

def baseline_answer(question):
    v = tfidf_vector(char_ngrams(question))
    similarities = [sum(x * train_v.get(g, 0) for g, x in v.items())
                    for train_v in vectors]
    best = max(range(len(similarities)), key=similarities.__getitem__)
    return training_pairs[best][1], float(similarities[best])

baseline_correct = 0
baseline_examples = []
for answer, variants in topics:
    question = variants[3]
    predicted, score = baseline_answer(question)
    ok = predicted == answer
    baseline_correct += int(ok)
    baseline_examples.append({
        "question": question, "expected": answer,
        "retrieved": predicted, "similarity": round(score, 4),
        "correct": ok
    })
print(f"Recuperación por similitud: {baseline_correct}/{len(test_rows)} respuestas correctas")
print("La recuperación NO genera respuestas nuevas y tampoco equivale a entrenar el Transformer.")
print("Comparación válida solo sobre este conjunto pequeño de 30 preguntas.")
for e in baseline_examples:
    if not e["correct"]:
        print(f"Error de recuperación: {e['question']} -> {e['retrieved']} | esperada: {e['expected']}")

# Guardar pesos originales y vocabulario para continuar entrenando más adelante.
checkpoint_path = OUTPUT / "mini_ia_v8_1.pt"
torch.save({
    "modelo": {k: p.detach().cpu() for k, p in model.state_dict().items()},
    "caracteres": chars,
    "longitud_contexto": CONTEXT,
    "pad_token": PAD,
    "version": "8.1",
    "validation_loss": best_loss,
    "seed": SEED
}, checkpoint_path)

# Exportar a JSON con el mismo formato que lee Mini IA en GitHub Pages.
tensors = []
buffers = []
offset = 0
for name, param in model.state_dict().items():
    t = param.detach().cpu().float().contiguous()
    if not torch.isfinite(t).all():
        raise ValueError(f"Peso inválido: {name}")
    scale = max(float(t.abs().max().item()) / 127, 1e-12)
    qt = torch.round(t / scale).clamp(-127, 127).to(torch.int8)
    raw = qt.numpy().tobytes()
    tensors.append({"name": name, "offset": offset, "length": qt.numel(), "scale": scale})
    buffers.append(raw)
    offset += qt.numel()

web_model = {
    "format": "mini-transformer-pytorch-v1",
    "name": "Mi Mini IA 8.1 entrenada en Kaggle",
    "origin": "60 preguntas; pérdida centrada en respuestas; 30 de validación",
    "context": CONTEXT, "hidden": HIDDEN, "heads": HEADS, "feedforward": FF,
    "vocab": chars,
    "exclude_tokens": [PAD],
    "tensor": tensors,
    "data": base64.b64encode(b"".join(buffers)).decode("ascii")
}
model_path = OUTPUT / "mi-transformer-v8_1.json"
model_path.write_text(json.dumps(web_model, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")

report_path = OUTPUT / "evaluacion_mini_ia_v8_1.json"
report_path.write_text(json.dumps({
    "training_queries": len(train_rows),
    "validation_queries": len(valid_rows),
    "test_queries": len(test_rows),
    "transformer_exact_matches": correct,
    "retrieval_exact_matches": baseline_correct,
    "retrieval_examples": baseline_examples,
    "best_validation_loss": best_loss,
    "history": history,
    "examples": examples
}, ensure_ascii=False, indent=2), encoding="utf-8")

print("\n✅ Archivos preparados en /kaggle/working:")
print(" - mini_ia_v8_1.pt (pesos originales para continuar el entrenamiento)")
print(" - mi-transformer-v8_1.json (modelo neuronal para tu web)")
print(" - evaluacion_mini_ia_v8_1.json (resultados de ambos sistemas)")
print("Nota: carga primero el JSON en el Laboratorio antes de sustituir el modelo predeterminado de GitHub.")
