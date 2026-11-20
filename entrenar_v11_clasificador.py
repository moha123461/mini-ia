# Mini IA 11.0: nueva red clasificadora con 60 temas y 120 preguntas de entrenamiento.
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
HIDDEN = 192
EPOCHS = 450
PATIENCE = 55
OUTPUT = Path("/kaggle/working")
OUTPUT.mkdir(parents=True, exist_ok=True)
random.seed(SEED)
torch.manual_seed(SEED)
device = "cuda" if torch.cuda.is_available() else "cpu"

# Datos incorporados al notebook, sin descargar archivos durante Kaggle.
# Cada grupo incluye 2 preguntas para entrenar, 1 para validar y 1 de prueba.
# Las respuestas son categorías cerradas, NO generación de lenguaje.
topics = [
  [
    "Hola.",
    [
      "hola",
      "buenas",
      "que tal",
      "buenos dias"
    ]
  ],
  [
    "Soy Mini IA.",
    [
      "como te llamas",
      "dime tu nombre",
      "cual es tu nombre",
      "que nombre tienes"
    ]
  ],
  [
    "Soy una ia pequena.",
    [
      "que eres",
      "quien eres",
      "eres una inteligencia artificial",
      "eres una ia"
    ]
  ],
  [
    "No tengo emociones.",
    [
      "tienes sentimientos",
      "puedes sentir",
      "sientes emociones",
      "tienes emociones humanas"
    ]
  ],
  [
    "Uso Python.",
    [
      "con que lenguaje te crearon",
      "como te programaron",
      "que lenguaje usaron para crearte",
      "con que te hicieron"
    ]
  ],
  [
    "Puedo explicar conceptos.",
    [
      "que sabes hacer",
      "en que puedes ayudar",
      "cuales son tus funciones",
      "que puedes hacer"
    ]
  ],
  [
    "Python es un lenguaje.",
    [
      "que es python",
      "explica python",
      "para que sirve python",
      "define python"
    ]
  ],
  [
    "Una ia aprende patrones.",
    [
      "que es una ia",
      "explica inteligencia artificial",
      "define inteligencia artificial",
      "que significa ia"
    ]
  ],
  [
    "Una red neuronal aprende.",
    [
      "que es una red neuronal",
      "explica una red neuronal",
      "define red neuronal",
      "como funciona una red neuronal"
    ]
  ],
  [
    "Un transformer usa atencion.",
    [
      "que es un transformer",
      "explica transformer",
      "define transformer",
      "como funciona un transformer"
    ]
  ],
  [
    "Entrenar es ajustar pesos.",
    [
      "que es entrenar una ia",
      "explica entrenamiento",
      "como entrenar una ia",
      "que significa entrenar"
    ]
  ],
  [
    "Un token es parte del texto.",
    [
      "que es un token",
      "explica token",
      "define token",
      "que son los tokens"
    ]
  ],
  [
    "Los datos son informacion.",
    [
      "que es un dato",
      "explica los datos",
      "define datos",
      "que son los datos"
    ]
  ],
  [
    "Sobreajuste es memorizar.",
    [
      "que es sobreajuste",
      "explica overfitting",
      "que pasa al memorizar",
      "define sobreajuste"
    ]
  ],
  [
    "Un algoritmo tiene pasos.",
    [
      "que es un algoritmo",
      "define algoritmo",
      "explica un algoritmo",
      "para que sirve un algoritmo"
    ]
  ],
  [
    "Programar es dar ordenes.",
    [
      "que es programar",
      "explica programacion",
      "define programacion",
      "para que sirve programar"
    ]
  ],
  [
    "Internet conecta equipos.",
    [
      "que es internet",
      "explica internet",
      "define internet",
      "como funciona internet"
    ]
  ],
  [
    "Un chatbot conversa.",
    [
      "que es un chatbot",
      "explica chatbot",
      "define chatbot",
      "que hace un chatbot"
    ]
  ],
  [
    "GitHub guarda codigo.",
    [
      "que es github",
      "explica github",
      "define github",
      "para que sirve github"
    ]
  ],
  [
    "JavaScript anima webs.",
    [
      "que es javascript",
      "explica javascript",
      "define javascript",
      "para que sirve javascript"
    ]
  ],
  [
    "La web muestra paginas.",
    [
      "que es una web",
      "explica pagina web",
      "define pagina web",
      "que es un sitio web"
    ]
  ],
  [
    "Una gpu acelera calculos.",
    [
      "que es una gpu",
      "explica gpu",
      "define gpu",
      "para que sirve una gpu"
    ]
  ],
  [
    "La cpu procesa ordenes.",
    [
      "que es una cpu",
      "explica cpu",
      "define cpu",
      "para que sirve una cpu"
    ]
  ],
  [
    "El error mide fallos.",
    [
      "que es la perdida",
      "explica funcion de perdida",
      "define perdida",
      "que es el loss"
    ]
  ],
  [
    "Validar mide aprendizaje.",
    [
      "que es validar un modelo",
      "explica validacion",
      "define validacion",
      "para que sirve validar"
    ]
  ],
  [
    "Probar mide resultados.",
    [
      "que es una prueba",
      "explica conjunto de prueba",
      "define prueba",
      "para que sirve el test"
    ]
  ],
  [
    "La tecnologia ayuda.",
    [
      "que es la tecnologia",
      "explica tecnologia",
      "define tecnologia",
      "para que sirve la tecnologia"
    ]
  ],
  [
    "La ciencia investiga.",
    [
      "que es ciencia",
      "explica ciencia",
      "define ciencia",
      "para que sirve ciencia"
    ]
  ],
  [
    "Adios y hasta pronto.",
    [
      "adios",
      "hasta luego",
      "nos vemos",
      "hasta pronto"
    ]
  ],
  [
    "De nada.",
    [
      "gracias",
      "muchas gracias",
      "te lo agradezco",
      "mil gracias"
    ]
  ],
  [
    "HTML organiza una pagina web.",
    [
      "que es html",
      "explica html",
      "para que sirve html",
      "define html"
    ]
  ],
  [
    "CSS da estilo a una pagina web.",
    [
      "que es css",
      "para que sirve css",
      "explica css",
      "define css"
    ]
  ],
  [
    "Una API conecta programas.",
    [
      "que es una api",
      "explica una api",
      "para que sirve una api",
      "define api"
    ]
  ],
  [
    "Un servidor ofrece servicios.",
    [
      "que es un servidor",
      "explica servidor web",
      "para que sirve un servidor",
      "define servidor"
    ]
  ],
  [
    "Una base de datos organiza informacion.",
    [
      "que es una base de datos",
      "explica base de datos",
      "para que sirve una base de datos",
      "define base de datos"
    ]
  ],
  [
    "SQL consulta bases de datos.",
    [
      "que es sql",
      "explica sql",
      "para que sirve sql",
      "define sql"
    ]
  ],
  [
    "Una variable guarda un valor.",
    [
      "que es una variable en programacion",
      "explica variable en codigo",
      "para que sirve una variable",
      "define variable en programacion"
    ]
  ],
  [
    "Una funcion reutiliza instrucciones.",
    [
      "que es una funcion en programacion",
      "explica funcion de codigo",
      "para que sirve una funcion en python",
      "define funcion en programacion"
    ]
  ],
  [
    "Un bucle repite instrucciones.",
    [
      "que es un bucle en programacion",
      "explica un bucle",
      "para que sirve un bucle",
      "define bucle en programacion"
    ]
  ],
  [
    "Un condicional toma decisiones.",
    [
      "que es una condicion en programacion",
      "explica if en python",
      "para que sirve un condicional",
      "define instruccion condicional"
    ]
  ],
  [
    "Depurar corrige errores.",
    [
      "que es depurar un programa",
      "explica depuracion de codigo",
      "para que sirve depurar",
      "define debugging"
    ]
  ],
  [
    "Git guarda versiones del codigo.",
    [
      "que es git",
      "explica git",
      "para que sirve git",
      "define git"
    ]
  ],
  [
    "Un commit registra cambios.",
    [
      "que es un commit",
      "explica commit de git",
      "para que sirve un commit",
      "define commit en github"
    ]
  ],
  [
    "Un repositorio guarda un proyecto.",
    [
      "que es un repositorio de codigo",
      "explica repositorio git",
      "para que sirve un repositorio",
      "define repositorio de software"
    ]
  ],
  [
    "GitHub Pages publica webs estaticas.",
    [
      "que es github pages",
      "explica github pages",
      "para que sirve github pages",
      "como funciona github pages"
    ]
  ],
  [
    "Software son programas.",
    [
      "que es software",
      "explica software",
      "define software",
      "para que sirve el software"
    ]
  ],
  [
    "Hardware son componentes fisicos.",
    [
      "que es hardware",
      "explica hardware",
      "define hardware",
      "para que sirve el hardware"
    ]
  ],
  [
    "El sistema operativo controla el equipo.",
    [
      "que es un sistema operativo",
      "explica sistema operativo",
      "define sistema operativo",
      "para que sirve windows linux"
    ]
  ],
  [
    "Un navegador abre paginas web.",
    [
      "que es un navegador web",
      "explica navegador de internet",
      "define navegador web",
      "para que sirve un navegador"
    ]
  ],
  [
    "Un dominio da nombre a un sitio.",
    [
      "que es un dominio web",
      "explica dominio de internet",
      "define nombre de dominio",
      "para que sirve un dominio web"
    ]
  ],
  [
    "DNS traduce dominios.",
    [
      "que es dns",
      "explica dns",
      "para que sirve dns",
      "define sistema dns"
    ]
  ],
  [
    "HTTPS cifra la conexion web.",
    [
      "que es https",
      "explica https",
      "para que sirve https",
      "define conexion https"
    ]
  ],
  [
    "El cifrado protege datos.",
    [
      "que es el cifrado de datos",
      "explica cifrado",
      "para que sirve cifrar",
      "define encriptacion"
    ]
  ],
  [
    "El phishing intenta robar datos.",
    [
      "que es phishing",
      "explica phishing",
      "como evitar el phishing",
      "define phishing"
    ]
  ],
  [
    "Una copia de seguridad evita perdidas.",
    [
      "que es una copia de seguridad",
      "explica backup",
      "para que sirve un backup",
      "define copia de seguridad"
    ]
  ],
  [
    "El codigo abierto permite revisar software.",
    [
      "que es el codigo abierto",
      "explica software de codigo abierto",
      "define open source",
      "para que sirve codigo abierto"
    ]
  ],
  [
    "Un sesgo puede alterar las predicciones.",
    [
      "que es el sesgo en ia",
      "explica sesgo algoritmico",
      "define bias en inteligencia artificial",
      "por que una ia tiene sesgos"
    ]
  ],
  [
    "Clasificar es elegir una categoria.",
    [
      "que es clasificacion en aprendizaje automatico",
      "explica clasificacion de ia",
      "para que sirve un clasificador",
      "define clasificacion automatica"
    ]
  ],
  [
    "La regresion predice numeros.",
    [
      "que es regresion en machine learning",
      "explica regresion en ia",
      "para que sirve regresion",
      "define modelo de regresion"
    ]
  ],
  [
    "La matriz de confusion muestra errores.",
    [
      "que es una matriz de confusion",
      "explica matriz de confusion",
      "para que sirve matriz de confusion",
      "define confusion matrix"
    ]
  ]
]
assert len(topics) == 60 and all(len(questions) == 4 for _,questions in topics)

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
assert len(train) == 120 and len(valid) == 60 and len(test) == 60
answers = [answer for answer, _ in topics]

# Crear vocabulario y estadísticas SOLO con las 120 preguntas de entrenamiento.
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

print("Mini IA 11.0 — Clasificador neuronal con 60 temas")
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

# Diagnóstico fuera de tema. Estas preguntas NO se usan para entrenar,
# validar ni elegir hiperparámetros: solo se informa qué seleccionaría el modelo.
unknown_questions = [
    "que es el adn", "cual es la capital de francia",
    "que tiempo hace hoy", "quien es el presidente actual",
    "que es la fotosintesis", "tengo dolor de cabeza",
    "como cocinar una tortilla", "cuanto cuesta un coche",
    "donde esta mi pedido", "que equipo gano el mundial",
    "quien escribio don quijote", "que es el sistema solar"
]
unknown_examples=[]
for question in unknown_questions:
    predicted, probability = predecir_neural(question)
    similar, similarity = predecir_similitud(question)
    unknown_examples.append({
        "question":question, "neural_answer":answers[predicted],
        "neural_softmax":round(probability,4),
        "nearest_answer":answers[similar],"nearest_cosine":round(similarity,4)
    })
print("\nDIAGNÓSTICO DE TEMAS DESCONOCIDOS (sin aciertos medibles):")
for item in unknown_examples[:5]:
    print(item["question"],"->",item["neural_answer"],"(ejemplo, NO respuesta fiable)")
print("El clasificador siempre elige una categoría aunque no conozca la pregunta.")

# Guardar pesos para poder continuar el experimento después de cerrar Kaggle.
torch.save({
    "state_dict":{name:t.cpu() for name,t in model.state_dict().items()},
    "vocab":vocab,"idf":idf,"answers":answers,"hidden":HIDDEN,
    "seed":SEED,"version":"11.0"
},OUTPUT/"mi_ia_11_clasificador.pt")

# Exportación para un futuro modo de clasificación en el navegador:
# matrices en orden [fila][columna] y funciones ReLU + Softmax.
state=model.state_dict()
web={
    "format":"mini-ia-clasificador-v1",
    "name":"Mini IA 11.0 — red neuronal de 60 categorias",
    "description":"Selecciona entre 60 respuestas conocidas. No genera texto libre.",
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
model_path=OUTPUT/"mi-ia-v11-clasificador.json"
model_path.write_text(json.dumps(web,ensure_ascii=False,separators=(",",":")),encoding="utf-8")
report_path=OUTPUT/"resultados-mini-ia-v11.json"
report_path.write_text(json.dumps({
    "best_validation_loss":best_val_loss,
    "training":train_result,"validation":valid_result,
    "test":test_result,"unknown_diagnostic":unknown_examples,"history":history
},ensure_ascii=False,indent=2),encoding="utf-8")
print("\nArchivos creados:")
print(" - mi_ia_11_clasificador.pt")
print(" - mi-ia-v11-clasificador.json")
print(" - resultados-mini-ia-v11.json")
print("El entrenamiento NO cambia la web ni los modelos publicados en GitHub.")
print("No compares directamente 27/30 del modelo anterior con esta prueba de 60 preguntas.")
