import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {BrowserTransformer} from "./transformer.js";

const file=new URL("./models/mi-transformer-web.json",import.meta.url);
const model=JSON.parse(readFileSync(file,"utf8"));

test("El archivo publicado contiene mi Transformer real de Kaggle",()=>{
  assert.equal(model.format,"mini-transformer-pytorch-v1");
  assert.equal(model.context,48);
  assert.equal(model.hidden,48);
  assert.equal(model.heads,4);
  assert.equal(model.tensor.length,16);
  assert.equal(model.vocab.length,39);
  assert.equal(model.tensor.reduce((total,t)=>total+t.length,0),25047);
});
test("Se cargan los pesos reales y calcula probabilidades sin errores",()=>{
  const transformer=new BrowserTransformer(model);
  const tokens=transformer.encode("La ");
  const logits=transformer.logits(tokens);
  assert.equal(logits.length,model.vocab.length);
  assert.ok(logits.every(Number.isFinite));
  assert.ok(Math.max(...logits)>Math.min(...logits));
});
test("El modelo publicado puede generar caracteres sin servidor",async()=>{
  const transformer=new BrowserTransformer(model);
  const result=await transformer.generate("La ",{length:8,temperature:0.6});
  assert.equal([...result].length,8);
  assert.ok([...result].every(char=>model.vocab.includes(char)));
});
test("El modelo original no contiene formato de diálogo por defecto",()=>{
  const transformer=new BrowserTransformer(model);
  assert.throws(()=>transformer.encode("Usuario: Hola\nIA:"),/desconocidos/);
});
