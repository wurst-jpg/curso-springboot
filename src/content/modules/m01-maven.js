// Módulo 1: Maven y el proyecto. Qué es Maven, las partes del pom.xml, los starters,
// las carpetas del proyecto, la clase principal y el wrapper mvnw.
// Sin import: las constantes compartidas se definen aquí (ver docs/autoria-modulos.md).

// pom.xml base del curso: el mismo texto que docs/temario.md ("pom.xml base"). Un test lo compara.
const POM = `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>

  <parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>4.1.2</version>
    <relativePath/>
  </parent>

  <groupId>com.biblioteca</groupId>
  <artifactId>biblioteca</artifactId>
  <version>0.0.1-SNAPSHOT</version>
  <name>biblioteca</name>

  <properties>
    <java.version>17</java.version>
  </properties>

  <dependencies>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-h2console</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-devtools</artifactId>
      <scope>runtime</scope>
      <optional>true</optional>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa-test</artifactId>
      <scope>test</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-webmvc-test</artifactId>
      <scope>test</scope>
    </dependency>
  </dependencies>

  <build>
    <plugins>
      <plugin>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-maven-plugin</artifactId>
      </plugin>
    </plugins>
  </build>
</project>
`

const POM_PATH = '/pom.xml'
const APP = '/src/main/java/com/biblioteca/BibliotecaApplication.java'

// Una dependencia del pom.xml (con scope opcional), con la sangría del pom base.
const dependencia = (artifactId, scope) => `    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>${artifactId}</artifactId>
${scope ? `      <scope>${scope}</scope>\n` : ''}    </dependency>
`
const conDependencia = (pom, bloque) => pom.replace('  </dependencies>', () => bloque + '  </dependencies>')

const DEVTOOLS = `    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-devtools</artifactId>
      <scope>runtime</scope>
      <optional>true</optional>
    </dependency>
`

// Clase principal. Con `completa = false` le faltan la anotación y la línea que arranca la aplicación.
const appCon = (completa) => `package com.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

${completa ? '@SpringBootApplication\n' : ''}public class BibliotecaApplication {

  public static void main(String[] args) {
${completa ? '    SpringApplication.run(BibliotecaApplication.class, args);\n' : ''}  }
}
`

const base = (extra = {}) => ({ [POM_PATH]: POM, [APP]: appCon(true), ...extra })

const TEXTO = '/src/main/resources/bienvenida.txt'
const PRUEBA = '/src/test/java/com/biblioteca/BibliotecaApplicationTests.java'
const AVISO = '/src/main/java/com/biblioteca/avisos/Aviso.java'

// Checks repetidos en varios retos.
const sigueElPadre = {
  type: 'file-includes',
  path: POM_PATH,
  pattern: '<artifactId>\\s*spring-boot-starter-parent\\s*</artifactId>\\s*<version>\\s*4\\.1\\.2\\s*</version>',
  label: 'La versión de Spring Boot (4.1.2) no se tocó',
  message: 'La versión 4.1.2 del bloque <parent> debe seguir igual: solo cambia lo que pide el reto.',
}
const siguenLasDemas = {
  type: 'file-includes',
  path: POM_PATH,
  pattern: '^(?=[\\s\\S]*<artifactId>\\s*spring-boot-starter-webmvc\\s*</artifactId>)(?=[\\s\\S]*<artifactId>\\s*spring-boot-starter-data-jpa\\s*</artifactId>)(?=[\\s\\S]*<artifactId>\\s*h2\\s*</artifactId>)',
  label: 'Siguen las demás dependencias',
  message: 'Parece que borraste de más: las demás dependencias (webmvc, data-jpa, h2...) deben seguir en el pom.xml. Usa "Reiniciar reto" si lo necesitas.',
}
// Un comentario con la respuesta no vale: el patrón busca el nombre dentro de <!-- ... -->.
const sinComentar = (palabra) => ({
  type: 'file-excludes',
  path: POM_PATH,
  pattern: `<!--(?:(?!-->)[\\s\\S])*${palabra}`,
  label: 'La dependencia no está comentada',
  message: `Veo ${palabra} dentro de un comentario <!-- -->. Los comentarios no cuentan: escribe la dependencia de verdad.`,
})
const dentroDeDependencies = (artifact, scope) =>
  `<dependency>\\s*<groupId>\\s*org\\.springframework\\.boot\\s*</groupId>\\s*<artifactId>\\s*${artifact}\\s*</artifactId>${scope ? `\\s*<scope>\\s*${scope}\\s*</scope>` : ''}\\s*</dependency>[\\s\\S]*</dependencies>`

const modulo = {
  id: 'm01',
  title: 'Maven y el proyecto',
  summary: 'Conoce Maven y el pom.xml: los datos del proyecto, los starters, las carpetas, la clase principal y el wrapper mvnw.',
  lessons: [
    {
      id: 'm01-l1',
      title: 'Maven y el pom.xml',
      explanation: `Imagina que quieres cocinar una paella. Necesitas dos cosas: una **receta** (los pasos) y una **lista de la compra** (los ingredientes). Si alguien te da la receta pero no la lista, no sabes qué comprar.

**Maven** es el ayudante que hace eso con tu proyecto Java: lee una "receta" y una "lista de la compra", va a buscar por internet todos los ingredientes (las librerías que usa tu código) y prepara el plato (compila y arma el programa).

Esa receta es un archivo llamado **\`pom.xml\`**, en la raíz del proyecto. Es un texto con etiquetas (\`<algo>...</algo>\`), y estas son sus partes principales:

- **\`<parent>\`**: "mi receta se basa en la receta de otro". Aquí decimos que partimos de \`spring-boot-starter-parent\`, versión **4.1.2**. Gracias a eso no tenemos que decidir qué versión de cada ingrediente comprar: Spring Boot ya eligió las que se llevan bien entre sí.
- **\`<groupId>\`, \`<artifactId>\` y \`<version>\`**: la "tarjeta de identidad" de tu proyecto, como el nombre completo de una persona.
  - \`groupId\` = la familia o empresa (\`com.biblioteca\`).
  - \`artifactId\` = el nombre del proyecto (\`biblioteca\`).
  - \`version\` = en qué versión va (\`0.0.1-SNAPSHOT\`; "SNAPSHOT" significa "todavía en construcción").
- **\`<name>\`** (y, si quieres, \`<description>\`): el nombre y una frase que explica para qué sirve.
- **\`<properties>\`**: ajustes sueltos. Aquí vive \`<java.version>17</java.version>\`, que dice con qué versión de Java se prepara el plato.
- **\`<dependencies>\`**: la lista de la compra. Lo vemos en la siguiente lección.

Fíjate que \`parent\` también tiene \`groupId\`, \`artifactId\` y \`version\`: son los del proyecto padre, no los tuyos. Por eso hay que mirar bien en qué bloque estás antes de cambiar un número.`,
      challenges: [
        {
          id: 'm01-l1-c1',
          title: 'Sube la versión del proyecto',
          instructions: `Abre \`/pom.xml\` (ya está abierto). La tarjeta de identidad de tu proyecto dice \`<version>0.0.1-SNAPSHOT</version>\`.

La biblioteca ya está lista para enseñarse, así que cambia esa versión por **1.0.0** (la etiqueta queda \`<version>1.0.0</version>\`).

Cuidado: es la versión que está debajo de \`<artifactId>biblioteca</artifactId>\`. La versión **4.1.2** del bloque \`<parent>\` es la de Spring Boot y **no se toca**.`,
          files: base(),
          activeFile: POM_PATH,
          hints: [
            'Busca el bloque que tiene <artifactId>biblioteca</artifactId>: justo debajo está la versión de TU proyecto.',
            'No es la 4.1.2 (esa está dentro de <parent> y es la de Spring Boot). La tuya dice 0.0.1-SNAPSHOT.',
            'Deja la línea así: <version>1.0.0</version>',
          ],
          solution: { [POM_PATH]: POM.replace('<version>0.0.1-SNAPSHOT</version>', '<version>1.0.0</version>') },
          checks: [
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: '<artifactId>\\s*biblioteca\\s*</artifactId>\\s*<version>\\s*1\\.0\\.0\\s*</version>',
              label: 'La versión del proyecto es 1.0.0',
              message: 'Debajo de <artifactId>biblioteca</artifactId> la versión debe ser <version>1.0.0</version>.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: '0\\.0\\.1-SNAPSHOT',
              label: 'Ya no queda 0.0.1-SNAPSHOT',
              message: 'Todavía aparece 0.0.1-SNAPSHOT en el pom.xml.',
            },
            sigueElPadre,
          ],
          xp: 10,
        },
        {
          id: 'm01-l1-c2',
          title: 'Escribe una descripción',
          instructions: `Un proyecto bien presentado explica para qué sirve. En \`/pom.xml\`, **justo debajo** de la línea \`<name>biblioteca</name>\`, añade una línea nueva:

\`<description>Sistema de la biblioteca</description>\`

El texto debe ser exactamente **Sistema de la biblioteca**. No cambies el \`<name>\`.`,
          files: base(),
          activeFile: POM_PATH,
          hints: [
            'Ve a la línea <name>biblioteca</name>, que está debajo de la versión del proyecto.',
            'Pulsa Enter al final de esa línea para crear una línea nueva debajo, con la misma sangría (dos espacios).',
            'Escribe: <description>Sistema de la biblioteca</description>',
          ],
          solution: {
            [POM_PATH]: POM.replace('<name>biblioteca</name>', '<name>biblioteca</name>\n  <description>Sistema de la biblioteca</description>'),
          },
          checks: [
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: '<name>\\s*biblioteca\\s*</name>\\s*<description>\\s*Sistema\\s+de\\s+la\\s+biblioteca\\s*</description>',
              label: 'La descripción dice "Sistema de la biblioteca"',
              message: 'Debajo de <name>biblioteca</name> debe haber <description>Sistema de la biblioteca</description>.',
            },
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: '<name>\\s*biblioteca\\s*</name>',
              label: 'El nombre del proyecto sigue siendo biblioteca',
              message: 'La línea <name>biblioteca</name> debe seguir igual.',
            },
            sigueElPadre,
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm01-l2',
      title: 'Dependencias y starters',
      explanation: `Volvamos a la lista de la compra. Cada **dependencia** es un ingrediente que tu proyecto necesita. Se escribe dentro de \`<dependencies>\`, así:

\`\`\`xml
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-webmvc</artifactId>
</dependency>
\`\`\`

\`groupId\` y \`artifactId\` son la "marca" y el "producto": con ellos Maven sabe exactamente qué descargar. La versión no hace falta, porque el \`parent\` ya la eligió.

**Starters: ingredientes en pack.** Comprar uno por uno harina, huevos, aceite y sal es pesado. Un **starter** es un **pack**: "kit para hacer tortilla" y llegan todos los ingredientes juntos. Por ejemplo:

- \`spring-boot-starter-webmvc\`: el pack para la parte web (recibir peticiones). Ojo: en tutoriales viejos puede aparecer otro nombre; aquí usamos el de esta versión de Spring Boot.
- \`spring-boot-starter-data-jpa\`: el pack para guardar datos.
- \`spring-boot-starter-actuator\`: el pack para saber si la aplicación está sana.

Los verás todos más adelante; ahora solo hay que saber que son packs y cómo se añaden.

**Añadir y quitar.** Añadir un ingrediente es copiar un bloque \`<dependency>\` **dentro** de \`<dependencies>\` (antes de \`</dependencies>\`). Quitarlo es borrar el bloque completo, de \`<dependency>\` a \`</dependency>\`. Comentarlo con \`<!-- -->\` no lo quita de verdad pero lo apaga; para este curso, bórralo.

**El scope: ¿cuándo se necesita?** Algunos ingredientes no se necesitan siempre. Es como el abrelatas: sirve al cocinar, pero no va en el plato servido. El \`<scope>\` lo indica:

- sin scope: se usa siempre (programar y ejecutar);
- \`<scope>runtime</scope>\`: solo cuando la aplicación está corriendo;
- \`<scope>test</scope>\`: solo para las pruebas.

Esta lista de la compra, con sus scopes, la lee Maven cada vez que prepara el proyecto.`,
      challenges: [
        {
          id: 'm01-l2-c1',
          title: 'Añade el starter actuator',
          instructions: `En \`/pom.xml\`, dentro de \`<dependencies>\` (antes de \`</dependencies>\`), añade una dependencia nueva con:

- \`groupId\`: \`org.springframework.boot\`
- \`artifactId\`: \`spring-boot-starter-actuator\`
- **sin** \`scope\` (este pack se usa siempre).

No borres las dependencias que ya están.`,
          files: base(),
          activeFile: POM_PATH,
          hints: [
            'Mira cómo están escritas las otras dependencias: cada una es un bloque <dependency> ... </dependency>.',
            'Copia el bloque de spring-boot-starter-webmvc justo debajo de él (dentro de <dependencies>) y cambia solo el artifactId.',
            'Debe quedar: <dependency> <groupId>org.springframework.boot</groupId> <artifactId>spring-boot-starter-actuator</artifactId> </dependency>',
          ],
          solution: { [POM_PATH]: conDependencia(POM, dependencia('spring-boot-starter-actuator')) },
          checks: [
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: dentroDeDependencies('spring-boot-starter-actuator'),
              label: 'Existe la dependencia spring-boot-starter-actuator',
              message: 'Falta un bloque <dependency> con groupId org.springframework.boot y artifactId spring-boot-starter-actuator, dentro de <dependencies>.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: 'spring-boot-starter-actuator\\s*</artifactId>\\s*<scope>',
              label: 'Sin scope: el pack se usa siempre',
              message: 'La dependencia actuator no lleva <scope>: quítalo.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: '<artifactId>\\s*spring-boot-actuator\\s*</artifactId>',
              label: 'El nombre es spring-boot-starter-actuator',
              message: 'El pack se llama spring-boot-starter-actuator (con "starter" en medio).',
            },
            sinComentar('actuator'),
            siguenLasDemas,
          ],
          xp: 10,
        },
        {
          id: 'm01-l2-c2',
          title: 'Quita devtools',
          instructions: `Hoy no queremos el pack \`spring-boot-devtools\` (ayuda mientras se programa, pero no hace falta).

En \`/pom.xml\`, **borra el bloque completo** de esa dependencia: desde \`<dependency>\` hasta su \`</dependency>\`, incluyendo las líneas de \`scope\` y \`optional\`. No borres ninguna otra dependencia, y no lo dejes comentado.`,
          files: base(),
          activeFile: POM_PATH,
          hints: [
            'Busca spring-boot-devtools en la lista de dependencias: es la cuarta.',
            'Selecciona todas las líneas de ese bloque, de <dependency> a </dependency>, y bórralas.',
            'El bloque tiene 6 líneas: <dependency>, groupId, artifactId (spring-boot-devtools), scope, optional y </dependency>. Si dejas una etiqueta suelta, el pom queda roto.',
          ],
          solution: { [POM_PATH]: POM.replace(DEVTOOLS, '') },
          checks: [
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: 'spring-boot-devtools',
              label: 'Ya no está spring-boot-devtools',
              message: 'Todavía aparece spring-boot-devtools en el pom.xml (aunque sea en un comentario). Bórralo.',
            },
            siguenLasDemas,
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: '<artifactId>\\s*h2\\s*</artifactId>\\s*<scope>\\s*runtime\\s*</scope>',
              label: 'h2 sigue con scope runtime',
              message: 'La dependencia h2 debe seguir igual, con su scope runtime.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: '<dependency>\\s*(<dependency>|</dependencies>)|</dependency>\\s*</dependency>',
              label: 'No quedó ninguna etiqueta suelta',
              message: 'Quedó una etiqueta <dependency> o </dependency> suelta: borra el bloque completo.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm01-l2-c3',
          title: 'Un pack solo para pruebas',
          instructions: `Añade en \`/pom.xml\`, dentro de \`<dependencies>\`, la dependencia:

- \`groupId\`: \`org.springframework.boot\`
- \`artifactId\`: \`spring-boot-starter-test\`
- \`scope\`: **test**, porque solo se usa al hacer pruebas (como el abrelatas, no va en el plato servido).

Escribe el scope como \`<scope>test</scope>\`, debajo del \`artifactId\`.`,
          files: base(),
          activeFile: POM_PATH,
          hints: [
            'Copia un bloque que ya tenga scope, por ejemplo el de h2 (scope runtime), y cámbialo.',
            'Cambia el artifactId a spring-boot-starter-test y el groupId a org.springframework.boot (h2 usa com.h2database, no lo copies).',
            'Debe quedar: <dependency> <groupId>org.springframework.boot</groupId> <artifactId>spring-boot-starter-test</artifactId> <scope>test</scope> </dependency>',
          ],
          solution: { [POM_PATH]: conDependencia(POM, dependencia('spring-boot-starter-test', 'test')) },
          checks: [
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: dentroDeDependencies('spring-boot-starter-test', 'test'),
              label: 'spring-boot-starter-test con scope test',
              message: 'Falta un bloque <dependency> con groupId org.springframework.boot, artifactId spring-boot-starter-test y <scope>test</scope>, dentro de <dependencies>.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: '<artifactId>\\s*spring-boot-starter-test\\s*</artifactId>\\s*</dependency>',
              label: 'El pack no se queda sin scope',
              message: 'A spring-boot-starter-test le falta <scope>test</scope> debajo del artifactId.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: '<artifactId>\\s*spring-boot-starter-test\\s*</artifactId>\\s*<scope>(?!\\s*test\\s*</scope>)',
              label: 'El scope es test, no otro',
              message: 'El scope de spring-boot-starter-test debe ser test (no runtime ni otro).',
            },
            sinComentar('starter-test'),
            siguenLasDemas,
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm01-l3',
      title: 'Carpetas, clase principal y mvnw',
      explanation: `**Las carpetas.** Piensa en tu casa: la cocina es para cocinar y el baño para asearse. En un proyecto Maven cada cosa también tiene su cuarto fijo:

- \`src/main/java\`: **tu código Java**, el que se ejecuta de verdad.
- \`src/main/resources\`: los **recursos**: textos, imágenes y ajustes que no son código Java.
- \`src/test/java\`: el código de las **pruebas** (código que comprueba que lo otro funciona).

Maven sabe dónde buscar porque esos nombres son siempre los mismos.

**Paquete = carpetas.** Dentro de \`src/main/java\`, el \`package\` de una clase es la dirección de su carpeta con puntos. Un archivo en \`src/main/java/com/biblioteca/avisos/\` empieza con \`package com.biblioteca.avisos;\`. Si la carpeta y el \`package\` no coinciden, Java protesta.

**La clase principal.** Toda casa tiene una puerta de entrada. La de Spring Boot es una clase con un método \`main\`:

\`\`\`java
@SpringBootApplication
public class BibliotecaApplication {

  public static void main(String[] args) {
    SpringApplication.run(BibliotecaApplication.class, args);
  }
}
\`\`\`

- \`SpringApplication.run(...)\` es el **botón de encendido**: arranca la aplicación. Le pasas la clase principal para que sepa por dónde empezar.
- \`@SpringBootApplication\` es el **letrero en la puerta**: dice "aquí empieza una aplicación Spring Boot". Además, Spring mira esta clase y **todo lo que hay en su paquete y debajo**; por eso la clase principal vive en \`com.biblioteca\`, en lo más alto, y lo demás cuelga de ahí.

**El wrapper \`mvnw\`.** ¿Y si tu computador no tiene Maven? Para eso existe \`mvnw\` (de "Maven wrapper", un envoltorio): un pequeño script que viaja dentro del proyecto. Es como llevar la olla en la mochila: si no está instalada la versión correcta de Maven, el script la descarga solo. En Windows se usa \`mvnw.cmd\`.

El comando típico es:

\`\`\`
./mvnw spring-boot:run
\`\`\`

Léelo por partes: \`./mvnw\` es "usa Maven"; \`spring-boot:run\` es la orden: "prepara el proyecto (descarga los ingredientes del pom.xml, compila) y **enciende** la aplicación". Esa orden la aporta el \`spring-boot-maven-plugin\` que aparece al final del \`pom.xml\`. Aquí no se ejecuta nada, pero en tu computador lo harás en una terminal, dentro de la carpeta del proyecto.`,
      challenges: [
        {
          id: 'm01-l3-c1',
          title: 'Completa la clase principal',
          instructions: `Abre \`BibliotecaApplication.java\`. A la clase le faltan dos cosas. Añade:

1. La anotación **@SpringBootApplication** en la línea justo encima de \`public class BibliotecaApplication\`.
2. Dentro del método \`main\`, la línea \`SpringApplication.run(BibliotecaApplication.class, args);\`.

Los \`import\` ya están escritos.`,
          files: { [POM_PATH]: POM, [APP]: appCon(false) },
          activeFile: APP,
          hints: [
            'Hay dos huecos: uno encima de la clase (el letrero) y otro dentro de main (el botón de encendido).',
            'Escribe @SpringBootApplication en la línea de arriba de public class. Dentro de main, llama a SpringApplication.run con dos cosas entre paréntesis.',
            'Dentro de main: SpringApplication.run(BibliotecaApplication.class, args);',
          ],
          solution: { [APP]: appCon(true) },
          checks: [
            {
              type: 'file-includes',
              path: APP,
              pattern: '(^|\\n)[ \\t]*@SpringBootApplication\\s+public\\s+class\\s+BibliotecaApplication\\b',
              label: 'La clase lleva @SpringBootApplication justo encima',
              message: 'Falta @SpringBootApplication en la línea justo encima de public class BibliotecaApplication (no vale si está comentada).',
            },
            {
              type: 'file-includes',
              path: APP,
              pattern: '(^|\\n)[ \\t]*SpringApplication\\.run\\s*\\(',
              label: 'main arranca con SpringApplication.run',
              message: 'Dentro de main falta la llamada SpringApplication.run(...).',
            },
            {
              type: 'file-includes',
              path: APP,
              pattern: 'SpringApplication\\.run\\s*\\(\\s*BibliotecaApplication\\.class\\s*,\\s*args\\s*\\)',
              label: 'run recibe BibliotecaApplication.class',
              message: 'La llamada debe ser SpringApplication.run(BibliotecaApplication.class, args).',
            },
            {
              type: 'file-includes',
              path: APP,
              pattern: 'public\\s+static\\s+void\\s+main\\s*\\(\\s*String\\s*\\[\\s*\\]\\s*args\\s*\\)',
              label: 'El método main sigue ahí',
              message: 'El método public static void main(String[] args) debe seguir en la clase.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm01-l3-c2',
          title: 'Cada archivo en su carpeta',
          instructions: `Crea dos archivos nuevos:

1. \`/src/main/resources/bienvenida.txt\` (carpeta de **recursos**) con una sola línea de texto: **Hola desde resources**.
2. \`/src/test/java/com/biblioteca/BibliotecaApplicationTests.java\` (carpeta de **pruebas**) con \`package com.biblioteca;\` y una clase vacía \`public class BibliotecaApplicationTests { }\`.`,
          files: base(),
          activeFile: APP,
          hints: [
            'Usa "Nuevo archivo" dos veces. Las rutas empiezan en src/ (la plataforma pone la / inicial).',
            'El texto va en src/main/resources/bienvenida.txt. La clase de pruebas va en src/test/java/com/biblioteca/ (no en main).',
            'En la clase de pruebas: package com.biblioteca; y debajo public class BibliotecaApplicationTests { }',
          ],
          solution: {
            [TEXTO]: 'Hola desde resources\n',
            [PRUEBA]: 'package com.biblioteca;\n\npublic class BibliotecaApplicationTests {\n}\n',
          },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/main/resources/bienvenida\\.txt$',
              label: 'Existe bienvenida.txt en src/main/resources',
              message: 'No encuentro /src/main/resources/bienvenida.txt. Revisa la ruta.',
            },
            {
              type: 'file-includes',
              path: TEXTO,
              pattern: 'Hola\\s+desde\\s+resources',
              label: 'bienvenida.txt dice "Hola desde resources"',
              message: 'En bienvenida.txt falta el texto Hola desde resources.',
            },
            {
              type: 'file-exists',
              pattern: '^/src/test/java/com/biblioteca/BibliotecaApplicationTests\\.java$',
              label: 'Existe BibliotecaApplicationTests.java en src/test/java',
              message: 'No encuentro /src/test/java/com/biblioteca/BibliotecaApplicationTests.java. Las pruebas van en src/test/java, no en src/main/java.',
            },
            {
              type: 'file-includes',
              path: PRUEBA,
              pattern: 'package\\s+com\\.biblioteca\\s*;?[ \\t]*(\\r?\\n|$)',
              label: 'El paquete del test es com.biblioteca',
              message: 'La primera línea de BibliotecaApplicationTests.java debe ser package com.biblioteca; (igual que su carpeta).',
            },
            {
              type: 'file-includes',
              path: PRUEBA,
              pattern: 'class\\s+BibliotecaApplicationTests\\b',
              label: 'Tiene la clase BibliotecaApplicationTests',
              message: 'Falta la clase BibliotecaApplicationTests.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm01-l3-c3',
          title: 'Integra todo: pom, carpetas y mvnw',
          instructions: `Un último reto que junta lo aprendido:

1. En \`/pom.xml\`, cambia \`<java.version>17</java.version>\` por **21**.
2. En \`/pom.xml\`, añade (dentro de \`<dependencies>\`, sin scope) la dependencia con groupId \`org.springframework.boot\` y artifactId **spring-boot-starter-mail** (pack para enviar correos).
3. Crea \`/src/main/java/com/biblioteca/avisos/Aviso.java\` con \`package com.biblioteca.avisos;\` y una clase vacía \`public class Aviso { }\`.
4. Marca la casilla cuando sepas qué hace \`./mvnw spring-boot:run\` (está explicado en la pestaña **Lección**).`,
          files: base(),
          activeFile: POM_PATH,
          hints: [
            'Son tres cambios de archivo y una casilla. Empieza por el pom.xml: el número de Java está en <properties>.',
            'La dependencia nueva va antes de </dependencies>. Para Aviso.java, la carpeta avisos aparece en la ruta y en el package.',
            'Aviso.java: package com.biblioteca.avisos; y debajo public class Aviso { }. La casilla: mvnw descarga lo necesario y spring-boot:run prepara y enciende la aplicación.',
          ],
          solution: {
            [POM_PATH]: conDependencia(POM, dependencia('spring-boot-starter-mail')).replace('<java.version>17</java.version>', '<java.version>21</java.version>'),
            [AVISO]: 'package com.biblioteca.avisos;\n\npublic class Aviso {\n}\n',
          },
          checks: [
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: '<java\\.version>\\s*21\\s*</java\\.version>',
              label: 'java.version vale 21',
              message: 'En <properties>, <java.version> debe valer 21.',
            },
            {
              type: 'file-excludes',
              path: POM_PATH,
              pattern: '<java\\.version>\\s*17\\s*</java\\.version>',
              label: 'Ya no queda java.version 17',
              message: 'Todavía aparece <java.version>17</java.version>.',
            },
            {
              type: 'file-includes',
              path: POM_PATH,
              pattern: dentroDeDependencies('spring-boot-starter-mail'),
              label: 'Existe la dependencia spring-boot-starter-mail',
              message: 'Falta un bloque <dependency> con groupId org.springframework.boot y artifactId spring-boot-starter-mail, sin scope y dentro de <dependencies>.',
            },
            sinComentar('starter-mail'),
            siguenLasDemas,
            {
              type: 'file-exists',
              pattern: '^/src/main/java/com/biblioteca/avisos/Aviso\\.java$',
              label: 'Existe avisos/Aviso.java',
              message: 'No encuentro /src/main/java/com/biblioteca/avisos/Aviso.java. Revisa la ruta y las mayúsculas.',
            },
            {
              type: 'file-includes',
              path: AVISO,
              pattern: 'package\\s+com\\.biblioteca\\.avisos\\s*;?',
              label: 'El paquete es com.biblioteca.avisos',
              message: 'Falta package com.biblioteca.avisos; al principio de Aviso.java.',
            },
            {
              type: 'file-excludes',
              path: AVISO,
              pattern: 'package\\s+com\\.biblioteca\\s*;',
              label: 'El paquete coincide con la carpeta avisos',
              message: 'El archivo está en la carpeta avisos, así que el paquete es com.biblioteca.avisos, no com.biblioteca.',
            },
            {
              type: 'file-includes',
              path: AVISO,
              pattern: 'public\\s+class\\s+Aviso\\b',
              label: 'Tiene la clase Aviso',
              message: 'Falta public class Aviso en Aviso.java.',
            },
            {
              type: 'manual',
              label: 'Sé que ./mvnw spring-boot:run descarga lo que falta, prepara el proyecto y enciende la aplicación',
            },
          ],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
