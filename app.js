import {MiniEngine, KNOWLEDGE, normalize} from "./engine.js";
import {loadDefaultClassifier} from "./model-loader.js?v=10.0";
import {chooseResponse} from "./hybrid.js?v=10.0";

// Todo se ejecuta en el navegador. No se envían mensajes a un servidor.
const KEY_EXTRA="mini-ia-v6-conocimientos";
const KEY_CHAT="mini-ia-v6-chat";
const KEY_NEURAL="mini-ia-neural-chat-enabled";
function read(key,fallback){
  try{const raw=localStorage.getItem(key);return raw===null?fallback:JSON.parse(raw);}catch{return fallback;}
}
function save(key,value){
  try{localStorage.setItem(key,JSON.stringify(value));return true;}catch{return false;}
}
function validEntries(input){
  if(!Array.isArray(input))return [];
  return input.filter(item=>Array.isArray(item)&&item.length===2
     &&typeof item[0]==="string"&&typeof item[1]==="string"
     &&item[0].trim().length>0&&item[0].length<=200
     &&item[1].trim().length>0&&item[1].length<=1000)
     .map(([q,a])=>[q.trim(),a.trim()]).slice(-300);
}
let learned=validEntries(read(KEY_EXTRA,read("mini-ia-v5-conocimientos",[])));
const engine=new MiniEngine(learned);
let history=read(KEY_CHAT,read("mini-ia-v5-chat",[]));
if(!Array.isArray(history))history=[];
history=history.filter(m=>m&&["user","bot"].includes(m.role)&&typeof m.text==="string").slice(-80);
const $=id=>document.getElementById(id);
const messages=$("messages"),input=$("message"),teachStatus=$("teach-status"),suggestions=$("suggestions");
const welcome="¡Hola! Soy Mini IA 11.0. Puedo explicar 60 temas de programación e informática. También puedes activar la red neuronal experimental de 30 categorías o enseñarme nuevas respuestas.";
let lastUnknown="";
let neuralWanted=false;
let neuralClassifier=null;
let neuralRequest=0;
function neuralStatus(message){
  $("neural-chat-status").textContent=message;
}
async function enableNeuralChat(){
  const request=++neuralRequest;
  neuralStatus("Cargando red neuronal entrenada...");
  try{
    const model=await loadDefaultClassifier();
    if(request!==neuralRequest||!neuralWanted)return;
    neuralClassifier=model;
    neuralStatus("Red neuronal activada · 30 categorías. Tus respuestas personales tienen prioridad.");
  }catch(err){
    if(request!==neuralRequest||!neuralWanted)return;
    neuralClassifier=null;
    neuralStatus("No se pudo cargar la red neuronal: "+err.message+". Seguirá funcionando el chat clásico.");
  }
}
$("neural-mode").addEventListener("change",()=>{
  neuralWanted=$("neural-mode").checked;
  save(KEY_NEURAL,neuralWanted);
  if(neuralWanted)enableNeuralChat();
  else {
    neuralRequest++;
    neuralClassifier=null;
    neuralStatus("Modo clásico: utiliza respuestas preparadas y las que le enseñes.");
  }
});
neuralWanted=read(KEY_NEURAL,false)===true;
$("neural-mode").checked=neuralWanted;
if(neuralWanted)enableNeuralChat();
else neuralStatus("Modo clásico: utiliza respuestas preparadas y las que le enseñes.");

function storeHistory(){save(KEY_CHAT,history);}
function add(role,text,remember=true,source=""){
  const bubble=document.createElement("div");
  bubble.className="bubble "+role;
  const label=document.createElement("div");
  label.className="byline";
  label.textContent=role==="user"?"Tú":source==="neural"?"✦ Mini IA · Red neuronal":"✦ Mini IA";
  const body=document.createElement("div");
  body.textContent=text;
  bubble.append(label,body);
  if(role==="bot"&&source==="unknown"){
    const help=document.createElement("button");
    help.type="button";help.className="inline-help";
    help.textContent="Enseñarme esta respuesta";
    const thisUnknown=lastUnknown;
    help.addEventListener("click",()=>{
      $("teach").open=true;
      $("new-question").value=thisUnknown;
      $("new-question").focus();
      $("teach").scrollIntoView({behavior:"smooth",block:"center"});
    });
    bubble.append(help);
  }
  messages.appendChild(bubble);
  messages.scrollTop=messages.scrollHeight;
  if(remember){history.push({role,text});history=history.slice(-80);storeHistory();}
}
function renderHistory(){
  messages.replaceChildren();
  if(!history.length){add("bot",welcome,false);}
  else for(const h of history)add(h.role,h.text,false);
}
function showSuggestions(contextual=false){
  suggestions.replaceChildren();
  const options=contextual?["Explícalo mejor","Dame un ejemplo","Qué es HTML","Qué es Python"]:
    ["Hola","Qué es HTML","Qué es DNS","Qué es una IA","Cómo se entrena una IA"];
  for(const label of options){
    const b=document.createElement("button");
    b.className="chip";b.type="button";b.textContent=label;
    b.addEventListener("click",()=>send(label));
    suggestions.appendChild(b);
  }
}
function send(text){
  const question=text.trim().slice(0,350);
  if(!question)return;
  add("user",question);
  const base=engine.answer(question);
  const result=neuralWanted?chooseResponse(question,base,neuralClassifier):base;
  if(result.source==="neural"||result.source==="unknown")engine.lastTopic=null;
  lastUnknown=result.source==="unknown"?question:"";
  add("bot",result.text,true,result.source);
  showSuggestions(Boolean(result.topic));
  input.value="";
  input.focus();
}
function refreshLearning(){
  $("knowledge-count").textContent=KNOWLEDGE.length+" temas · "+learned.length+" respuestas tuyas";
  $("learned-count").textContent=learned.length;
  const list=$("learned-list");
  list.replaceChildren();
  if(!learned.length){
    const p=document.createElement("p");p.className="note";p.textContent="Todavía no has añadido respuestas personales.";list.appendChild(p);
    return;
  }
  learned.forEach(([q,a],index)=>{
    const item=document.createElement("div");item.className="learned-item";
    const text=document.createElement("div");text.className="learned-text";
    const strong=document.createElement("strong");strong.textContent=q;
    const small=document.createElement("span");small.textContent=a;
    text.append(strong,small);
    const remove=document.createElement("button");
    remove.type="button";remove.className="softbutton";
    remove.textContent="Eliminar";remove.setAttribute("aria-label","Eliminar respuesta: "+q);
    remove.addEventListener("click",()=>{
      learned.splice(index,1);
      engine.setCustom(learned);save(KEY_EXTRA,learned);
      teachStatus.textContent="Respuesta eliminada.";refreshLearning();
    });
    item.append(text,remove);list.appendChild(item);
  });
}
$("chat-form").addEventListener("submit",e=>{e.preventDefault();send(input.value);});
$("clear").addEventListener("click",()=>{
  history=[];engine.lastTopic=null;save(KEY_CHAT,history);renderHistory();showSuggestions();input.focus();
});
$("teach-form").addEventListener("submit",e=>{
  e.preventDefault();
  const q=$("new-question").value.trim(),a=$("new-answer").value.trim();
  if(!q||!a||q.length>200||a.length>1000)return;
  const old=learned.findIndex(([p])=>normalize(p)===normalize(q));
  if(old>=0)learned.splice(old,1);
  learned.push([q,a]);learned=learned.slice(-300);
  engine.setCustom(learned);
  const ok=save(KEY_EXTRA,learned);
  e.target.reset();refreshLearning();
  teachStatus.textContent=ok?"Respuesta guardada en este navegador. ¡Pruébala en el chat!":
    "Respuesta añadida para esta sesión; el navegador no permitió guardarla.";
});
function download(text,name,type){
  const blob=new Blob([text],{type});
  const url=URL.createObjectURL(blob);
  const a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
}
$("export-knowledge").addEventListener("click",()=>{
  download(JSON.stringify({format:"mini-ia-6",created:new Date().toISOString(),knowledge:learned},null,2),
    "mini-ia-mis-respuestas.json","application/json");
  teachStatus.textContent="Copia descargada. El archivo contiene tus preguntas y respuestas personales.";
});
$("export-chat").addEventListener("click",()=>{
  const lines=history.map(m=>(m.role==="user"?"Tú: ":"Mini IA: ")+m.text);
  download(lines.join("\n\n")||"Sin mensajes.","mini-ia-conversacion.txt","text/plain;charset=utf-8");
});
$("import-knowledge").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  try{
    if(file.size>250000)throw Error("El archivo es demasiado grande.");
    const contents=JSON.parse(await file.text());
    const entries=validEntries(Array.isArray(contents)?contents:contents?.knowledge);
    if(!entries.length)throw Error("No hay respuestas válidas en ese archivo.");
    const map=new Map(learned.map(([q,a])=>[normalize(q),[q,a]]));
    for(const [q,a] of entries)map.set(normalize(q),[q,a]);
    learned=[...map.values()].slice(-300);
    engine.setCustom(learned);save(KEY_EXTRA,learned);
    refreshLearning();
    teachStatus.textContent="Importadas "+entries.length+" respuestas. Las preguntas iguales se han actualizado.";
  }catch(err){teachStatus.textContent="No se pudo importar: "+err.message;}
  finally{e.target.value="";}
});
$("clear-knowledge").addEventListener("click",()=>{
  if(!learned.length)return;
  if(!confirm("¿Borrar todas las respuestas que has enseñado a Mini IA en este navegador?"))return;
  learned=[];engine.setCustom([]);save(KEY_EXTRA,learned);
  teachStatus.textContent="Conocimientos personales eliminados.";refreshLearning();
});
refreshLearning();renderHistory();showSuggestions();
