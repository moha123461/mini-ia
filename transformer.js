// Mini IA - Inferencia del Transformer de Kaggle en el navegador.
// Mismo modelo: embedding 48, 4 cabezas, FF 96, una capa, contexto 48.
function linear(W,rows,cols,x,bias){
  const y=new Float32Array(rows);
  for(let i=0;i<rows;i++){
    let v=bias?bias[i]:0,off=i*cols;
    for(let j=0;j<cols;j++)v+=W[off+j]*x[j];
    y[i]=v;
  }
  return y;
}
function norm(x,g,b){
  let mean=0,variance=0;
  for(const v of x)mean+=v;
  mean/=x.length;
  for(const v of x)variance+=(v-mean)**2;
  const inv=1/Math.sqrt(variance/x.length+1e-5);
  for(let i=0;i<x.length;i++)x[i]=(x[i]-mean)*inv*g[i]+b[i];
}
const key=n=>"transformer.layers.0."+n;
const tensorNames=[
  "emb_palabra.weight","emb_posicion.weight",key("self_attn.in_proj_weight"),key("self_attn.in_proj_bias"),
  key("self_attn.out_proj.weight"),key("self_attn.out_proj.bias"),key("linear1.weight"),key("linear1.bias"),
  key("linear2.weight"),key("linear2.bias"),key("norm1.weight"),key("norm1.bias"),
  key("norm2.weight"),key("norm2.bias"),"salida.weight","salida.bias"
];
function loadWeights(model){
  if(model?.format!=="mini-transformer-pytorch-v1")throw Error("Formato de modelo incompatible.");
  if(model.hidden!==48||model.heads!==4||model.feedforward!==96||model.context!==48)
    throw Error("El archivo no coincide con la arquitectura del cuaderno.");
  if(!Array.isArray(model.vocab)||model.vocab.length<2||model.vocab.length>300||new Set(model.vocab).size!==model.vocab.length)
    throw Error("Vocabulario inválido.");
  const weights={};
  if(typeof model.data==="string"){
    let bytes;try{bytes=Uint8Array.from(atob(model.data),c=>c.charCodeAt(0));}catch{throw Error("Datos comprimidos corruptos.");}
    if(!Array.isArray(model.tensor))throw Error("Falta la lista de pesos.");
    for(const info of model.tensor){
      if(!tensorNames.includes(info.name)||weights[info.name])throw Error("Peso no reconocido o repetido.");
      if(!Number.isInteger(info.offset)||info.offset<0||!Number.isInteger(info.length)||info.length<0||
         info.offset+info.length>bytes.length||!Number.isFinite(info.scale)||info.scale<=0)throw Error("Peso corrupto.");
      const a=new Float32Array(info.length);
      for(let i=0;i<info.length;i++){
        const b=bytes[info.offset+i];a[i]=(b>127?b-256:b)*info.scale;
      }
      weights[info.name]=a;
    }
  }else if(model.weights&&typeof model.weights==="object"){
    for(const name of tensorNames){
      const values=model.weights[name],arr=[];
      if(!values)throw Error("Falta peso: "+name);
      const unpack=v=>{if(Array.isArray(v))for(const entry of v)unpack(entry);else arr.push(Number(v));};
      unpack(values);weights[name]=Float32Array.from(arr);
    }
  }else throw Error("Archivo sin pesos del modelo.");
  const N=model.vocab.length,H=48,F=96,C=48;
  const dims=[N*H,C*H,3*H*H,3*H,H*H,H,F*H,F,H*F,H,H,H,H,H,N*H,N];
  tensorNames.forEach((name,i)=>{
    if(!weights[name]||weights[name].length!==dims[i]||weights[name].some(v=>!Number.isFinite(v)))
      throw Error("Dimensiones o valores inválidos: "+name);
  });
  return weights;
}
export class BrowserTransformer{
  constructor(model){
    this.W=loadWeights(model);
    this.vocab=model.vocab;
    this.tokenIds=new Map(model.vocab.map((c,i)=>[c,i]));
    this.context=48;
    this.name=model.name||"Modelo importado";
    this.origin=model.origin||"Checkpoint exportado desde Kaggle";
    // No permitir que se generen símbolos usados exclusivamente para relleno.
    this.excludeIds=new Set((Array.isArray(model.exclude_tokens)?model.exclude_tokens:[])
      .map(char=>this.tokenIds.get(char)).filter(Number.isInteger));
    if(this.excludeIds.size>=this.vocab.length)throw Error("Todos los tokens están excluidos.");
  }
  encode(text){
    const chars=[...text],missing=[...new Set(chars.filter(c=>!this.tokenIds.has(c)))];
    if(missing.length)throw Error("Caracteres desconocidos: "+missing.map(c=>JSON.stringify(c)).join(", ")+". Prueba otro comienzo de texto.");
    return chars.map(c=>this.tokenIds.get(c));
  }
  logits(tokens){
    const L=tokens.length,H=48,F=96;
    if(!L||L>48||tokens.some(x=>!Number.isInteger(x)||x<0||x>=this.vocab.length))
      throw Error("Los tokens no son válidos.");
    const W=this.W,w=n=>W[n],k=n=>W[key(n)],xs=[],qs=[],ks=[],vs=[];
    for(let t=0;t<L;t++){
      const x=new Float32Array(H),e=w("emb_palabra.weight"),p=w("emb_posicion.weight");
      for(let i=0;i<H;i++)x[i]=e[tokens[t]*H+i]+p[t*H+i];
      const qkv=linear(k("self_attn.in_proj_weight"),3*H,H,x,k("self_attn.in_proj_bias"));
      xs.push(x);qs.push(qkv.subarray(0,H));ks.push(qkv.subarray(H,2*H));vs.push(qkv.subarray(2*H));
    }
    const t=L-1;
    {
      const heads=new Float32Array(H);
      for(let head=0;head<4;head++){
        const scores=new Float32Array(t+1),offset=head*12;
        let max=-Infinity;
        for(let j=0;j<=t;j++){
          let s=0;for(let z=0;z<12;z++)s+=qs[t][offset+z]*ks[j][offset+z];
          s/=Math.sqrt(12);scores[j]=s;max=Math.max(max,s);
        }
        let total=0;
        for(let j=0;j<=t;j++){scores[j]=Math.exp(scores[j]-max);total+=scores[j];}
        for(let j=0;j<=t;j++){
          const p=scores[j]/total;
          for(let z=0;z<12;z++)heads[offset+z]+=p*vs[j][offset+z];
        }
      }
      const a=linear(k("self_attn.out_proj.weight"),H,H,heads,k("self_attn.out_proj.bias"));
      for(let i=0;i<H;i++)a[i]+=xs[t][i];
      norm(a,k("norm1.weight"),k("norm1.bias"));
      const f=linear(k("linear1.weight"),F,H,a,k("linear1.bias"));
      for(let i=0;i<F;i++)f[i]=Math.max(f[i],0);
      const result=linear(k("linear2.weight"),H,F,f,k("linear2.bias"));
      for(let i=0;i<H;i++)result[i]+=a[i];
      norm(result,k("norm2.weight"),k("norm2.bias"));
      return linear(w("salida.weight"),this.vocab.length,H,result,w("salida.bias"));
    }
  }
  async generate(start,{length=70,temperature=0.6,progress=()=>{},signal}={}){
    if(!start||[...start].length>1000)throw Error("Introduce un comienzo de texto breve.");
    if(!(temperature>0&&temperature<=2))throw Error("Temperatura inválida.");
    let tokens=this.encode(start),generated="";
    length=Math.max(1,Math.min(120,length));
    for(let i=0;i<length;i++){
      if(signal?.aborted)throw Error("Generación cancelada.");
      const logits=this.logits(tokens.slice(-48));
      const max=Math.max(...logits.filter((_,index)=>!this.excludeIds.has(index)))/temperature;
      const probs=logits.map((n,index)=>this.excludeIds.has(index)?0:Math.exp(n/temperature-max));
      let total=0;for(const p of probs)total+=p;
      if(!(total>0)||!Number.isFinite(total))throw Error("No se pueden calcular probabilidades válidas.");
      let random=Math.random()*total,next=probs.length-1;
      for(let j=0;j<probs.length;j++){random-=probs[j];if(random<=0){next=j;break;}}
      tokens.push(next);generated+=this.vocab[next];
      if(i%3===0||i===length-1){progress(generated,i+1,length);await new Promise(done=>setTimeout(done,0));}
    }
    return generated;
  }
}
