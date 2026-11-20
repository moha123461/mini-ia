# Mini IA 7.0

Sitio: https://moha123461.github.io/mini-ia/

## Dos sistemas diferentes

**Chat principal:** recupera respuestas preparadas mediante similitud de texto. Incluye unos 30 temas, historial local y aprendizaje de respuestas personalizadas. No genera lenguaje con una red neuronal.

**Laboratorio Transformer (nuevo):** permite cargar pesos de un Transformer real entrenado en PyTorch y generar caracteres sin servidores ni API. Su arquitectura es la del cuaderno inicial: dimensión 48, 4 cabezas de atención, una capa y contexto de 48 caracteres. Con el vocabulario inicial tiene 25.047 parámetros.

## Importar tu propio modelo de Kaggle

1. En Kaggle, abre el notebook con el archivo guardado mi_primera_ia.pt o mini_ia_v2.pt.
2. Crea una celda con el código de [exportar_kaggle.py](./exportar_kaggle.py) y ejecútalo.
3. Descarga mi-transformer-web.json desde los archivos de salida del notebook.
4. En la web de Mini IA, abre la sección «Laboratorio: mi Transformer neuronal».
5. Pulsa «Importar pesos del Transformer» y elige ese JSON.
6. Prueba a generar texto empezando por «La » o por otro fragmento que exista en el vocabulario de tu modelo.

Los archivos .pt no pueden cargarse directamente en el navegador. El script exporta el modelo a JSON compacto (cuantización de ocho bits). La importación se realiza únicamente en la sesión del navegador, no en un servidor.

## Archivos

- index.html: interfaz y estilos.
- app.js y engine.js: chatbot de respuestas preparadas.
- transformer.js: inferencia del Transformer en JavaScript.
- transformer-ui.js: selector de modelo, generación y controles.
- exportar_kaggle.py: conversión de los checkpoints de PyTorch.
- test.mjs y test-transformer.mjs: pruebas con Node.js.
- .github/workflows/check.yml: ejecución automática de pruebas.

Para probar localmente, usa el comando «npm test» con Node.js 22.

## Limitaciones y privacidad

El pequeño Transformer predice caracteres y produce texto a menudo incorrecto. No es comparable a ChatGPT. El chat principal sigue utilizando respuestas guardadas; enseñar nuevas preguntas allí no modifica los pesos de la red neuronal.

El historial y los conocimientos que añade el usuario se almacenan en el navegador. Los pesos del Transformer importados también se procesan localmente, pero no se guardan de forma permanente al actualizar la página. Evita introducir información privada en dispositivos compartidos. GitHub Pages puede registrar información técnica del acceso.

Proyecto exclusivamente educativo.
