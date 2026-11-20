// Temas educativos adicionales, con respuestas preparadas (NO pesos neuronales).
export const EXTRA_KNOWLEDGE = [
  {
    "id": "html",
    "q": [
      "que es html",
      "explica html",
      "para que sirve html",
      "define html",
      "que significa html"
    ],
    "answer": "HTML es el lenguaje de marcado que organiza el contenido de una página web.",
    "detail": "Con HTML se crean títulos, párrafos, enlaces, listas y formularios. El navegador interpreta esas etiquetas.",
    "example": "La etiqueta <h1> representa un título principal.",
    "trainingAnswer": "HTML organiza una pagina web."
  },
  {
    "id": "css",
    "q": [
      "que es css",
      "para que sirve css",
      "explica css",
      "define css",
      "como funciona css"
    ],
    "answer": "CSS sirve para definir el aspecto visual de una página web, como sus colores, tamaños y espacios.",
    "detail": "Se usa junto a HTML para separar el contenido de la presentación.",
    "example": "La regla color: blue; cambia el color del texto.",
    "trainingAnswer": "CSS da estilo a una pagina web."
  },
  {
    "id": "api",
    "q": [
      "que es una api",
      "explica una api",
      "para que sirve una api",
      "define api",
      "como funciona una api"
    ],
    "answer": "Una API permite que distintos programas intercambien datos o soliciten funciones entre sí.",
    "detail": "Una API establece qué operaciones se pueden pedir y cómo se envían y reciben los datos.",
    "example": "Una aplicación puede consultar una API para obtener un pronóstico del tiempo.",
    "trainingAnswer": "Una API conecta programas."
  },
  {
    "id": "servidor",
    "q": [
      "que es un servidor",
      "explica servidor web",
      "para que sirve un servidor",
      "define servidor",
      "que hace un servidor web"
    ],
    "answer": "Un servidor es un sistema que ofrece datos o servicios a otros dispositivos a través de una red.",
    "detail": "Un servidor web puede enviar archivos HTML, imágenes y otros recursos cuando visitas una página.",
    "example": "Al abrir una web, el navegador solicita recursos al servidor.",
    "trainingAnswer": "Un servidor ofrece servicios."
  },
  {
    "id": "base_datos",
    "q": [
      "que es una base de datos",
      "explica base de datos",
      "para que sirve una base de datos",
      "define base de datos",
      "como funciona una base de datos"
    ],
    "answer": "Una base de datos almacena información de forma organizada para poder consultarla y actualizarla.",
    "detail": "Puede guardar información de clientes, productos o mensajes. Muchas aplicaciones utilizan bases de datos.",
    "example": "Una tienda puede guardar productos, precios y pedidos en una base de datos.",
    "trainingAnswer": "Una base de datos organiza informacion."
  },
  {
    "id": "sql",
    "q": [
      "que es sql",
      "explica sql",
      "para que sirve sql",
      "define sql",
      "que significa sql"
    ],
    "answer": "SQL es un lenguaje utilizado para consultar y modificar datos en muchas bases de datos relacionales.",
    "detail": "Permite seleccionar, añadir, actualizar y borrar registros mediante instrucciones.",
    "example": "SELECT nombre FROM clientes; consulta una columna de una tabla.",
    "trainingAnswer": "SQL consulta bases de datos."
  },
  {
    "id": "variable",
    "q": [
      "que es una variable en programacion",
      "explica variable en codigo",
      "para que sirve una variable",
      "define variable en programacion",
      "como usar variables en python"
    ],
    "answer": "Una variable guarda un valor al que un programa puede acceder mediante un nombre.",
    "detail": "El valor puede ser un número, un texto u otro tipo de dato, y puede cambiar durante la ejecución.",
    "example": "En Python: edad = 18",
    "trainingAnswer": "Una variable guarda un valor."
  },
  {
    "id": "funcion",
    "q": [
      "que es una funcion en programacion",
      "explica funcion de codigo",
      "para que sirve una funcion en python",
      "define funcion en programacion",
      "como crear funciones en python"
    ],
    "answer": "Una función agrupa instrucciones para realizar una tarea y poder reutilizarlas.",
    "detail": "Puede recibir datos de entrada y devolver un resultado. Ayuda a organizar programas grandes.",
    "example": "En Python: def doble(x): return x * 2",
    "trainingAnswer": "Una funcion reutiliza instrucciones."
  },
  {
    "id": "bucle",
    "q": [
      "que es un bucle en programacion",
      "explica un bucle",
      "para que sirve un bucle",
      "define bucle en programacion",
      "que es un loop en codigo"
    ],
    "answer": "Un bucle repite instrucciones mientras se cumpla una condición o se recorra una colección.",
    "detail": "En Python se usan habitualmente los bucles for y while.",
    "example": "for i in range(3): print(i) muestra tres números.",
    "trainingAnswer": "Un bucle repite instrucciones."
  },
  {
    "id": "condicional",
    "q": [
      "que es una condicion en programacion",
      "explica if en python",
      "para que sirve un condicional",
      "define instruccion condicional",
      "como funciona if else"
    ],
    "answer": "Una condición permite elegir qué instrucciones ejecutar según se cumpla o no una regla.",
    "detail": "Las estructuras if, elif y else permiten tomar decisiones en un programa.",
    "example": "if edad >= 18: print('Mayor de edad')",
    "trainingAnswer": "Un condicional toma decisiones."
  },
  {
    "id": "depuracion",
    "q": [
      "que es depurar un programa",
      "explica depuracion de codigo",
      "para que sirve depurar",
      "define debugging",
      "como corregir bugs de codigo"
    ],
    "answer": "Depurar consiste en encontrar y corregir errores en un programa.",
    "detail": "Se pueden utilizar mensajes de registro, pruebas y herramientas de depuración para localizar fallos.",
    "example": "Si un programa da un error, puedes revisar la línea indicada y comprobar las variables.",
    "trainingAnswer": "Depurar corrige errores."
  },
  {
    "id": "git",
    "q": [
      "que es git",
      "explica git",
      "para que sirve git",
      "define git",
      "como funciona el control de versiones git"
    ],
    "answer": "Git es una herramienta de control de versiones que registra cambios en archivos y código.",
    "detail": "Permite comparar versiones y trabajar en distintas ramas. GitHub es una plataforma que aloja repositorios Git.",
    "example": "git commit registra una versión de los cambios.",
    "trainingAnswer": "Git guarda versiones del codigo."
  },
  {
    "id": "commit",
    "q": [
      "que es un commit",
      "explica commit de git",
      "para que sirve un commit",
      "define commit en github",
      "como hacer un commit"
    ],
    "answer": "Un commit es un registro de cambios guardado en el historial de Git.",
    "detail": "Los commits ayudan a revisar cuándo se modificó un proyecto y a recuperar versiones anteriores.",
    "example": "Un mensaje como 'Corregir formulario' describe lo guardado.",
    "trainingAnswer": "Un commit registra cambios."
  },
  {
    "id": "repositorio",
    "q": [
      "que es un repositorio de codigo",
      "explica repositorio git",
      "para que sirve un repositorio",
      "define repositorio de software",
      "que contiene un repositorio"
    ],
    "answer": "Un repositorio es un espacio donde se almacenan los archivos de un proyecto y, normalmente, su historial de cambios.",
    "detail": "Un repositorio Git puede incluir código, documentación y versiones anteriores.",
    "example": "El proyecto Mini IA está en un repositorio de GitHub.",
    "trainingAnswer": "Un repositorio guarda un proyecto."
  },
  {
    "id": "github_pages",
    "q": [
      "que es github pages",
      "explica github pages",
      "para que sirve github pages",
      "como funciona github pages",
      "como publicar una web con github pages"
    ],
    "answer": "GitHub Pages permite publicar páginas web estáticas directamente desde un repositorio.",
    "detail": "Es adecuado para HTML, CSS y JavaScript. No ejecuta por sí solo un servidor Python permanente.",
    "example": "Mini IA se puede abrir desde una dirección de GitHub Pages.",
    "trainingAnswer": "GitHub Pages publica webs estaticas."
  },
  {
    "id": "software",
    "q": [
      "que es software",
      "explica software",
      "define software",
      "para que sirve el software",
      "ejemplos de software"
    ],
    "answer": "Software es el conjunto de programas e instrucciones que utiliza un dispositivo.",
    "detail": "Incluye sistemas operativos, navegadores y aplicaciones.",
    "example": "Un editor de texto y un videojuego son software.",
    "trainingAnswer": "Software son programas."
  },
  {
    "id": "hardware",
    "q": [
      "que es hardware",
      "explica hardware",
      "define hardware",
      "para que sirve el hardware",
      "ejemplos de hardware"
    ],
    "answer": "Hardware son las partes físicas de un ordenador o dispositivo.",
    "detail": "Incluye la pantalla, la memoria, el procesador y el teclado.",
    "example": "Una tarjeta gráfica es hardware.",
    "trainingAnswer": "Hardware son componentes fisicos."
  },
  {
    "id": "sistema_operativo",
    "q": [
      "que es un sistema operativo",
      "explica sistema operativo",
      "define sistema operativo",
      "para que sirve windows linux",
      "que hace un sistema operativo"
    ],
    "answer": "Un sistema operativo administra los recursos del dispositivo y permite ejecutar programas.",
    "detail": "Coordina memoria, almacenamiento, archivos y dispositivos conectados.",
    "example": "Windows, Linux y Android son sistemas operativos.",
    "trainingAnswer": "El sistema operativo controla el equipo."
  },
  {
    "id": "navegador",
    "q": [
      "que es un navegador web",
      "explica navegador de internet",
      "define navegador web",
      "para que sirve un navegador",
      "que hace un navegador web"
    ],
    "answer": "Un navegador es una aplicación que permite visitar e interactuar con páginas web.",
    "detail": "Interpreta HTML, CSS y JavaScript para mostrar la página.",
    "example": "Firefox y Chrome son navegadores.",
    "trainingAnswer": "Un navegador abre paginas web."
  },
  {
    "id": "dominio",
    "q": [
      "que es un dominio web",
      "explica dominio de internet",
      "define nombre de dominio",
      "para que sirve un dominio web",
      "que significa dominio de una pagina"
    ],
    "answer": "Un dominio es un nombre que identifica un sitio o servicio en Internet.",
    "detail": "El sistema DNS ayuda a relacionar nombres de dominio con direcciones IP.",
    "example": "example.com es un ejemplo de dominio.",
    "trainingAnswer": "Un dominio da nombre a un sitio."
  },
  {
    "id": "dns",
    "q": [
      "que es dns",
      "explica dns",
      "para que sirve dns",
      "define sistema dns",
      "como funciona el dns"
    ],
    "answer": "DNS es un sistema que traduce nombres de dominio a direcciones IP y otros registros de red.",
    "detail": "Gracias a DNS no necesitas memorizar la dirección IP de cada sitio web.",
    "example": "Al escribir example.com, el navegador puede consultar DNS para encontrar su dirección.",
    "trainingAnswer": "DNS traduce dominios."
  },
  {
    "id": "https",
    "q": [
      "que es https",
      "explica https",
      "para que sirve https",
      "define conexion https",
      "que significa https en una web"
    ],
    "answer": "HTTPS es la versión de HTTP que protege la comunicación mediante cifrado TLS.",
    "detail": "Ayuda a evitar que terceros lean o modifiquen los datos en tránsito. No garantiza que el sitio sea legítimo.",
    "example": "Una web con https:// usa una conexión cifrada, aunque también puede ser fraudulenta.",
    "trainingAnswer": "HTTPS cifra la conexion web."
  },
  {
    "id": "cifrado",
    "q": [
      "que es el cifrado de datos",
      "explica cifrado",
      "para que sirve cifrar",
      "define encriptacion",
      "como funciona el cifrado"
    ],
    "answer": "El cifrado transforma datos para que solo puedan interpretarse con la clave adecuada.",
    "detail": "Se utiliza para proteger información durante la transmisión o el almacenamiento.",
    "example": "Una conexión HTTPS cifra información entre el navegador y el servidor.",
    "trainingAnswer": "El cifrado protege datos."
  },
  {
    "id": "phishing",
    "q": [
      "que es phishing",
      "explica phishing",
      "como evitar el phishing",
      "define phishing",
      "que es un correo fraudulento"
    ],
    "answer": "El phishing es un engaño que intenta conseguir datos privados haciéndose pasar por alguien de confianza.",
    "detail": "Conviene comprobar enlaces, remitentes y peticiones urgentes antes de introducir contraseñas o datos.",
    "example": "Un correo falso que imita a un banco y pide la contraseña es un intento de phishing.",
    "trainingAnswer": "El phishing intenta robar datos."
  },
  {
    "id": "copia_seguridad",
    "q": [
      "que es una copia de seguridad",
      "explica backup",
      "para que sirve un backup",
      "define copia de seguridad",
      "como proteger archivos con copia"
    ],
    "answer": "Una copia de seguridad es una duplicación de archivos que ayuda a recuperarlos si se pierden.",
    "detail": "Es recomendable conservar copias en ubicaciones distintas y comprobar que pueden restaurarse.",
    "example": "Guardar otra copia de los pesos de una IA evita perder el entrenamiento.",
    "trainingAnswer": "Una copia de seguridad evita perdidas."
  },
  {
    "id": "codigo_abierto",
    "q": [
      "que es el codigo abierto",
      "explica software de codigo abierto",
      "define open source",
      "para que sirve codigo abierto",
      "que significa open source"
    ],
    "answer": "El código abierto permite consultar, utilizar y modificar software según las condiciones de su licencia.",
    "detail": "No significa necesariamente que todo uso sea gratuito o sin condiciones.",
    "example": "Un proyecto puede publicar su código en GitHub con una licencia abierta.",
    "trainingAnswer": "El codigo abierto permite revisar software."
  },
  {
    "id": "sesgo_ia",
    "q": [
      "que es el sesgo en ia",
      "explica sesgo algoritmico",
      "define bias en inteligencia artificial",
      "por que una ia tiene sesgos",
      "como evitar sesgo en una ia"
    ],
    "answer": "El sesgo en IA puede aparecer cuando datos o decisiones de diseño provocan resultados sistemáticamente injustos o poco representativos.",
    "detail": "Para detectarlo se evalúa el modelo en distintos grupos y situaciones, y se revisan los datos usados.",
    "example": "Si un modelo aprende de ejemplos poco variados, puede fallar con casos diferentes.",
    "trainingAnswer": "Un sesgo puede alterar las predicciones."
  },
  {
    "id": "clasificacion",
    "q": [
      "que es clasificacion en aprendizaje automatico",
      "explica clasificacion de ia",
      "para que sirve un clasificador",
      "define clasificacion automatica",
      "que hace una red clasificadora"
    ],
    "answer": "Clasificar consiste en asignar una entrada a una de varias categorías.",
    "detail": "La red neuronal de Mini IA 9.0 clasifica una pregunta entre 30 respuestas conocidas.",
    "example": "Clasificar un correo como spam o no spam es un problema de clasificación.",
    "trainingAnswer": "Clasificar es elegir una categoria."
  },
  {
    "id": "regresion",
    "q": [
      "que es regresion en machine learning",
      "explica regresion en ia",
      "para que sirve regresion",
      "define modelo de regresion",
      "que predice una regresion"
    ],
    "answer": "En aprendizaje automático, la regresión se utiliza para predecir valores numéricos.",
    "detail": "A diferencia de un clasificador, normalmente estima cantidades continuas.",
    "example": "Predecir el precio aproximado de una vivienda es un ejemplo de regresión.",
    "trainingAnswer": "La regresion predice numeros."
  },
  {
    "id": "matriz_confusion",
    "q": [
      "que es una matriz de confusion",
      "explica matriz de confusion",
      "para que sirve matriz de confusion",
      "define confusion matrix",
      "como evaluar un clasificador"
    ],
    "answer": "Una matriz de confusión resume cuántas predicciones de un clasificador fueron correctas y qué categorías confundió.",
    "detail": "Ayuda a analizar errores específicos, además del porcentaje total de aciertos.",
    "example": "En una clasificación de spam, muestra mensajes detectados correctamente y mensajes clasificados mal.",
    "trainingAnswer": "La matriz de confusion muestra errores."
  }
];
