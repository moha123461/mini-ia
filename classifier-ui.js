import {NeuralClassifier,loadDefaultClassifier} from "./model-loader.js?v=10.0";

// El modelo no se almacena en la web: se importa desde el navegador.
// Nunca se envían las preguntas ni los pesos a una API.
const $=id=>document.getElementById(id);
let classifier=null;
let requestId=0;
function setStatus(message,error=false){
  const el=$("classifier-status");
  el.textContent=message;
  el.style.color=error?"#ffaaa9":"#b8eedf";
}
function useModel(model,origin){
  classifier=model;
  $("classifier-submit").disabled=false;
  $("classifier-model").textContent=origin+" · "+model.name+
    " · "+model.answers.length+" respuestas · "+model.grams.length+" características";
  setStatus("Modelo neuronal cargado. Ya puedes escribir preguntas.");
}
async function loadDefault(){
  const id=++requestId;
  setStatus("Cargando automáticamente tu clasificador neuronal de Kaggle...");
  try{
    const candidate=await loadDefaultClassifier();
    if(id!==requestId)return;
    useModel(candidate,"Modelo guardado en GitHub");
  }catch(err){
    if(id!==requestId)return;
    setStatus("No se pudo cargar automáticamente: "+err.message+". Puedes elegir un JSON manualmente.",true);
  }
}
$("classifier-file").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  const id=++requestId;
  $("classifier-submit").disabled=true;
  try{
    if(file.size>9_000_000)throw Error("El archivo supera 9 MB.");
    setStatus("Cargando tu archivo de pesos...");
    const model=new NeuralClassifier(JSON.parse(await file.text()));
    if(id!==requestId)return;
    useModel(model,"Modelo importado desde este dispositivo");
  }catch(err){
    if(id!==requestId)return;
    $("classifier-submit").disabled=!classifier;
    setStatus("No se pudo abrir el modelo: "+err.message,true);
  }
});
loadDefault();
$("classifier-form").addEventListener("submit",e=>{
  e.preventDefault();
  if(!classifier){setStatus("Primero importa el JSON de Kaggle.",true);return;}
  const question=$("classifier-question").value.trim();
  if(!question){setStatus("Escribe una pregunta.",true);return;}
  try{
    const result=classifier.answerSafely(question);
    const box=$("classifier-result");
    box.replaceChildren();
    const main=document.createElement("p");
    const strong=document.createElement("strong");
    strong.textContent=result.accepted?"Respuesta sugerida: ":"Respuesta del modo prudente: ";
    const answer=document.createElement("span");
    answer.textContent=result.safeAnswer;
    main.append(strong,answer);
    box.appendChild(main);
    const desc=document.createElement("p");
    desc.className="note";
    desc.textContent="Clase elegida: "+(result.category+1)+"/"+classifier.answers.length+
      " · Valor Softmax: "+(result.score*100).toFixed(1)+" % (no mide fiabilidad real).";
    box.appendChild(desc);
    if(!result.accepted){
      const explanation=document.createElement("p");
      explanation.className="note";
      explanation.textContent=result.reason+
        " La red neuronal había seleccionado «"+result.answer+
        "», pero no podemos confiar en esa respuesta para este tema.";
      box.appendChild(explanation);
      const teach=document.createElement("button");
      teach.type="button";
      teach.className="softbutton";
      teach.textContent="Enseñar una respuesta al chat principal";
      teach.addEventListener("click",()=>{
        const panel=$("teach");
        panel.open=true;
        $("new-question").value=question;
        panel.scrollIntoView({behavior:"smooth",block:"center"});
        $("new-answer").focus();
      });
      box.appendChild(teach);
    }
    if(result.nearest){
      const other=document.createElement("p");
      const label=document.createElement("strong");
      label.textContent="Respuesta por similitud: ";
      const text=document.createElement("span");
      text.textContent=result.nearest.answer;
      other.append(label,text);
      box.appendChild(other);
      const q=document.createElement("p");
      q.className="note";
      q.textContent="Ejemplo más cercano: «"+result.nearest.question+"».";
      box.appendChild(q);
    }
    const warning=document.createElement("p");
    warning.className="note";
    warning.textContent=result.accepted?
      "Esta respuesta pertenece a una de 30 categorías conocidas y aun así podría estar equivocada. No es una IA generativa.":
      "Enseñar al chat principal añade una respuesta local, pero NO reentrena los pesos de esta red neuronal.";
    box.appendChild(warning);
    setStatus(result.accepted?
      "Respuesta neuronal obtenida con el modo prudente.":
      "Pregunta desconocida o incierta: el modo prudente no muestra la predicción como respuesta.");
  }catch(err){setStatus("Error: "+err.message,true);}
});
for(const button of document.querySelectorAll("[data-classifier-example]")){
  button.addEventListener("click",()=>{
    $("classifier-question").value=button.dataset.classifierExample;
    $("classifier-question").focus();
  });
}
