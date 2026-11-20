# Mini IA 6.0

Proyecto educativo de chatbot desarrollado con JavaScript, publicado en GitHub Pages y sin dependencias ni API de pago.

**Abrir:** https://moha123461.github.io/mini-ia/

## Qué hace

- Compara preguntas con una base de 30 temas educativos sobre programación e inteligencia artificial.
- Reconoce varias formas de preguntar y puede continuar algunas explicaciones con «Dame un ejemplo» o «Explícalo mejor».
- Indica cuando no reconoce una pregunta, en lugar de ofrecer una respuesta aleatoria.
- Permite enseñar preguntas y respuestas adicionales, corregirlas, borrarlas e importarlas o exportarlas como JSON.
- Permite exportar el historial del chat. Los datos propios se guardan en el almacenamiento local del navegador.

## Limitaciones importantes

Este **no es un modelo de lenguaje generativo**. Su motor actual recupera respuestas mediante similitud de texto. El pequeño Transformer entrenado por separado en Kaggle todavía **no está integrado**: para incorporarlo hay que exportar su arquitectura, vocabulario y pesos y desarrollar un sistema de inferencia compatible.

La base de conocimientos es limitada: incluso cuando reconoce una pregunta, la respuesta puede ser incompleta o equivocada. No está conectado a Internet para obtener información reciente.

## Estructura

- `index.html`: interfaz, estilos y accesibilidad.
- `app.js`: interacción, historial y conocimientos personalizados.
- `engine.js`: reconocimiento de preguntas y respuestas locales.
- `test.mjs`: pruebas de funcionamiento.
- `.github/workflows/check.yml`: pruebas automáticas en GitHub Actions.

## Pruebas

Con Node.js 22 o superior:

```bash
npm test
```

No necesita instalar paquetes. GitHub Pages publica los cambios de la rama `main` si el repositorio tiene configurado «Deploy from a branch».

## Privacidad

Las preguntas escritas no se envían a un modelo o API externa; se procesan en el navegador. Los datos guardados en almacenamiento local pueden verlos otras personas que usen el mismo perfil del navegador. GitHub Pages, como proveedor de alojamiento, puede registrar datos técnicos de acceso.
