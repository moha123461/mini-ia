import {BrowserTransformer} from "./transformer.js";
// Laboratorio opcional: no modifica el chat de recuperación de respuestas.
const $=id=>document.getElementById(id);
let transformer=null;
let abort=null;
function status(text,error=false){
  $("transformer-status").textContent=text;
  $("transformer-status").style.color=error?"#ffaaa9":"#b8eedf";
}
$("transformer-file").addEventListener("change",async event=>{
  const file=event.target.files?.[0];
  if(!file)return;
  transformer=null;$("transformer-generate").disabled=true;
  try{
    if(file.size>1_500_000)throw Error("El archivo es demasiado grande.");
    status("Leyendo los pesos del modelo...");
    const parsed=JSON.parse(await file.text());
    transformer=new BrowserTransformer(parsed);
    $("transformer-generate").disabled=false;
    $("transformer-source").textContent="Modelo: "+transformer.name+" · "+transformer.origin;
    status("Transformer cargado. Ya puedes generar texto.");
  }catch(err){
    status("No se pudo abrir el modelo: "+err.message,true);
    $("transformer-source").textContent="";
  }
});
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
