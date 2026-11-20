import {EXTRA_KNOWLEDGE} from "./extra-knowledge.js";
// Mini IA - motor local: recuperacion de respuestas, no modelo generativo.
// No conecta a servidores ni usa claves API.
export const KNOWLEDGE = [
 {id:"saludo", q:["hola","buenas","buenos dias","buenas tardes","que tal","hey hola"], answer:"¡Hola! Soy Mini IA. ¿En qué te puedo ayudar?", detail:"Puedo explicarte conceptos básicos de inteligencia artificial y programación.", example:"Prueba con: ¿Qué es Python? o ¿Cómo se entrena una IA?"},
 {id:"despedida",q:["adios","hasta luego","nos vemos","hasta pronto"],answer:"¡Hasta pronto! 👋"},
 {id:"nombre",q:["como te llamas","cual es tu nombre","dime tu nombre","que nombre tienes"],answer:"Me llamo Mini IA. El chat principal usa respuestas preparadas y el laboratorio 9.0 usa una red neuronal entrenada."},
 {id:"identidad",q:["que eres","quien eres","eres una ia","eres un robot","eres una inteligencia artificial"],answer:"Soy Mini IA, un chatbot educativo que busca respuestas en una base de conocimientos local.",detail:"No soy ChatGPT. Esta página usa comparación de textos y respuestas preparadas, no genera respuestas libremente con el Transformer entrenado en Kaggle.",example:"Si preguntas «¿Qué es una red neuronal?», buscaré la respuesta más parecida entre los ejemplos que conozco."},
 {id:"creador",q:["quien te creo","quien te ha creado","como te crearon","quien te hizo","quien te programo","quien te desarrollo"],answer:"Fui desarrollada como un proyecto educativo con Python, JavaScript y GitHub."},
 {id:"sentimientos",q:["tienes sentimientos","puedes sentir","sientes emociones","tienes emociones"],answer:"No tengo sentimientos humanos. Soy un programa."},
 {id:"pensar",q:["puedes pensar","tienes conciencia","eres consciente","piensas como una persona"],answer:"Puedo procesar preguntas y buscar patrones, pero no pienso ni tengo conciencia como una persona."},
 {id:"capacidades",q:["que puedes hacer","en que ayudas","cuales son tus funciones","que sabes hacer","como puedes ayudarme"],answer:"Puedo responder preguntas sencillas sobre tecnología e IA, continuar algunas explicaciones y aprender nuevas respuestas que guardes en este navegador.",detail:"Si no conozco una pregunta, te lo diré. Puedes enseñármela en la sección «Enseñar a Mini IA»."},
 {id:"limites",q:["puedes equivocarte","cometes errores","eres perfecta","sabes todo"],answer:"Sí, puedo equivocarme. Solo conozco un conjunto limitado de respuestas, así que conviene comprobar los datos importantes."},
 {id:"python",q:["que es python","explica python","define python","para que sirve python","hablame de python"],answer:"Python es un lenguaje de programación fácil de leer y muy usado en IA.",detail:"Sirve para automatizar tareas, analizar datos, crear aplicaciones y entrenar modelos de inteligencia artificial.",example:"Por ejemplo, con print('Hola') puedes mostrar texto en pantalla."},
 {id:"ia",q:["que es una ia","que es la inteligencia artificial","define inteligencia artificial","explica ia","que significa ia"],answer:"La inteligencia artificial es un campo de la informática que crea sistemas capaces de realizar tareas relacionadas con el aprendizaje, el lenguaje o el reconocimiento de patrones.",detail:"Algunas IA siguen reglas; otras aprenden patrones a partir de datos, como las redes neuronales.",example:"Por ejemplo, un filtro de correo puede detectar mensajes de spam usando IA."},
 {id:"redes",q:["que es una red neuronal","define red neuronal","explica una red neuronal","como funciona una red neuronal"],answer:"Una red neuronal es un modelo matemático con parámetros ajustables que aprende patrones de los datos.",detail:"Durante el entrenamiento se modifican sus parámetros para reducir los errores en las predicciones.",example:"Una red neuronal puede aprender a distinguir imágenes de gatos y perros a partir de ejemplos."},
 {id:"transformer",q:["que es un transformer","explica transformer","que es un modelo transformer","como funciona un transformer"],answer:"Un Transformer es una arquitectura de redes neuronales muy utilizada para procesar secuencias y textos.",detail:"Utiliza mecanismos de atención para relacionar diferentes partes de una secuencia.",example:"Los modelos de lenguaje modernos suelen usar arquitecturas basadas en Transformers."},
 {id:"entrenamiento",q:["que es entrenar una ia","como se entrena una ia","explica el entrenamiento","como entrenar una red neuronal","que significa entrenar un modelo"],answer:"Entrenar una IA consiste en ajustar los parámetros de un modelo utilizando ejemplos y una medida del error.",detail:"El modelo hace predicciones, calcula cuánto se ha equivocado y modifica sus parámetros para intentar reducir ese error.",example:"Si un modelo predice la siguiente letra de una palabra y falla, el entrenamiento ajusta sus parámetros."},
 {id:"datos",q:["que es un dato","que son los datos","para que sirven los datos","que son los datos de entrenamiento"],answer:"Los datos son información que un programa puede almacenar, analizar o utilizar para aprender.",detail:"La calidad y diversidad de los datos influyen en el rendimiento de un modelo.",example:"Un conjunto de preguntas y respuestas puede servir como datos de entrenamiento."},
 {id:"tokens",q:["que es un token","que son los tokens","que es tokenizacion","explica tokenizacion"],answer:"Un token es una unidad de texto que un modelo procesa, como una palabra o parte de una palabra.",detail:"La tokenización convierte texto en unidades y luego en identificadores numéricos.",example:"La frase «Hola mundo» puede dividirse en varios tokens según el tokenizador."},
 {id:"sobreajuste",q:["que es sobreajuste","que es overfitting","por que mi ia memoriza","que significa sobreajuste"],answer:"El sobreajuste ocurre cuando un modelo aprende demasiado los ejemplos de entrenamiento y funciona peor con datos nuevos.",detail:"Para detectarlo se comparan resultados de entrenamiento y validación con ejemplos no utilizados para ajustar el modelo.",example:"Si acierta las preguntas repetidas pero falla al cambiar las palabras, puede estar sobreajustado."},
 {id:"algoritmo",q:["que es un algoritmo","define algoritmo","explica algoritmo"],answer:"Un algoritmo es una secuencia de instrucciones para resolver un problema.",example:"Una receta de cocina se parece a un algoritmo: tiene pasos en un orden."},
 {id:"programar",q:["que es programar","que significa programacion","para que sirve programar","que es programacion"],answer:"Programar es escribir instrucciones para que un ordenador realice tareas.",example:"Puedes programar una calculadora o una página web."},
 {id:"javascript",q:["que es javascript","para que sirve javascript","explica javascript"],answer:"JavaScript es un lenguaje de programación que permite crear comportamientos interactivos en páginas web.",detail:"Mini IA utiliza JavaScript para funcionar directamente en tu navegador."},
 {id:"github",q:["que es github","para que sirve github","que son los repositorios de github"],answer:"GitHub es una plataforma para guardar, gestionar y colaborar en proyectos de código usando Git.",detail:"La web de Mini IA está alojada en GitHub Pages."},
 {id:"internet",q:["que es internet","explica internet","como funciona internet"],answer:"Internet es una red mundial que conecta dispositivos y permite intercambiar información."},
 {id:"tecnologia",q:["que es la tecnologia","define tecnologia","explica la tecnologia"],answer:"La tecnología es la aplicación de conocimientos y herramientas para resolver problemas."},
 {id:"chatbot",q:["que es un chatbot","define chatbot","explica que es un chatbot"],answer:"Un chatbot es un programa diseñado para mantener conversaciones mediante texto o voz.",detail:"Puede utilizar reglas, búsqueda de respuestas, modelos de lenguaje o una combinación de métodos."},
 {id:"ordenador",q:["que es un ordenador","define ordenador","que es una computadora"],answer:"Un ordenador es una máquina que procesa datos siguiendo instrucciones."},
 {id:"aprender",q:["que es aprender","define aprendizaje","que significa aprender"],answer:"Aprender es adquirir conocimientos o habilidades mediante experiencia, práctica o estudio."},
 {id:"ciencia",q:["que es la ciencia","define ciencia","explica la ciencia"],answer:"La ciencia investiga el mundo mediante observación, pruebas y razonamiento."},
 {id:"gracias",q:["gracias","muchas gracias","te lo agradezco"],answer:"¡De nada! 😊"},
 {id:"estado",q:["como estas","estas bien","como te va"],answer:"Estoy funcionando correctamente. ¿Qué quieres aprender hoy?"},
 {id:"privacidad",q:["guardas mis mensajes","donde guardas mis datos","que haces con mis mensajes","mis datos son privados"],answer:"Este chat funciona en tu navegador. El historial y las respuestas que añadas se guardan localmente en el dispositivo; no se envían a una API de IA.",detail:"Puedes borrar el historial y los conocimientos añadidos desde esta página. Si compartes el dispositivo, otras personas podrían ver los datos guardados."}
];
KNOWLEDGE.push(...EXTRA_KNOWLEDGE);
export const normalize = (input) => String(input||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[¿?¡!.,;:()[\]{}"'’]/g," ").replace(/\bq\b/g,"que").replace(/\bpq\b/g,"porque").replace(/\s+/g," ").trim();
const stop = new Set(["el","la","los","las","un","una","de","del","y","es","en","por","para","que","quien","me","te","tu","mi","lo","se","a","como","cual","puedes","puedo","algo","esto","eso","sobre","quiero","saber"]);
function charFeatures(s) {
  const bag = new Map();
  for (const word of normalize(s).split(" ")) {
    if(!word) continue;
    const p=" "+word+" ";
    for(let n=2;n<=5;n++) for(let i=0;i<=p.length-n;i++){
      const k=p.slice(i,i+n);bag.set(k,(bag.get(k)||0)+1);
    }
  }
  return bag;
}
function wordFeatures(s){
  const bag=new Map();
  for(const w of normalize(s).split(" ")){
    if(w.length<2||stop.has(w))continue;
    bag.set(w,(bag.get(w)||0)+1);
  }
  return bag;
}
function buildVectors(docs){
  const df=new Map();
  for(const bag of docs)for(const key of bag.keys())df.set(key,(df.get(key)||0)+1);
  const idf=new Map([...df].map(([k,n])=>[k,Math.log((1+docs.length)/(1+n))+1]));
  const toVector=(bag)=> {
    const v=new Map();let size=0;
    for(const [key,tf] of bag){
      if(!idf.has(key))continue;
      const a=(1+Math.log(tf))*idf.get(key);v.set(key,a);size+=a*a;
    }
    size=Math.sqrt(size)||1;
    for(const [k,val] of v)v.set(k,val/size);
    return v;
  };
  return {vectors:docs.map(toVector),toVector};
}
function similarity(a,b){
  let sum=0;for(const [key,x] of a)sum+=x*(b.get(key)||0);
  return sum;
}
export class MiniEngine{
  constructor(custom=[]){this.setCustom(custom);this.lastTopic=null;}
  setCustom(custom){
    this.custom=Array.isArray(custom)?custom.filter(x=>Array.isArray(x)&&x.length===2&&typeof x[0]==="string"&&typeof x[1]==="string"&&x[0].trim()&&x[1].trim()).slice(-300):[];
    this.entries=[];
    // Los datos personales exactos tienen prioridad sobre los generales.
    this.custom.forEach(([q,answer],i)=>this.entries.push({q,answer,id:"custom-"+i,custom:true}));
    KNOWLEDGE.forEach(topic=>topic.q.forEach(q=>this.entries.push({q,answer:topic.answer,id:topic.id,custom:false})));
    this.char=buildVectors(this.entries.map(x=>charFeatures(x.q)));
    this.word=buildVectors(this.entries.map(x=>wordFeatures(x.q)));
  }
  answer(input){
    const question=normalize(input);
    if(!question)return {text:"Escribe una pregunta.",source:"unknown",topic:null};
    const prev=KNOWLEDGE.find(x=>x.id===this.lastTopic);
    if(/^(y )?(dame|pon|un|otro|puedes darme|me das|dime) (un )?ejemplo\b|^(ejemplo|por ejemplo)\b/.test(question)){
      return {text:prev?.example||"¿De qué tema quieres un ejemplo?",source:prev?.example?"context":"unknown",topic:this.lastTopic};
    }
    if(/^(y )?(explicalo|explica mas|cuentame mas|mas detalles|amplia|desarrolla)( un poco| mejor)?\b/.test(question) ||
       /^(y )?para que sirve( eso| esto)?$/.test(question)){
      return {text:prev?.detail||"Dime qué tema quieres que explique con más detalle.",source:prev?.detail?"context":"unknown",topic:this.lastTopic};
    }
    // Comparacion exacta para que las correcciones del usuario tengan prioridad.
    const exact=this.entries.find(entry=>normalize(entry.q)===question);
    if(exact){this.lastTopic=exact.custom?null:exact.id;return {text:exact.answer,source:exact.custom?"custom":"knowledge",topic:this.lastTopic,score:1};}
    const cv=this.char.toVector(charFeatures(question)),wv=this.word.toVector(wordFeatures(question));
    let best={score:0,entry:null};let alternate=0;
    for(let i=0;i<this.entries.length;i++){
      const score=0.55*similarity(cv,this.char.vectors[i])+0.45*similarity(wv,this.word.vectors[i]);
      if(score>best.score){if(best.entry&&best.entry.id!==this.entries[i].id)alternate=Math.max(alternate,best.score);best={score,entry:this.entries[i]};}
      else if(this.entries[i].id!==best.entry?.id)alternate=Math.max(alternate,score);
    }
    // Exigir que haya una palabra de contenido compartida con el ejemplo,
    // salvo coincidencias textuales muy altas. Reduce respuestas fuera de tema.
    const queryWords=wordFeatures(question);
    const matchedWords=best.entry?wordFeatures(best.entry.q):new Map();
    const shared=[...queryWords.keys()].some(w=>matchedWords.has(w));
    // Rechazar preguntas lejanas o ambiguas. La puntuación no es una probabilidad.
    if(!best.entry||best.score<0.52||(!shared&&best.score<0.78)||
       (best.score<0.68&&alternate>best.score-0.045)){
      this.lastTopic=null;
      return {text:"Todavía no sé responder esa pregunta. Puedes enseñarme la respuesta abajo, en «Enseñar a Mini IA».",source:"unknown",topic:null,score:best.score};
    }
    this.lastTopic=best.entry.custom?null:best.entry.id;
    return {text:best.entry.answer,source:best.entry.custom?"custom":"knowledge",topic:this.lastTopic,score:best.score};
  }
}
