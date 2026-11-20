import test from "node:test";
import assert from "node:assert/strict";
import {chooseResponse} from "./hybrid.js";

const accepted={answerSafely:()=>({accepted:true,safeAnswer:"Respuesta de la red neuronal."})};
const rejected={answerSafely:()=>({accepted:false,safeAnswer:"Todavía no sé"})};

test("sin modo neuronal se conservan todas las respuestas anteriores",()=>{
  const base={text:"Respuesta clásica",source:"knowledge",topic:"python",score:.75};
  assert.equal(chooseResponse("python",base,null),base);
});
test("las respuestas personales enseñadas tienen prioridad absoluta",()=>{
  const custom={text:"Mi respuesta enseñada",source:"custom",topic:null,score:1};
  assert.equal(chooseResponse("hola",custom,accepted),custom);
});
test("continuar explicaciones no se desvía a la red neuronal",()=>{
  const context={text:"Ejemplo: print('Hola')",source:"context",topic:"python"};
  assert.equal(chooseResponse("Dame un ejemplo",context,accepted),context);
});
test("usa el clasificador solo cuando acepta la pregunta",()=>{
  const base={text:"Base",source:"knowledge",score:.7};
  assert.deepEqual(chooseResponse("Qué es Python",base,accepted),{
    text:"Respuesta de la red neuronal.",source:"neural",topic:null
  });
});
test("con incertidumbre solo se usan respuestas preparadas muy claras",()=>{
  const highlySimilar={text:"Python es un lenguaje",source:"knowledge",topic:"python",score:.95};
  assert.equal(chooseResponse("Qué es Python",highlySimilar,rejected),highlySimilar);
  const weak={text:"Al azar",source:"knowledge",topic:"ia",score:.67};
  assert.equal(chooseResponse("Qué es el ADN",weak,rejected).source,"unknown");
  assert.equal(chooseResponse("Qué es el ADN",{text:"No lo sé",source:"unknown"},rejected).source,"unknown");
});
