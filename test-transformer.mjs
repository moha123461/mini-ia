import test from "node:test";
import assert from "node:assert/strict";
import {BrowserTransformer} from "./transformer.js";

function fakeModel(){
  const n=3,h=48,f=96,c=48;
  const names=[
    "emb_palabra.weight","emb_posicion.weight",
    "transformer.layers.0.self_attn.in_proj_weight",
    "transformer.layers.0.self_attn.in_proj_bias",
    "transformer.layers.0.self_attn.out_proj.weight",
    "transformer.layers.0.self_attn.out_proj.bias",
    "transformer.layers.0.linear1.weight",
    "transformer.layers.0.linear1.bias",
    "transformer.layers.0.linear2.weight",
    "transformer.layers.0.linear2.bias",
    "transformer.layers.0.norm1.weight",
    "transformer.layers.0.norm1.bias",
    "transformer.layers.0.norm2.weight",
    "transformer.layers.0.norm2.bias",
    "salida.weight","salida.bias"
  ];
  const sizes=[n*h,c*h,3*h*h,3*h,h*h,h,f*h,f,h*f,h,h,h,h,h,n*h,n];
  const weights=Object.fromEntries(names.map((name,i)=>[name,Array(sizes[i]).fill(0)]));
  for(const name of ["norm1.weight","norm2.weight"]) weights["transformer.layers.0."+name].fill(1);
  return {format:"mini-transformer-pytorch-v1",hidden:h,heads:4,feedforward:f,context:c,vocab:["a","b","c"],weights};
}
test("el Transformer carga pesos y calcula los logits",()=>{
  const model=new BrowserTransformer(fakeModel());
  const logits=model.logits(model.encode("ab"));
  assert.equal(logits.length,3);
  assert.ok(logits.every(Number.isFinite));
});
test("la generación crea nuevos caracteres sin API",async()=>{
  const model=new BrowserTransformer(fakeModel());
  const text=await model.generate("ab",{length:4});
  assert.equal(text.length,4);
  assert.match(text,/^[abc]+$/);
});
test("se rechazan pesos corruptos y caracteres desconocidos",()=>{
  assert.throws(()=>new BrowserTransformer({...fakeModel(),heads:8}),/arquitectura/);
  assert.throws(()=>new BrowserTransformer({...fakeModel(),weights:{}}),/Falta peso/);
  const model=new BrowserTransformer(fakeModel());
  assert.throws(()=>model.encode("¿"),/desconocidos/);
});
