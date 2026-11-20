import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NeuralClassifier} from "./classifier.js";

const model=JSON.parse(readFileSync(new URL("./models/mi-ia-v9-clasificador.json",import.meta.url),"utf8"));
const heldOut=[
  [
    "buenos dias",
    "Hola."
  ],
  [
    "que nombre tienes",
    "Soy Mini IA."
  ],
  [
    "eres una ia",
    "Soy una ia pequena."
  ],
  [
    "tienes emociones humanas",
    "No tengo emociones."
  ],
  [
    "con que te hicieron",
    "Uso Python."
  ],
  [
    "que puedes hacer",
    "Puedo explicar conceptos."
  ],
  [
    "define python",
    "Python es un lenguaje."
  ],
  [
    "que significa ia",
    "Una ia aprende patrones."
  ],
  [
    "como funciona una red neuronal",
    "Una red neuronal aprende."
  ],
  [
    "como funciona un transformer",
    "Un transformer usa atencion."
  ],
  [
    "que significa entrenar",
    "Entrenar es ajustar pesos."
  ],
  [
    "que son los tokens",
    "Un token es parte del texto."
  ],
  [
    "que son los datos",
    "Los datos son informacion."
  ],
  [
    "define sobreajuste",
    "Sobreajuste es memorizar."
  ],
  [
    "para que sirve un algoritmo",
    "Un algoritmo tiene pasos."
  ],
  [
    "para que sirve programar",
    "Programar es dar ordenes."
  ],
  [
    "como funciona internet",
    "Internet conecta equipos."
  ],
  [
    "que hace un chatbot",
    "Un chatbot conversa."
  ],
  [
    "para que sirve github",
    "GitHub guarda codigo."
  ],
  [
    "para que sirve javascript",
    "JavaScript anima webs."
  ],
  [
    "que es un sitio web",
    "La web muestra paginas."
  ],
  [
    "para que sirve una gpu",
    "Una gpu acelera calculos."
  ],
  [
    "para que sirve una cpu",
    "La cpu procesa ordenes."
  ],
  [
    "que es el loss",
    "El error mide fallos."
  ],
  [
    "para que sirve validar",
    "Validar mide aprendizaje."
  ],
  [
    "para que sirve el test",
    "Probar mide resultados."
  ],
  [
    "para que sirve la tecnologia",
    "La tecnologia ayuda."
  ],
  [
    "para que sirve ciencia",
    "La ciencia investiga."
  ],
  [
    "hasta pronto",
    "Adios y hasta pronto."
  ],
  [
    "mil gracias",
    "De nada."
  ]
];

test("modelo Kaggle real publicado con todos los pesos y categorías",()=>{
  assert.equal(model.format,"mini-ia-clasificador-v1");
  assert.equal(model.packed_weight_format,"float32-le");
  assert.equal(model.grams.length,1078);
  assert.equal(model.answers.length,30);
  const clf=new NeuralClassifier(model);
  assert.equal(clf.W1.length+clf.b1.length+clf.W2.length+clf.b2.length,141982);
});

test("reproduce los 27/30 aciertos de la prueba original de Kaggle",()=>{
  const clf=new NeuralClassifier(model);
  let successes=0;
  for(const [question,expected] of heldOut){
    const result=clf.predict(question);
    successes+=Number(result.answer===expected);
  }
  assert.equal(successes,27);
});

test("respuestas conocidas: Python, Transformer y saludo",()=>{
  const clf=new NeuralClassifier(model);
  assert.equal(clf.predict("buenos dias").answer,"Hola.");
  assert.equal(clf.predict("define python").answer,"Python es un lenguaje.");
  assert.equal(clf.predict("como funciona un transformer").answer,"Un transformer usa atencion.");
});

test("se detectan preguntas sin características reconocidas",()=>{
  const clf=new NeuralClassifier(model);
  const r=clf.predict("🪐🪐");
  assert.equal(r.matchedFeatures,false);
});


test("modo prudente rechaza preguntas nuevas sin modificar los pesos",()=>{
  const clf=new NeuralClassifier(model);
  const unknown=[
    "Qué es el ADN","Qué tiempo hace hoy","Quién es el presidente de España",
    "Cómo hacer una tortilla","Cuánto cuesta un coche",
    "Qué es una fruta","Qué es la hipotenusa","Cuál es la capital de Francia",
    "Dime un chiste","Qué es la química","Qué es una célula",
    "Cuál es mi pedido"
  ];
  for(const question of unknown){
    const prediction=clf.predict(question);
    const safe=clf.answerSafely(question);
    assert.equal(safe.answer,prediction.answer,"Predicción original alterada: "+question);
    assert.equal(safe.accepted,false,"Se esperaba rechazar: "+question);
    assert.match(safe.safeAnswer,/Todavía no sé/);
  }
  for(const [question,answer] of [
    ["buenos dias","Hola."],["define python","Python es un lenguaje."],
    ["como funciona un transformer","Un transformer usa atencion."]
  ]){
    const safe=clf.answerSafely(question);
    assert.equal(safe.accepted,true,question);
    assert.equal(safe.safeAnswer,answer,question);
  }
});
