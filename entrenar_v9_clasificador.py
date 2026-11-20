# Mini IA 9.0: red neuronal clasificadora de preguntas.
# Experimento educativo: respuestas conocidas, NO generacion de texto libre.
# Kaggle: Run All. Solo necesita PyTorch y Python.
import copy
import json
import math
import random
import unicodedata
from collections import Counter
from pathlib import Path

import torch
import torch.nn as nn
import torch.nn.functional as F

SEED = 42
HIDDEN = 128
EPOCHS = 350
PATIENCE = 45
OUTPUT = Path("/kaggle/working")
OUTPUT.mkdir(parents=True, exist_ok=True)
random.seed(SEED)
torch.manual_seed(SEED)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Conservamos los mismos 30 temas y las MISMAS preguntas reservadas.
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
assert len(topics) == 30 and all(len(questions) == 4 for _,questions in topics)

def normalizar(text):
    text = unicodedata.normalize("NFD", text.lower().strip())
    text = "".join(c for c in text if unicodedata.category(c) != "Mn")
    return " ".join(text.split())

def ngramas(text):
    bag = Counter()
    for word in normalizar(text).split(" "):
        if not word:
            continue
        padded = " " + word + " "
        for n in range(2,6):
            for start in range(len(padded)-n+1):
                bag[padded[start:start+n]] += 1
    return bag

# Los ejemplos 0/1 entrenan; el 2 valida; el 3 solo se evalúa AL FINAL.
train = [(q, i) for i, (_,qs) in enumerate(topics) for q in qs[:2]]
valid = [(qs[2], i) for i, (_,qs) in enumerate(topics)]
test = [(qs[3], i) for i, (_,qs) in enumerate(topics)]
assert len(train) == 60 and len(valid) == 30 and len(test) == 30
answers = [answer for answer, _ in topics]

# Crear vocabulario y estadísticas SOLO con las 60 preguntas de entrenamiento.
train_bags = [ngramas(q) for q,_ in train]
df = Counter()
for bag in train_bags:
    df.update(bag.keys())
vocab = sorted(df)
idf = [math.log((1+len(train))/(1+df[token]))+1 for token in vocab]
vocab_index = {gram:index for index,gram in enumerate(vocab)}

def vectorizar(text):
    features = ngramas(text)
    result = torch.zeros(len(vocab), dtype=torch.float32)
    for gram, count in features.items():
        index = vocab_index.get(gram)
        if index is not None:
            result[index] = (1+math.log(count))*idf[index]
    norm = result.norm()
    if norm > 0:
        result /= norm
    return result

def tensorizar(pairs):
    X = torch.stack([vectorizar(question) for question,_ in pairs]).to(device)
    y = torch.tensor([label for _,label in pairs],dtype=torch.long,device=device)
    return X,y

X_train,y_train=tensorizar(train)
X_valid,y_valid=tensorizar(valid)
X_test,y_test=tensorizar(test)

class ClasificadorNeuronal(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc1=nn.Linear(len(vocab),HIDDEN)
        self.fc2=nn.Linear(HIDDEN,len(topics))
        self.dropout=nn.Dropout(0.15)

    def forward(self,x):
        return self.fc2(self.dropout(F.relu(self.fc1(x))))

model=ClasificadorNeuronal().to(device)
optimizer=torch.optim.AdamW(model.parameters(),lr=0.006,weight_decay=0.015)
best_state=copy.deepcopy(model.state_dict())
best_val_loss=float("inf")
remaining=PATIENCE
history=[]

print("Mini IA 9.0 — Clasificador neuronal")
print("Preguntas entrenar/validar/probar:",len(train),len(valid),len(test))
print("Características:",len(vocab),"| Parámetros:",sum(p.numel() for p in model.parameters()))
print("Dispositivo:",device)
for epoch in range(1,EPOCHS+1):
    model.train()
    optimizer.zero_grad(set_to_none=True)
    logits=model(X_train)
    loss=F.cross_entropy(logits,y_train)
    loss.backward()
    optimizer.step()
    model.eval()
    with torch.no_grad():
        val_logits=model(X_valid)
        val_loss=float(F.cross_entropy(val_logits,y_valid).item())
        val_acc=float((val_logits.argmax(dim=1)==y_valid).float().mean().item())
    history.append({"epoch":epoch,"train_loss":round(loss.item(),4),
                    "validation_loss":round(val_loss,4),"validation_acc":round(val_acc,4)})
    if epoch==1 or epoch%25==0:
        print(f"Epoca {epoch:3d} | error train {loss.item():.3f} | val {val_loss:.3f} | acierto validacion {val_acc:.1%}")
    if val_loss<best_val_loss-0.0005:
        best_val_loss=val_loss
        best_state=copy.deepcopy(model.state_dict())
        remaining=PATIENCE
    else:
        remaining-=1
        if remaining==0:
            print("Parada anticipada. Se recupera el mejor modelo.")
            break

model.load_state_dict(best_state)
model.eval()

@torch.no_grad()
def predecir_neural(question):
    x=vectorizar(question).unsqueeze(0).to(device)
    logits=model(x)[0]
    probabilities=torch.softmax(logits,dim=0)
    idx=int(probabilities.argmax().item())
    return idx,float(probabilities[idx].item())

# El comparador es TF-IDF + coseno usando las mismas preguntas de entrenamiento.
def predecir_similitud(question):
    query=vectorizar(question).to(device)
    sims=X_train @ query
    nearest=int(sims.argmax().item())
    return int(y_train[nearest].item()),float(sims[nearest].item())

def evaluar(pairs,include_examples=False):
    count_neural=count_similarity=0
    cases=[]
    for question,expected in pairs:
        neural,prob=predecir_neural(question)
        similar,sim=predecir_similitud(question)
        count_neural+=int(neural==expected)
        count_similarity+=int(similar==expected)
        if include_examples:
            cases.append({
                "question":question,"correct_answer":answers[expected],
                "neural_answer":answers[neural],"neural_score":round(prob,4),
                "similarity_answer":answers[similar],"similarity_score":round(sim,4),
                "neural_correct":neural==expected,
                "similarity_correct":similar==expected
            })
    return {"neural":count_neural,"similarity":count_similarity,"total":len(pairs),"cases":cases}

# La PRUEBA final se ejecuta una sola vez después de recuperar el modelo.
train_result=evaluar(train)
valid_result=evaluar(valid)
test_result=evaluar(test,include_examples=True)
print("\nRESULTADOS FINALES")
for label,result in [("Entrenamiento",train_result),("Validacion",valid_result),("Prueba final",test_result)]:
    print(f"{label}: red neuronal {result['neural']}/{result['total']} | similitud {result['similarity']}/{result['total']}")
print("\nEjemplos de preguntas reservadas:")
for e in test_result["cases"][:10]:
    print("P:",e["question"],"| Red neuronal:",e["neural_answer"],"| Esperado:",e["correct_answer"])

# Guardar pesos para poder continuar el experimento después de cerrar Kaggle.
torch.save({
    "state_dict":{name:t.cpu() for name,t in model.state_dict().items()},
    "vocab":vocab,"idf":idf,"answers":answers,"hidden":HIDDEN,
    "seed":SEED,"version":"9.0"
},OUTPUT/"mi_ia_9_clasificador.pt")

# Exportación para un futuro modo de clasificación en el navegador:
# matrices en orden [fila][columna] y funciones ReLU + Softmax.
state=model.state_dict()
web={
    "format":"mini-ia-clasificador-v1",
    "name":"Mini IA 9.0 — red neuronal clasificadora",
    "description":"Selecciona entre 30 respuestas. No genera texto libre.",
    "grams":vocab,"idf":[round(v,8) for v in idf],
    "answers":answers,"hidden":HIDDEN,
    "weights":{
        "fc1_weight":[round(float(v),6) for v in state["fc1.weight"].cpu().flatten()],
        "fc1_bias":[round(float(v),6) for v in state["fc1.bias"].cpu()],
        "fc2_weight":[round(float(v),6) for v in state["fc2.weight"].cpu().flatten()],
        "fc2_bias":[round(float(v),6) for v in state["fc2.bias"].cpu()]
    },
    "baseline_questions":[q for q,_ in train],
    "baseline_labels":[label for _,label in train]
}
model_path=OUTPUT/"mi-ia-v9-clasificador.json"
model_path.write_text(json.dumps(web,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
report_path=OUTPUT/"resultados-mini-ia-v9.json"
report_path.write_text(json.dumps({
    "best_validation_loss":best_val_loss,
    "training":train_result,"validation":valid_result,
    "test":test_result,"history":history
},ensure_ascii=False,indent=2),encoding="utf-8")
print("\nArchivos creados:")
print(" - mi_ia_9_clasificador.pt")
print(" - mi-ia-v9-clasificador.json")
print(" - resultados-mini-ia-v9.json")
print("El experimento NO cambia los pesos del Transformer publicado.")
print("Importante: una red clasificadora solo selecciona respuestas conocidas; no es ChatGPT.")
