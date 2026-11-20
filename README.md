# Mini IA 7.1

Sitio: https://moha123461.github.io/mini-ia/

## Modelo personal integrado automáticamente

El archivo [models/mi-transformer-web.json](./models/mi-transformer-web.json) procede de los pesos exportados por el autor desde su notebook de Kaggle (16 tensores, 25.047 parámetros, vocabulario de 39 caracteres). Se carga automáticamente al abrir el Laboratorio Transformer. La inferencia se ejecuta en el navegador, sin API externa de IA; la descarga del archivo JSON se realiza desde GitHub Pages.

El modelo importado utiliza el vocabulario de las frases educativas iniciales: **no contiene el carácter `:`**, por lo que no admite el ejemplo `Usuario: Hola\nIA:`. Prueba `La `, `Una ` o `Python ` en el laboratorio. Los resultados pueden ser incoherentes: el archivo no convierte al Transformer en un asistente conversacional.

Los pesos ahora forman parte de un repositorio **público**. Si entrenas otra versión, tendrás que exportar el nuevo JSON y actualizar el archivo del repositorio para sustituir los pesos predeterminados.

## Dos sistemas diferentes

**Chat principal:** recupera respuestas preparadas mediante similitud de texto. Incluye unos 30 temas, historial local y aprendizaje de respuestas personalizadas. No genera lenguaje con una red neuronal.

**Laboratorio Transformer:** carga automáticamente los pesos personales publicados y también permite importar otros pesos de un Transformer real entrenado en PyTorch y generar caracteres sin servidores ni API. Su arquitectura es la del cuaderno inicial: dimensión 48, 4 cabezas de atención, una capa y contexto de 48 caracteres. Con el vocabulario inicial tiene 25.047 parámetros.

## Importar tu propio modelo de Kaggle

1. En Kaggle, abre **el mismo cuaderno que has entrenado** y comprueba que todavía están disponibles las variables `modelo` y `caracteres`.
2. Abre [exportar_kaggle.py](./exportar_kaggle.py), copia su código entero y pégalo en una **celda Code** al final del cuaderno. Ejecútalo.
3. Si el modelo está cargado en la sesión, el exportador usa **los pesos actuales**, no una versión antigua. Guarda además `mini_ia_ultimo.pt` para que no los pierdas. Si se reinició Kaggle, busca el último checkpoint disponible (`mini_ia_v2.pt`, etc.).
4. Desde los archivos de salida `/kaggle/working` descarga **mi-transformer-web.json**. Conserva también el archivo `.pt` como copia de seguridad.
5. En la web de Mini IA, abre «Laboratorio: mi Transformer neuronal». El modelo predeterminado ya se carga solo; si deseas probar el nuevo checkpoint sin publicarlo, selecciona «Importar otro modelo» y elige el JSON exportado.
6. Escribe `La ` si tu modelo ha sido entrenado con el primer conjunto de frases; para el modelo de preguntas-respuestas, prueba `Usuario: Hola\nIA:` (solo si esos caracteres están en su vocabulario).

**Atención:** exportar no mejora el entrenamiento, simplemente utiliza tus pesos actuales. Si la sesión se reinició y no guardaste Mini IA 4.0, los pesos de esa sesión no se podrán recuperar automáticamente; el exportador utilizará el checkpoint anterior disponible.

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

El historial y los conocimientos que añade el usuario se almacenan en el navegador. Los pesos predeterminados se descargan de GitHub Pages en cada visita; un modelo alternativo importado manualmente se procesa localmente y no se guarda al actualizar la página. Evita introducir información privada en dispositivos compartidos. GitHub Pages puede registrar información técnica del acceso.

Proyecto exclusivamente educativo.
