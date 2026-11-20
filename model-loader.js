// Un único modelo neuronal compartido por el chat y el laboratorio.
// No envía preguntas a ningún servidor; solo descarga pesos públicos.
import {NeuralClassifier} from "./classifier.js";

const MODEL_PATH="./models/mi-ia-v9-clasificador.json";
let loading=null;

export function loadDefaultClassifier(){
  if(!loading){
    loading=(async()=>{
      const response=await fetch(MODEL_PATH,{cache:"no-cache"});
      if(!response.ok)throw Error("No se pudo descargar el modelo: HTTP "+response.status);
      const text=await response.text();
      if(text.length>5_000_000)throw Error("Modelo demasiado grande.");
      return new NeuralClassifier(JSON.parse(text));
    })().catch(error=>{
      loading=null; // Permite reintentar si falla la red.
      throw error;
    });
  }
  return loading;
}

export {NeuralClassifier};
