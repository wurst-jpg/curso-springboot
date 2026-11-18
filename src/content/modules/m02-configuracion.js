// Módulo 2: configuración con application.properties (nombre, puerto, base de datos H2, consola y JPA).
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

const APP = '/src/main/java/com/biblioteca/BibliotecaApplication.java'
const PROPS = '/src/main/resources/application.properties'

const APP_JAVA = `package com.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BibliotecaApplication {

  public static void main(String[] args) {
    SpringApplication.run(BibliotecaApplication.class, args);
  }
}
`

// Texto de un .properties a partir de sus líneas.
const props = (...lineas) => lineas.join('\n') + '\n'

// Regex de una línea "clave = valor" en un .properties: tolera espacios alrededor del =, sangría
// y saltos de línea Windows. Debe empezar la línea, así que un comentario (# clave=valor) no vale.
// `valor` ya es un trozo de regex.
const linea = (clave, valor) =>
  '(^|\\n)[ \\t]*' + clave.replace(/\./g, '\\.') + '[ \\t]*=[ \\t]*' + valor + '[ \\t]*(\\r?\\n|$)'

// Archivos con los que empieza cada reto: el proyecto Biblioteca más lo que se indique.
const proyecto = (extra = {}) => ({ '/pom.xml': POM, [APP]: APP_JAVA, ...extra })

// Líneas que se van acumulando reto a reto (la solución de uno es el inicio del siguiente).
const NOMBRE = 'spring.application.name=biblioteca'
const PUERTO = 'server.port=8081'
const URL = 'spring.datasource.url=jdbc:h2:mem:biblioteca'
const USUARIO = 'spring.datasource.username=sa'
const CLAVE = 'spring.datasource.password=${DB_PASSWORD:}'
const CONSOLA = ['spring.h2.console.enabled=true', 'spring.h2.console.path=/h2-console']
const SQL = 'spring.jpa.show-sql=true'

const modulo = {
  id: 'm02',
  title: 'Configuración',
  summary: 'Ajusta tu aplicación con application.properties: nombre, puerto, base de datos H2 y su consola, y cómo se crean las tablas.',
  lessons: [
    {
      id: 'm02-l1',
      title: 'application.properties: el panel de ajustes',
      explanation: `Tu teléfono tiene un **panel de ajustes**: ahí cambias el volumen, el brillo o el idioma sin tocar el teléfono por dentro. Spring Boot también tiene su panel de ajustes: el archivo **\`application.properties\`**.

Vive en la carpeta de recursos que viste en el módulo anterior: \`/src/main/resources/application.properties\`. Spring Boot lo lee al arrancar y se comporta según lo que diga.

Cada ajuste es una línea con el formato **clave=valor**:

\`\`\`properties
# Esto es un comentario: Spring lo ignora, es solo para personas
spring.application.name=biblioteca
server.port=8081
\`\`\`

- La **clave** (a la izquierda) es el nombre del ajuste. Es como la etiqueta "Brillo".
- El **valor** (a la derecha) es lo que eliges. Es como la barra puesta a la mitad.
- Una línea que empieza con **\`#\`** es un **comentario**: sirve para anotar, pero no cuenta como ajuste. Si pones \`#\` delante de un ajuste, lo apagas.
- Los espacios alrededor del \`=\` no molestan, pero lo normal es no ponerlos.

Dos ajustes muy comunes:

- \`spring.application.name\`: el **nombre** de tu aplicación. Sirve para reconocerla (en registros y herramientas). Aquí es \`biblioteca\`.
- \`server.port\`: el **puerto**, o sea, la "puerta" por la que tu aplicación recibe visitas. Por defecto es la **8080**. Si otra aplicación ya usa esa puerta, eliges otra, como la 8081. Es como dos tiendas en el mismo edificio: cada una necesita su propia puerta.

Recuerda: aquí no se ejecuta nada, "Comprobar" lee el texto del archivo. Escribe las claves exactamente igual.`,
      challenges: [
        {
          id: 'm02-l1-c1',
          title: 'Crea application.properties con el nombre',
          instructions: `Crea el archivo \`/src/main/resources/application.properties\` (usa **Nuevo archivo** y escribe la ruta \`src/main/resources/application.properties\`).

Dentro escribe una sola línea, el nombre de la aplicación:

\`spring.application.name=biblioteca\``,
          files: proyecto(),
          activeFile: APP,
          hints: [
            'Pulsa "Nuevo archivo". La carpeta resources se crea sola si no existe.',
            'La ruta completa es src/main/resources/application.properties (todo en minúsculas).',
            'En el archivo vacío escribe una línea: spring.application.name=biblioteca (sin # delante).',
          ],
          solution: { [PROPS]: props(NOMBRE) },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/main/resources/application\\.properties$',
              label: 'Existe application.properties en src/main/resources',
              message: 'No encuentro /src/main/resources/application.properties. Revisa la ruta y que se escriba todo en minúsculas.',
            },
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.application.name', 'biblioteca'),
              label: 'spring.application.name vale biblioteca',
              message: 'Falta la línea spring.application.name=biblioteca (sin # delante, es un ajuste de verdad).',
            },
          ],
          xp: 10,
        },
        {
          id: 'm02-l1-c2',
          title: 'Cambia el puerto a 8081',
          instructions: `Tu compañero ya usa el puerto 8080 con otra aplicación. Abre \`application.properties\` y cambia \`server.port\` para que valga **8081**.

Deja intacto \`spring.application.name\`.`,
          files: proyecto({ [PROPS]: props('# Panel de ajustes de la Biblioteca', NOMBRE, 'server.port=8080') }),
          activeFile: PROPS,
          hints: [
            'Abre la pestaña application.properties y busca la línea que empieza con server.port.',
            'Solo cambia el número que está después del =.',
            'La línea debe quedar: server.port=8081',
          ],
          solution: { [PROPS]: props('# Panel de ajustes de la Biblioteca', NOMBRE, PUERTO) },
          checks: [
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('server.port', '8081'),
              label: 'server.port vale 8081',
              message: 'En application.properties falta la línea server.port=8081.',
            },
            {
              type: 'file-excludes',
              path: PROPS,
              pattern: linea('server.port', '8080'),
              label: 'Ya no queda el puerto 8080',
              message: 'Todavía aparece server.port=8080: cámbialo por 8081.',
            },
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.application.name', 'biblioteca'),
              label: 'spring.application.name sigue valiendo biblioteca',
              message: 'No borres spring.application.name=biblioteca: solo cambia el puerto.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm02-l2',
      title: 'La base de datos H2 y su consola',
      explanation: `Una aplicación de biblioteca necesita un lugar donde **guardar** libros, socios y préstamos: una **base de datos**. En el curso usamos **H2**, una base de datos pequeñita que vive dentro de tu propia aplicación (por eso el \`pom.xml\` ya la trae, junto con \`spring-boot-h2console\`, que veremos abajo). No hay que instalar nada.

H2 se puede usar de dos formas, y se elige con la **URL**:

- **En memoria**: \`jdbc:h2:mem:biblioteca\`. Es una **pizarra**: mientras la aplicación está encendida, todo lo escrito se queda; al apagarla, se borra. Perfecta para practicar.
- **En archivo**: \`jdbc:h2:file:./data/biblioteca\`. Es un **cuaderno**: lo escrito se guarda en un archivo y sigue ahí mañana.

\`mem\` o \`file\` es la única diferencia; \`biblioteca\` es el nombre que le damos a la base. En el curso usaremos **mem**.

Los ajustes de conexión son tres:

\`\`\`properties
spring.datasource.url=jdbc:h2:mem:biblioteca
spring.datasource.username=sa
spring.datasource.password=\${DB_PASSWORD:}
\`\`\`

- \`url\`: dónde está la base. \`username\`: quién entra (\`sa\` es el usuario por defecto de H2).
- \`password\`: la contraseña. **Una contraseña nunca se escribe en el archivo**, porque el archivo se comparte y lo vería todo el mundo, como pegar la clave del wifi en la puerta. En proyectos reales se guarda en una **variable de entorno** (un valor que vive en el ordenador, fuera del código). La forma \`\${DB_PASSWORD:}\` significa: "toma el valor de la variable \`DB_PASSWORD\`; si no existe, usa vacío (lo que después de los dos puntos)". H2 en clase no necesita clave, por eso queda vacío.

**La consola de H2** es una ventana en el navegador para **mirar dentro** de la base, como abrir la vitrina del archivo para ver las fichas. Se activa con:

\`\`\`properties
spring.h2.console.enabled=true
spring.h2.console.path=/h2-console
\`\`\`

\`enabled=true\` la enciende (por defecto está apagada, por seguridad) y \`path\` es la dirección: con el puerto 8081 la abrirías en \`http://localhost:8081/h2-console\`. Para que exista, el \`pom.xml\` necesita el módulo \`spring-boot-h2console\`, y ya está en el tuyo.`,
      challenges: [
        {
          id: 'm02-l2-c1',
          title: 'H2 en memoria: url y usuario',
          instructions: `En \`application.properties\` la base apunta a un **archivo** y el usuario es \`root\`. Para practicar queremos la **pizarra** (memoria). Cambia estas dos líneas:

- \`spring.datasource.url\` debe valer **jdbc:h2:mem:biblioteca**
- \`spring.datasource.username\` debe valer **sa**`,
          files: proyecto({
            [PROPS]: props(NOMBRE, PUERTO, 'spring.datasource.url=jdbc:h2:file:./data/biblioteca', 'spring.datasource.username=root'),
          }),
          activeFile: PROPS,
          hints: [
            'Mira las dos líneas que empiezan con spring.datasource. Cambia solo lo que va después del =.',
            'En la url, cambia file:./data/ por mem: (la url acaba en biblioteca). El usuario es sa.',
            'Quedan: spring.datasource.url=jdbc:h2:mem:biblioteca y spring.datasource.username=sa',
          ],
          solution: { [PROPS]: props(NOMBRE, PUERTO, URL, USUARIO) },
          checks: [
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.datasource.url', 'jdbc:h2:mem:biblioteca'),
              label: 'La url es jdbc:h2:mem:biblioteca',
              message: 'Falta la línea spring.datasource.url=jdbc:h2:mem:biblioteca.',
            },
            {
              type: 'file-excludes',
              path: PROPS,
              pattern: linea('spring.datasource.url', 'jdbc:h2:file:\\S*'),
              label: 'Ya no se usa la base en archivo',
              message: 'La url todavía usa jdbc:h2:file: (el cuaderno). Cámbiala a jdbc:h2:mem:biblioteca (la pizarra).',
            },
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.datasource.username', 'sa'),
              label: 'El usuario es sa',
              message: 'Falta la línea spring.datasource.username=sa.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm02-l2-c2',
          title: 'La contraseña va en una variable de entorno',
          instructions: `Añade a \`application.properties\` la línea de la contraseña, **sin escribir ninguna clave a mano**:

\`spring.datasource.password=\${DB_PASSWORD:}\`

Así Spring la toma de la variable de entorno \`DB_PASSWORD\` (y queda vacía si no existe).`,
          files: proyecto({ [PROPS]: props(NOMBRE, PUERTO, URL, USUARIO) }),
          activeFile: PROPS,
          hints: [
            'Añade una línea nueva al final del archivo, debajo de spring.datasource.username.',
            'La clave del ajuste es spring.datasource.password. El valor va entre llaves, después de un signo de dinero.',
            'La línea completa es: spring.datasource.password=${DB_PASSWORD:}',
          ],
          solution: { [PROPS]: props(NOMBRE, PUERTO, URL, USUARIO, CLAVE) },
          checks: [
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.datasource.password', '\\$\\{DB_PASSWORD:[^}\\s]*\\}'),
              label: 'La contraseña sale de la variable DB_PASSWORD',
              message: 'Falta la línea spring.datasource.password=${DB_PASSWORD:} (con las llaves y los dos puntos).',
            },
            {
              type: 'file-excludes',
              path: PROPS,
              pattern: linea('spring.datasource.password', '[^$\\s]\\S*'),
              label: 'No hay ninguna contraseña escrita a mano',
              message: 'No escribas la contraseña directamente: usa ${DB_PASSWORD:} para tomarla de una variable de entorno.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm02-l2-c3',
          title: 'Enciende la consola de H2',
          instructions: `La consola de H2 está apagada (\`enabled=false\`). Haz estos dos cambios en \`application.properties\`:

- \`spring.h2.console.enabled\` debe valer **true**
- Añade \`spring.h2.console.path\` con el valor **/h2-console**`,
          files: proyecto({ [PROPS]: props(NOMBRE, PUERTO, URL, USUARIO, CLAVE, 'spring.h2.console.enabled=false') }),
          activeFile: PROPS,
          hints: [
            'Busca la línea spring.h2.console.enabled: ahora termina en false.',
            'Cámbiala a true y añade debajo otra línea con la clave spring.h2.console.path.',
            'Quedan: spring.h2.console.enabled=true y spring.h2.console.path=/h2-console',
          ],
          solution: { [PROPS]: props(NOMBRE, PUERTO, URL, USUARIO, CLAVE, ...CONSOLA) },
          checks: [
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.h2.console.enabled', 'true'),
              label: 'La consola está encendida (enabled=true)',
              message: 'Falta la línea spring.h2.console.enabled=true.',
            },
            {
              type: 'file-excludes',
              path: PROPS,
              pattern: linea('spring.h2.console.enabled', 'false'),
              label: 'Ya no queda enabled=false',
              message: 'Todavía aparece spring.h2.console.enabled=false: cámbialo a true.',
            },
            {
              type: 'file-includes',
              path: PROPS,
              pattern: linea('spring.h2.console.path', '/h2-console'),
              label: 'La dirección es /h2-console',
              message: 'Falta la línea spring.h2.console.path=/h2-console.',
            },
          ],
          xp: 10,
        },
      ],
    },
//LECCIONES
  ],
}

export default modulo
