import test from "node:test";
import assert from "node:assert/strict";
import {NeuralClassifier} from "./classifier.js";

function syntheticModel(){
  return {
    format:"mini-ia-clasificador-v1",
    name:"Modelo de prueba",
    grams:[" ho","ad"],
    idf:[1,1],
    answers:["Hola.","Adiós."],
    hidden:2,
    weights:{
      fc1_weight:[2,0,0,2],
      fc1_bias:[0,0],
      fc2_weight:[3,0,0,3],
      fc2_bias:[0,0]
    },
    baseline_questions:["hola","adios"],
    baseline_labels:[0,1]
  };
}

test("carga la estructura exportada por Kaggle",()=>{
  const clf=new NeuralClassifier(syntheticModel());
  assert.equal(clf.name,"Modelo de prueba");
  assert.equal(clf.answers.length,2);
});

test("calcula la clasificación neuronal y el vecino más parecido",()=>{
  const clf=new NeuralClassifier(syntheticModel());
  const greeting=clf.predict("Hola");
  assert.equal(greeting.answer,"Hola.");
  assert.equal(greeting.nearest.answer,"Hola.");
  const farewell=clf.predict("Adios");
  assert.equal(farewell.answer,"Adiós.");
  assert.equal(farewell.nearest.answer,"Adiós.");
  assert.ok(greeting.score>0.5);
  assert.ok(farewell.score>0.5);
});

test("no afirma reconocer una pregunta sin características compartidas",()=>{
  const clf=new NeuralClassifier(syntheticModel());
  const result=clf.predict("xyz");
  assert.equal(result.matchedFeatures,false);
  assert.ok(result.score>=0&&result.score<=1);
});

test("rechaza archivos corruptos y dimensiones incorrectas",()=>{
  assert.throws(()=>new NeuralClassifier({}),/clasificador/);
  const model=syntheticModel();
  model.weights.fc1_weight=[1,2];
  assert.throws(()=>new NeuralClassifier(model),/Dimensiones/);
  assert.throws(()=>new NeuralClassifier({...syntheticModel(),baseline_labels:[999,0]}),/Etiquetas/);
});
