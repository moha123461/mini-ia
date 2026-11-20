import {BrowserTransformer} from "./transformer.js";
// Laboratorio opcional: no modifica el chat de recuperación de respuestas.
const $=id=>document.getElementById(id);
let transformer=null;
let abort=null;
let loadVersion=0;
const BUNDLED_MODEL="./models/mi-transformer-web.json";
function status(text,error=false){
  $("transformer-status").textContent=text;
  $("transformer-status").style.color=error?"#ffaaa9":"#b8eedf";
}
function useModel(model,description){
  const candidate=new BrowserTransformer(model);
  transformer=candidate;
  $("transformer-generate").disabled=false;
  $("transformer-source").textContent=description+" · "+candidate.name+" · "+candidate.origin;
  // Los modelos entrenados con texto libre pueden no conocer «Usuario:».
  for(const btn of document.querySelectorAll("[data-try-transformer]")){
    try{candidate.encode(btn.dataset.tryTransformer);btn.disabled=false;btn.title="";}
    catch{btn.disabled=true;btn.title="Este ejemplo no existe en el vocabulario del modelo activo.";}
  }
  status("Modelo neuronal cargado: puedes generar texto con sus pesos reales.");
}
$("transformer-file").addEventListener("change",async event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  const version=++loadVersion;
  if(abort){abort.abort();}
  $("transformer-generate").disabled=true;
  try{
    if(file.size>1_500_000)throw Error("El archivo es demasiado grande.");
    status("Leyendo el modelo elegido...");
    const data=JSON.parse(await file.text());
    if(version!==loadVersion)return;
    useModel(data,"Modelo importado por ti");
  }catch(err){
    if(version!==loadVersion)return;
    status("No se pudo abrir el archivo: "+err.message,true);
    $("transformer-generate").disabled=!transformer;
  }
});
async function loadBundled(){
  const version=++loadVersion;
  status("Cargando automáticamente tu Transformer entrenado en Kaggle...");
  try{
    const response=await fetch(BUNDLED_MODEL,{cache:"no-cache"});
    if(!response.ok)throw Error("HTTP "+response.status);
    const json=await response.text();
    if(json.length>1_500_000)throw Error("Modelo demasiado grande");
    const parsed=JSON.parse(json);
    if(version!==loadVersion)return;
    useModel(parsed,"Modelo integrado en Mini IA");
  }catch(err){
    if(version!==loadVersion)return;
    status("No se pudo cargar automáticamente: "+err.message+". Puedes importar el JSON manualmente.",true);
  }
}
loadBundled();
$("transformer-form").addEventListener("submit",async event=>{
  event.preventDefault();
  if(!transformer)return status("Primero importa un modelo JSON.",true);
  if(abort)return;
  abort=new AbortController();
  const start=$("transformer-prompt").value;
  const count=Number($("transformer-length").value);
  const temp=Number($("transformer-temperature").value);
  $("transformer-generate").disabled=true;
  $("transformer-cancel").disabled=false;
  $("transformer-output").textContent=start;
  status("Generando... (cada carácter lo predice la red neuronal)");
  try{
    const appended=await transformer.generate(start,{
      length:count,temperature:temp,signal:abort.signal,
      progress:(text,index,total)=>{
        $("transformer-output").textContent=start+text;
        status("Generados "+index+" de "+total+" caracteres...");
      }
    });
    $("transformer-output").textContent=start+appended;
    status("Texto generado por el Transformer. Puede tener errores: es un modelo educativo.");
  }catch(err){
    if(err.message==="Generación cancelada.")status("Generación cancelada.");
    else status(err.message,true);
  }finally{
    abort=null;$("transformer-generate").disabled=!transformer;
    $("transformer-cancel").disabled=true;
  }
});
$("transformer-cancel").addEventListener("click",()=>{abort?.abort();});
for(const button of document.querySelectorAll("[data-try-transformer]")){
  button.addEventListener("click",()=>{$("transformer-prompt").value=button.dataset.tryTransformer;});
}
