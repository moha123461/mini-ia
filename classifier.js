// Mini IA 9.0: clasificador neuronal en el navegador.
// Arquitectura: TF-IDF char_wb 2-5 -> Linear -> ReLU -> Linear -> Softmax.
// Igual que entrenar_v9_clasificador.py. No es un modelo generativo.
function norm(text){
  return String(text||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().trim().replace(/\s+/g," ");
}
function ngrams(text){
  const bag=new Map();
  for(const word of norm(text).split(" ")){
    if(!word)continue;
    const padded=" "+word+" ";
    for(let n=2;n<=5;n++){
      for(let start=0;start<=padded.length-n;start++){
        const gram=padded.slice(start,start+n);
        bag.set(gram,(bag.get(gram)||0)+1);
      }
    }
  }
  return bag;
}
function finiteArray(value,length,label){
  if(!Array.isArray(value)||value.length!==length)throw Error("Dimensiones incorrectas: "+label);
  for(const item of value)if(typeof item!=="number"||!Number.isFinite(item))throw Error("Número inválido: "+label);
  return Float32Array.from(value);
}
// Formato compacto: los mismos pesos Float32, empaquetados sin redondeo adicional.
function unpackWeights(model,G,H,A){
  if(model.packed_weight_format!=="float32-le"||typeof model.packed_weights!=="string")
    throw Error("Formato de pesos comprimidos no compatible.");
  const sizes=[H*G,H,A*H,A];
  const total=sizes.reduce((sum,n)=>sum+n,0);
  let raw;
  try{raw=atob(model.packed_weights);}catch{throw Error("Datos del modelo corruptos.");}
  if(raw.length!==total*4)throw Error("Tamaño de los pesos incorrecto.");
  const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  const view=new DataView(bytes.buffer);
  let offset=0;
  const take=length=>{
    const array=new Float32Array(length);
    for(let i=0;i<length;i++)array[i]=view.getFloat32((offset++)*4,true);
    if(array.some(v=>!Number.isFinite(v)))throw Error("Pesos no válidos.");
    return array;
  };
  return {
    fc1_weight:take(sizes[0]),fc1_bias:take(sizes[1]),
    fc2_weight:take(sizes[2]),fc2_bias:take(sizes[3])
  };
}
// Palabras frecuentes: no deciden por sí solas el tema de una pregunta.
const COMMON_WORDS=new Set([
  "a","al","algo","con","como","cual","cuando","cuanto","de","del","dime",
  "el","ella","en","eres","es","esta","estoy","explica","explicame","hacer",
  "haces","hace","hay","la","las","le","lo","los","me","mi","mis","nos","o",
  "para","por","puedo","puedes","que","quien","quiero","se","ser","si",
  "sirve","sobre","su","sus","te","tengo","tiene","tienes","tu","tus",
  "un","una","unas","uno","unos","y","yo","define","sabes","saber",
  "dias","dia","buenos","buenas",
  // Fórmulas habituales de la pregunta; no son por sí solas un tema nuevo.
  "significa","usaron","hicieron","sitio"
]);
function importantWords(text){
  return (norm(text).match(/[a-z0-9]+/g)||[])
    .filter(word=>word.length>=2&&!COMMON_WORDS.has(word));
}
function stem(word){return word.length>4?word.slice(0,4):word;}
export class NeuralClassifier{
  constructor(data){
    if(data?.format!=="mini-ia-clasificador-v1")throw Error("El archivo no es un modelo clasificador de Mini IA 9.0.");
    const G=data.grams?.length,H=data.hidden,A=data.answers?.length;
    if(!Number.isInteger(G)||G<2||G>30000||!Number.isInteger(H)||H<1||H>512||
       !Number.isInteger(A)||A<2||A>200)throw Error("Tamaño de modelo no compatible.");
    if(!Array.isArray(data.grams)||!data.grams.every(x=>typeof x==="string"&&x.length>=2&&x.length<=5)||
       new Set(data.grams).size!==G)throw Error("Vocabulario inválido.");
    if(!Array.isArray(data.answers)||!data.answers.every(x=>typeof x==="string"&&x.length>0&&x.length<=1200))throw Error("Respuestas inválidas.");
    if(G*H>3000000)throw Error("Modelo demasiado grande para el navegador.");
    this.grams=data.grams;
    this.answers=data.answers;
    this.hidden=H;
    this.granIndex=new Map(this.grams.map((x,i)=>[x,i]));
    this.idf=finiteArray(data.idf,G,"idf");
    if(this.idf.some(v=>v<=0))throw Error("IDF inválido.");
    const w=data.weights??unpackWeights(data,G,H,A);
    if(!w||typeof w!=="object")throw Error("Faltan los pesos de la red neuronal.");
    const safe=(v,n,name)=>v instanceof Float32Array?
      (v.length===n&&!v.some(x=>!Number.isFinite(x))?v:(()=>{throw Error("Dimensiones incorrectas: "+name);})()):
      finiteArray(v,n,name);
    this.W1=safe(w.fc1_weight,H*G,"fc1_weight");
    this.b1=safe(w.fc1_bias,H,"fc1_bias");
    this.W2=safe(w.fc2_weight,A*H,"fc2_weight");
    this.b2=safe(w.fc2_bias,A,"fc2_bias");
    this.name=data.name||"Red neuronal clasificadora";
    this.baseline=null;
    this.domainTerms=new Set();
    if(data.baseline_questions!==undefined||data.baseline_labels!==undefined){
      if(!Array.isArray(data.baseline_questions)||!Array.isArray(data.baseline_labels)||
         data.baseline_questions.length!==data.baseline_labels.length||
         data.baseline_questions.length>5000||!data.baseline_questions.length)
         throw Error("Ejemplos de similitud inválidos.");
      const validLabel=x=>Number.isInteger(x)&&x>=0&&x<A;
      if(!data.baseline_questions.every(x=>typeof x==="string"&&x.length<=500)||!data.baseline_labels.every(validLabel))
        throw Error("Etiquetas de similitud inválidas.");
      this.baseline=data.baseline_questions.map((q,i)=>({
        question:q,label:data.baseline_labels[i],vector:this.vectorize(q)
      }));
      // Anclajes de contenido conocidos, solo desde datos de entrenamiento.
      for(const phrase of [...data.baseline_questions,...this.answers])
        for(const word of importantWords(phrase))this.domainTerms.add(stem(word));
    }
  }
  vectorize(text){
    const features=ngrams(text);
    const x=new Float32Array(this.grams.length);
    let lengthSquared=0;
    for(const [gram,count] of features){
      const index=this.granIndex.get(gram);
      if(index===undefined)continue;
      const weight=(1+Math.log(count))*this.idf[index];
      x[index]=weight;lengthSquared+=weight*weight;
    }
    if(lengthSquared>0){
      const size=Math.sqrt(lengthSquared);
      for(let i=0;i<x.length;i++)x[i]/=size;
    }
    return x;
  }
  predict(text){
    if(!String(text||"").trim())throw Error("Escribe una pregunta.");
    if([...text].length>350)throw Error("La pregunta es demasiado larga.");
    const x=this.vectorize(text);
    const H=this.hidden,G=x.length,A=this.answers.length;
    const hidden=new Float32Array(H);
    for(let j=0;j<H;j++){
      let sum=this.b1[j],offset=j*G;
      for(let k=0;k<G;k++)if(x[k])sum+=this.W1[offset+k]*x[k];
      hidden[j]=Math.max(0,sum);
    }
    const logits=new Float32Array(A);
    let best=0;
    for(let i=0;i<A;i++){
      let sum=this.b2[i],offset=i*H;
      for(let j=0;j<H;j++)sum+=this.W2[offset+j]*hidden[j];
      logits[i]=sum;
      if(sum>logits[best])best=i;
    }
    const max=Math.max(...logits);
    let total=0;
    for(let i=0;i<A;i++){logits[i]=Math.exp(logits[i]-max);total+=logits[i];}
    const confidence=logits[best]/total;
    let nearest=null;
    if(this.baseline){
      let bestSim=-1,bestPair=null;
      for(const pair of this.baseline){
        let sim=0;
        for(let j=0;j<G;j++)if(x[j])sim+=x[j]*pair.vector[j];
        if(sim>bestSim){bestSim=sim;bestPair=pair;}
      }
      nearest={answer:this.answers[bestPair.label],question:bestPair.question,score:bestSim};
    }
    return {answer:this.answers[best],category:best,score:confidence,
      matchedFeatures:x.some(v=>v!==0),nearest};
  }
  // Decisión prudente: no altera el resultado crudo de la red neuronal.
  // No garantiza detectar todos los temas fuera de la distribución.
  answerSafely(question){
    const raw=this.predict(question);
    let reason=null;
    const semanticWords=importantWords(question);
    const unseen=semanticWords.filter(word=>!this.domainTerms.has(stem(word)));
    const similarity=raw.nearest?.score??0;
    // Estos límites son reglas conservadoras de demostración, NO calibración.
    if(!this.baseline)reason="Este archivo no incluye ejemplos de entrenamiento para verificar el tema.";
    else if(!raw.matchedFeatures)reason="No he reconocido patrones de esta pregunta.";
    else if(unseen.length)reason="La pregunta incluye conceptos que todavía no conozco.";
    else if(similarity<0.43)reason="La pregunta se parece poco a los ejemplos que conozco.";
    else if(raw.score<0.48)reason="La red neuronal no ha identificado una respuesta suficientemente clara.";
    return {
      ...raw,accepted:reason===null,reason,
      safeAnswer:reason?"Todavía no sé responder esa pregunta con suficiente seguridad.":raw.answer,
      unknownWords:unseen
    };
  }
}
