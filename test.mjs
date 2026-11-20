import test from "node:test";
import assert from "node:assert/strict";
import {MiniEngine, normalize, KNOWLEDGE} from "./engine.js";

test("la base contiene temas educativos",()=>{
  assert.ok(KNOWLEDGE.length>=25);
  assert.equal(normalize("¿QUÉ es PYTHON?"),"que es python");
});
test("preguntas conocidas responden correctamente",()=>{
  const e=new MiniEngine();
  assert.equal(e.answer("Que tal").topic,"saludo");
  assert.equal(e.answer("¿Qué es Python?").topic,"python");
  assert.equal(e.answer("¿Para qué sirve GitHub?").topic,"github");
  assert.equal(e.answer("¿Cómo se entrena una IA?").topic,"entrenamiento");
});
test("preguntas desconocidas se rechazan sin inventar",()=>{
  for(const q of ["¿Qué es el ADN?","¿Quién es el presidente actual?","¿Cuánto cuesta un coche?","¿Qué tiempo hace hoy?"]){
    const e=new MiniEngine();
    assert.equal(e.answer(q).source,"unknown",q);
  }
});
test("continuar una conversación",()=>{
  const e=new MiniEngine();
  e.answer("¿Qué es Python?");
  assert.match(e.answer("Dame un ejemplo").text,/print/);
  assert.match(e.answer("Explícalo mejor").text,/automatizar/i);
});
test("respuestas personalizadas funcionan y tienen prioridad",()=>{
  const e=new MiniEngine([["Hola","Bienvenido a mi proyecto"],["Que es Mallorca","Es una isla"]]);
  assert.equal(e.answer("Hola").text,"Bienvenido a mi proyecto");
  assert.equal(e.answer("¿Qué es Mallorca?").text,"Es una isla");
  e.setCustom([]);
  assert.notEqual(e.answer("Hola").text,"Bienvenido a mi proyecto");
});
