// Decide cuándo el chat puede usar el clasificador entrenado en Kaggle.
// Nunca modifica la red neuronal ni las respuestas personalizadas.
export function chooseResponse(question, base, classifier) {
  if(!classifier || base.source==="custom" || base.source==="context"){
    return base;
  }
  const neural=classifier.answerSafely(question);
  if(neural.accepted){
    return {text:neural.safeAnswer,source:"neural",topic:null};
  }
  // Si el clasificador no conoce el tema, solo confiamos en una respuesta
  // preparada si la coincidencia del chat principal es muy clara.
  if(base.source==="knowledge" && Number.isFinite(base.score) && base.score>=0.85){
    return base;
  }
  return {
    text:"Todavía no sé responder esa pregunta. Puedes enseñarme la respuesta más abajo.",
    source:"unknown",topic:null
  };
}
