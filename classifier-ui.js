import {NeuralClassifier} from "./classifier.js";

// El modelo no se almacena en la web: se importa desde el navegador.
// Nunca se envían las preguntas ni los pesos a una API.
const $=id=>document.getElementById(id);
let classifier=null;
function setStatus(message,error=false){
  const el=$("classifier-status");
  el.textContent=message;
  el.style.color=error?"#ffaaa9":"#b8eedf";
}
$("classifier-file").addEventListener("change",async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  classifier=null;
  $("classifier-submit").disabled=true;
  $("classifier-result").textContent="Primero carga tu modelo.";
  try{
    if(file.size>9_000_000)throw Error("El archivo supera 9 MB.");
    setStatus("Cargando pesos del clasificador...");
    const text=await file.text();
    const model=new NeuralClassifier(JSON.parse(text));
    classifier=model;
    $("classifier-submit").disabled=false;
    $("classifier-model").textContent=model.name+" · "+model.answers.length+" respuestas · "+model.grams.length+" características";
    setStatus("Modelo neuronal cargado. Ya puedes hacer preguntas.");
  }catch(err){
    $("classifier-model").textContent="";
    setStatus("No se pudo cargar el modelo: "+err.message,true);
  }
});
$("classifier-form").addEventListener("submit",e=>{
  e.preventDefault();
  if(!classifier){setStatus("Primero importa el JSON de Kaggle.",true);return;}
  const question=$("classifier-question").value.trim();
  if(!question){setStatus("Escribe una pregunta.",true);return;}
  try{
    const result=classifier.predict(question);
    const box=$("classifier-result");
    box.replaceChildren();
    const main=document.createElement("p");
    const strong=document.createElement("strong");
    strong.textContent="Respuesta de la red neuronal: ";
    const answer=document.createElement("span");
    answer.textContent=result.answer;
    main.append(strong,answer);
    box.appendChild(main);
    const desc=document.createElement("p");
    desc.className="note";
    desc.textContent="Clase elegida: "+(result.category+1)+"/"+classifier.answers.length+
      " · Valor Softmax: "+(result.score*100).toFixed(1)+" % (no mide fiabilidad real).";
    box.appendChild(desc);
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
    warning.textContent=result.matchedFeatures?
      "Este clasificador siempre elige una de las respuestas conocidas. Puede equivocarse, especialmente si le preguntas algo nuevo.":
      "Aviso: no reconoce ningún patrón de esta pregunta. La respuesta elegida puede ser aleatoria.";
    box.appendChild(warning);
    setStatus("Predicción calculada localmente con tu red neuronal.");
  }catch(err){setStatus("Error: "+err.message,true);}
});
for(const button of document.querySelectorAll("[data-classifier-example]")){
  button.addEventListener("click",()=>{
    $("classifier-question").value=button.dataset.classifierExample;
    $("classifier-question").focus();
  });
}
