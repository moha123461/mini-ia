# Mini IA 11.0

Sitio: https://moha123461.github.io/mini-ia/

## Mini IA 11.0 — Ampliación de conocimientos y entrenamiento experimental

El **chat clásico ya tiene 60 temas educativos**: 30 anteriores y 30 nuevos en [extra-knowledge.js](./extra-knowledge.js), con 150 formulaciones preparadas sobre HTML, CSS, Git, bases de datos, seguridad, conceptos de IA y más. Las respuestas son **conocimientos escritos y buscados por similitud**, no aprendizaje de nuevos pesos. Se han comprobado las 150 formulaciones conocidas y se han conservado las respuestas que tú le enseñaste en el navegador.

La **red neuronal actualmente publicada sigue entrenada con 30 categorías**, por lo que no debes confundir los 60 temas del chat con 60 capacidades neuronales. Puedes seguir usando el modo opcional, sabiendo esa limitación.

### Nuevo cuaderno Kaggle: entrenar 60 categorías

- [Mini_IA_11_Entrenamiento.ipynb](./Mini_IA_11_Entrenamiento.ipynb) es un notebook **autónomo** listo para importar en Kaggle, con datos incluidos y sin depender de archivos externos.
- [entrenar_v11_clasificador.py](./entrenar_v11_clasificador.py) contiene el mismo experimento en un script Python.
- Utiliza 60 categorías, 120 preguntas de entrenamiento, 60 de validación y otras 60 para prueba. Las preguntas reservadas no se usan para calcular los pesos del modelo; la validación ayuda a detener el entrenamiento. Es un experimento pequeño y puede haber sobreajuste.
- Guarda `mi_ia_11_clasificador.pt` (checkpoint), `mi-ia-v11-clasificador.json` (para integrar más adelante en la web) y `resultados-mini-ia-v11.json` (informe de evaluación). **Los archivos solo aparecen después de ejecutar el Notebook en Kaggle.**
- El experimento incluye un diagnóstico separado sobre 12 preguntas ajenas a las 60 categorías para ilustrar que un clasificador puede dar respuestas erróneas fuera de tema.

Para continuar, importa el cuaderno en un Notebook **nuevo** de Kaggle, ejecuta **Run All** y revisa `Prueba final: red neuronal X/60 | similitud Y/60`. No compares sin más X/60 con la antigua puntuación de 27/30: se trata de una prueba diferente y **aún no sabemos el resultado**.

**No se ha sustituido ni vuelto a entrenar el modelo real publicado en GitHub.** Solo cuando se evalúe el nuevo modelo y compartas su JSON se podrá publicar con garantías básicas y comprobarlo en la web.

## Mini IA 10.0 — Modo neuronal opcional en el chat principal

El chat principal ahora incluye un interruptor **«Activar mi red neuronal en el chat»**. Está **desactivado por defecto**, para no modificar el funcionamiento clásico sin que el usuario lo elija. Al activarlo, Mini IA carga el clasificador neuronal ya entrenado en Kaggle, utilizando una única descarga compartida con el laboratorio.

La selección de respuesta sigue estas prioridades:
1. **Respuestas personales enseñadas** en el navegador y explicaciones de seguimiento del chat: se conservan y tienen prioridad.
2. **Red neuronal:** si su filtro prudente reconoce un tema, se muestra la respuesta de una de sus 30 categorías con la etiqueta «Red neuronal».
3. **Respuestas preparadas:** si el clasificador se abstiene, solo se muestra una respuesta clásica cuando su coincidencia es muy clara (puntuación 0,85 o mayor).
4. **Desconocida:** en los demás casos, Mini IA admite que todavía no sabe responder y permite enseñar una respuesta al chat clásico.

El interruptor guarda su estado solo en este navegador; no envía mensajes a servidores. Cuando hay un error de carga, el chat clásico continúa funcionando. Un clic en el interruptor no entrena nuevos pesos: **Mini IA 10.0 usa exactamente los pesos de la red neuronal 9.0**.

La combinación es experimental y puede seguir equivocándose. Las puntuaciones de confianza no están calibradas y el conocimiento se limita a temas preparados. Para evitar sorpresas, el laboratorio de clasificación y el Transformer original siguen disponibles.

Los archivos nuevos son `hybrid.js` (selección de respuestas), `model-loader.js` (descarga compartida) y `test-hybrid.mjs` (pruebas de compatibilidad). El chat conserva sus claves de almacenamiento y las respuestas que ya había aprendido localmente.

## Mini IA 9.2 — Mejor reconocimiento de variantes de preguntas

Sin reentrenar ni sustituir los **141.982 parámetros** del clasificador neuronal, se han añadido al filtro prudente expresiones que no indican un tema nuevo por sí solas: `significa`, `usaron`, `hicieron` y `sitio`. Así se evitan rechazos de preguntas conocidas formuladas de otra manera, manteniendo el bloqueo de términos de contenido desconocido.

**Comprobación de regresión, no prueba independiente:** sobre las mismas 30 preguntas finales de la versión 9.0, el filtro anterior mostraba 21 respuestas correctas y rechazaba 9; el nuevo muestra **25 correctas y rechaza 5**, sin respuestas incorrectas mostradas en ese conjunto. En otras 24 preguntas ajenas usadas previamente para diagnosticar el sistema, rechaza las 24. Estas frases ya estaban disponibles durante el desarrollo y el ajuste del filtro, por lo que **no se puede afirmar que tenga esa precisión con nuevas preguntas reales**.

El clasificador crudo sigue prediciendo las mismas categorías que en 9.0: **27/30** en la prueba original de Kaggle. El nuevo filtro podría seguir aceptando preguntas incorrectas y bloquear respuestas correctas. La siguiente evaluación debe utilizar **un conjunto nuevo** de preguntas conocidas y desconocidas que no haya servido para ajustar sus reglas.

## Mini IA 9.1 — Modo prudente para preguntas desconocidas

La versión 9.1 conserva **exactamente los mismos 141.982 pesos** entrenados con Kaggle. Solo cambia cómo decide la interfaz si mostrar la respuesta de una de las 30 categorías.

- Se comprueba si la pregunta contiene conceptos que no figuran en los ejemplos de entrenamiento ni en las respuestas conocidas.
- Se compara su semejanza con las 60 preguntas de entrenamiento.
- Se exige un mínimo experimental de semejanza (coseno 0,43) y puntuación Softmax (0,48). Estos límites son **heurísticos no calibrados**; no son garantías de precisión.
- Si no pasa las comprobaciones, el resultado principal es «Todavía no sé responder esa pregunta con suficiente seguridad». La predicción original sigue visible como **resultado descartado**, para distinguir inferencia neuronal de protección añadida.
- Se puede enseñar una respuesta al **chat principal** mediante el formulario existente. Eso modifica únicamente las respuestas almacenadas en el navegador; **no reentrena** la red neuronal.

En una comprobación de diagnóstico sobre 24 preguntas ajenas a los temas, se rechazaron las 24. En las **mismas 30 preguntas reservadas que ya conocíamos**, el modo prudente mostró 21 respuestas correctas, rechazó 9 y no mostró ninguna incorrecta como válida. Estas mediciones son **sobre ejemplos ya usados durante el desarrollo**, no constituyen una nueva prueba independiente ni deben extrapolarse a preguntas reales.

El clasificador original sigue obteniendo **27/30 respuestas exactas** si se considera su predicción sin filtro. El filtro puede rechazar respuestas correctas, y también puede aceptar respuestas incorrectas en otros ejemplos. Para evaluar bien la abstención, el próximo experimento deberá utilizar un conjunto nuevo e independiente con preguntas fuera de tema.

## Mini IA 9.0: modelo personal integrado

**Modelo integrado y cargado automáticamente:** [models/mi-ia-v9-clasificador.json](./models/mi-ia-v9-clasificador.json). Este archivo procede del JSON exportado desde Kaggle, con **141.982 parámetros**, 1.078 características TF-IDF y 30 respuestas posibles.

El JSON original de 1,3 MB se ha empaquetado en un formato más pequeño con valores **Float32** (sin volver a entrenar ni cambiar etiquetas), que `classifier.js` puede leer en el navegador. Se han reproducido **27 de 30 aciertos** en las mismas preguntas reservadas que se evaluaron en Kaggle; las tres preguntas falladas también coinciden. Los resultados de ese conjunto **no demuestran** capacidad para conversar fuera de los 30 temas.

En la web, abre «Mini IA 9.0 — Probar mi red neuronal clasificadora». Los pesos se cargan desde GitHub Pages automáticamente; ya no hace falta importar el archivo. Se pueden importar modelos alternativos para comparar. Los cálculos se ejecutan localmente. **El chat principal de respuestas preparadas y el antiguo Transformer generativo siguen siendo otros sistemas independientes.**

Las respuestas del clasificador provienen de **una lista cerrada de 30 categorías**. No puede inventar explicaciones nuevas, buscar en Internet ni garantizar una respuesta fiable para temas desconocidos. Los porcentajes Softmax no deben tratarse como medidas calibradas de seguridad o exactitud.

## Transformer anterior, también integrado

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

En tu ejecución real de Kaggle, la red neuronal consiguió **60/60 en entrenamiento, 25/30 en validación y 27/30 en prueba final**. La búsqueda por similitud obtuvo **60/60, 21/30 y 28/30**. Los resultados proceden de un conjunto pequeño y no demuestran comprensión general.

El cuaderno genera `mi_ia_9_clasificador.pt`, `mi-ia-v9-clasificador.json` y `resultados-mini-ia-v9.json`. El modelo real ya está **publicado y se carga automáticamente**. La importación manual sigue disponible para comparar otros entrenamientos.

### Probar tu red neuronal en la web

1. En Kaggle, abre el Notebook de Mini IA 9.0 y descarga `mi-ia-v9-clasificador.json` desde `Output → /kaggle/working`.
2. Abre https://moha123461.github.io/mini-ia/ y despliega «Mini IA 9.0 — Probar mi red neuronal clasificadora».
3. Comprueba que el modelo cargue automáticamente. Seleccionar otro archivo JSON es opcional.
4. Pregunta «buenos dias», «define python» o «como funciona un transformer» y compara las dos respuestas.

El motor en `classifier.js` calcula localmente los n-gramas de caracteres, TF-IDF y las dos capas lineales con ReLU entrenadas con PyTorch. La predicción cruda **siempre elige entre 30 respuestas**. El modo prudente de la interfaz puede abstenerse cuando faltan indicios, por lo que sigue separado del chat principal y no debe considerarse un asistente general. El valor Softmax no equivale a confianza calibrada.

Los pesos del clasificador ya están disponibles en [models/mi-ia-v9-clasificador.json](./models/mi-ia-v9-clasificador.json); no es necesario volver a subirlos.

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
- classifier.js y classifier-ui.js: motor e interfaz para importar y probar Mini IA 9.0.
- test-classifier.mjs: comprobaciones del formato, la clasificación y las validaciones.
- test-modelo-v9.mjs: prueba el clasificador publicado y las nuevas abstenciones.
- test.mjs, test-transformer.mjs y test-modelo-real.mjs: pruebas con Node.js.
- .github/workflows/check.yml: ejecución automática de pruebas.

Para probar localmente, usa el comando «npm test» con Node.js 22.

## Limitaciones y privacidad

El pequeño Transformer predice caracteres y produce texto a menudo incorrecto. No es comparable a ChatGPT. El chat principal sigue utilizando respuestas guardadas; enseñar nuevas preguntas allí no modifica los pesos de la red neuronal.

El historial y los conocimientos que añade el usuario se almacenan en el navegador. Los pesos predeterminados se descargan de GitHub Pages en cada visita; un modelo alternativo importado manualmente se procesa localmente y no se guarda al actualizar la página. Evita introducir información privada en dispositivos compartidos. GitHub Pages puede registrar información técnica del acceso.

Proyecto exclusivamente educativo.
