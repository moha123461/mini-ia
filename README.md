# Mini IA 7.1

Sitio: https://moha123461.github.io/mini-ia/

## Modelo personal integrado automáticamente

El archivo [models/mi-transformer-web.json](./models/mi-transformer-web.json) procede de los pesos exportados por el autor desde su notebook de Kaggle (16 tensores, 25.047 parámetros, vocabulario de 39 caracteres). Se carga automáticamente al abrir el Laboratorio Transformer. La inferencia se ejecuta en el navegador, sin API externa de IA; la descarga del archivo JSON se realiza desde GitHub Pages.

El modelo importado utiliza el vocabulario de las frases educativas iniciales: **no contiene el carácter `:`**, por lo que no admite el ejemplo `Usuario: Hola\nIA:`. Prueba `La `, `Una ` o `Python ` en el laboratorio. Los resultados pueden ser incoherentes: el archivo no convierte al Transformer en un asistente conversacional.

Los pesos ahora forman parte de un repositorio **público**. Si entrenas otra versión, tendrás que exportar el nuevo JSON y actualizar el archivo del repositorio para sustituir los pesos predeterminados.

## Nuevo: entrenamiento experimental Mini IA 8.0

El siguiente experimento no sustituye automáticamente la web ni los pesos de la versión 7.1.

- [Mini_IA_8_Entrenamiento.ipynb](./Mini_IA_8_Entrenamiento.ipynb): cuaderno listo para importar en Kaggle y ejecutar celda a celda.
- [entrenar_v8.py](./entrenar_v8.py): el mismo entrenamiento en un archivo Python reproducible.

El experimento utiliza **30 temas, 60 maneras de preguntar para entrenamiento, 30 para validación y otras 30 para prueba final**. Las formas de las preguntas se separan para no volver a evaluar exactamente los ejemplos que se entrenan. Las respuestas de cada tema sí aparecen entre los datos de entrenamiento; la prueba mide generalización limitada de la formulación, no inteligencia general.

En Kaggle, importa el cuaderno `.ipynb` y ejecuta las celdas en orden. Al terminar, en `/kaggle/working` aparecen:

- `mini_ia_v8.pt`: pesos originales para recuperar o continuar el entrenamiento.
- `mi-transformer-v8.json`: pesos comprimidos compatibles con el laboratorio de la web.
- `evaluacion_mini_ia_v8.json`: pérdida de validación y respuestas a las 30 preguntas de prueba.

En el Laboratorio Transformer, selecciona **«Opcional: importar otro modelo»** para comprobar la versión v8 sin publicar todavía. El modelo v8 reserva el símbolo `¤` para rellenar secuencias durante el entrenamiento; la inferencia de JavaScript excluye ese carácter de la generación.

### Limitaciones del experimento

La arquitectura sigue siendo muy pequeña (48 dimensiones, una capa y contexto de 48 caracteres). Los resultados pueden seguir siendo pobres o memorizar las respuestas. No se deben comparar directamente puntuaciones de entrenamiento de conjuntos de datos diferentes. El entrenamiento requiere ejecutar Kaggle; un commit en GitHub no entrena el modelo.

## Resultado de la primera prueba y corrección 8.1

En Kaggle, la versión experimental 8.0 produjo **0/30 respuestas exactas** en las preguntas de prueba. Se mantiene para poder reproducir el experimento, pero no sustituye el modelo publicado de la web.

La siguiente versión [Mini_IA_8_1_Entrenamiento.ipynb](./Mini_IA_8_1_Entrenamiento.ipynb) corrige el objetivo de entrenamiento: **la pérdida de la red neuronal evalúa los caracteres de la respuesta y no los de la pregunta**. Incluye también un comparador de búsqueda de respuestas a partir de las **60 preguntas de entrenamiento**, sin utilizar las 30 de prueba para construir el índice.

En una evaluación independiente del comparador sobre estas mismas preguntas, se obtuvieron **28/30 aciertos**; esto es un resultado de *recuperación por similitud*, **no del Transformer**. El Transformer 8.1 todavía **no ha sido entrenado ni evaluado en Kaggle**.

Para probarlo: importa el nuevo cuaderno en un Notebook de Kaggle, pulsa «Run All» y compara dos salidas:
- «Transformer generativo: X/30 respuestas exactas en prueba».
- «Recuperación por similitud: Y/30 respuestas correctas».

El cuaderno guarda `mini_ia_v8_1.pt`, `mi-transformer-v8_1.json` y `evaluacion_mini_ia_v8_1.json`. No publiques el nuevo modelo en lugar del anterior hasta revisar el informe.

## Mini IA 9.0 — Nuevo experimento de clasificación

Las capturas de Kaggle confirmaron que el Transformer v8.1 obtuvo **0/30** aciertos: el error de entrenamiento cayó, mientras que el de validación volvió a subir (de 2,383 a 3,961). Este es un ejemplo de sobreajuste. El recuperador TF-IDF acertó **28/30** en el mismo conjunto.

[**Abrir el cuaderno Mini_IA_9_Clasificador.ipynb**](./Mini_IA_9_Clasificador.ipynb) o [ver entrenar_v9_clasificador.py](./entrenar_v9_clasificador.py).

La nueva red neuronal no genera caracteres: es un **clasificador de 30 respuestas cerradas** (vectorización TF-IDF de n-gramas, capa oculta con ReLU y capa de salida de 30 categorías). Trabaja con **las mismas preguntas de entrenamiento, validación y prueba** que v8.1. La red aprenderá pesos nuevos en Kaggle; se compara con el recuperador usando los mismos 30 ejemplos finales.

Al terminar crea `mi_ia_9_clasificador.pt`, `mi-ia-v9-clasificador.json` y `resultados-mini-ia-v9.json`. **Los archivos aún no existen hasta ejecutar Kaggle.** El JSON es un formato de exportación para integrar después; **la web actual no lo admite todavía**. No sustituyas el Transformer publicado hasta analizar los nuevos resultados.

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
- exportar_kaggle.py: conversión de checkpoints anteriores de PyTorch.
- entrenar_v8.py y Mini_IA_8_Entrenamiento.ipynb: experimento original v8.0.
- entrenar_v8_1.py y Mini_IA_8_1_Entrenamiento.ipynb: corrección experimental y comparador de recuperación.
- entrenar_v9_clasificador.py y Mini_IA_9_Clasificador.ipynb: clasificador neuronal supervisado, con evaluación separada.
- test.mjs, test-transformer.mjs y test-modelo-real.mjs: pruebas con Node.js.
- .github/workflows/check.yml: ejecución automática de pruebas.

Para probar localmente, usa el comando «npm test» con Node.js 22.

## Limitaciones y privacidad

El pequeño Transformer predice caracteres y produce texto a menudo incorrecto. No es comparable a ChatGPT. El chat principal sigue utilizando respuestas guardadas; enseñar nuevas preguntas allí no modifica los pesos de la red neuronal.

El historial y los conocimientos que añade el usuario se almacenan en el navegador. Los pesos predeterminados se descargan de GitHub Pages en cada visita; un modelo alternativo importado manualmente se procesa localmente y no se guarda al actualizar la página. Evita introducir información privada en dispositivos compartidos. GitHub Pages puede registrar información técnica del acceso.

Proyecto exclusivamente educativo.
