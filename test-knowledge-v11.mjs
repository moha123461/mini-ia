import test from "node:test";
import assert from "node:assert/strict";
import {KNOWLEDGE,MiniEngine} from "./engine.js";
import {EXTRA_KNOWLEDGE} from "./extra-knowledge.js";

test("60 temas en total, incluidos los nuevos conceptos educativos",()=>{
  assert.equal(KNOWLEDGE.length,60);
  assert.equal(EXTRA_KNOWLEDGE.length,30);
  assert.equal(new Set(KNOWLEDGE.map(x=>x.id)).size,60);
});
test("150 formulaciones nuevas recuperan exactamente su respuesta",()=>{
  const engine=new MiniEngine();
  for(const topic of EXTRA_KNOWLEDGE){
    assert.equal(topic.q.length,5,topic.id);
    for(const question of topic.q){
      const result=engine.answer(question);
      assert.equal(result.text,topic.answer,question);
      assert.equal(result.source,"knowledge",question);
    }
  }
});
test("respuestas que el usuario enseñó mantienen prioridad",()=>{
  const engine=new MiniEngine([["que es html","HTML es una respuesta corregida por mí"]]);
  assert.equal(engine.answer("¿Qué es HTML?").text,"HTML es una respuesta corregida por mí");
  assert.equal(engine.answer("¿Qué es HTML?").source,"custom");
});
test("mantiene ejemplos explicativos y rechaza varios temas no disponibles",()=>{
  const engine=new MiniEngine();
  assert.equal(engine.answer("Qué es HTTPS").topic,"https");
  assert.match(engine.answer("Dame un ejemplo").text,/https/i);
  for(const q of ["¿Qué es el ADN?","¿Cuál es la capital de Francia?","¿Quién es presidente de España?"]){
    assert.equal(engine.answer(q).source,"unknown",q);
  }
});
