// Módulo 0: cómo se usa la plataforma. No enseña Spring Boot ni Java: solo a moverse por el editor.
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
    <version>3.5.7</version>
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
      <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
      <groupId>com.h2database</groupId>
      <artifactId>h2</artifactId>
      <scope>runtime</scope>
    </dependency>
    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-starter-test</artifactId>
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

const appCon = (proyecto) => `package com.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// Proyecto: ${proyecto}
@SpringBootApplication
public class BibliotecaApplication {

  public static void main(String[] args) {
    SpringApplication.run(BibliotecaApplication.class, args);
  }
}
`

const BIENVENIDA = '/src/main/java/com/biblioteca/Bienvenida.java'
const bienvenidaCon = (mensaje) => `package com.biblioteca;

public class Bienvenida {

  public static final String MENSAJE = "${mensaje}";
}
`

const HOLA = '/src/main/java/com/biblioteca/Hola.java'
const MENSAJES = '/src/main/java/com/biblioteca/util/Mensajes.java'

const HORARIO = '/src/main/java/com/biblioteca/Horario.java'
const horarioCon = (cierre) => `package com.biblioteca;

public class Horario {

  private String apertura = "9:00";
  private String cierre = "${cierre}";

  public String getApertura() {
    return apertura;
  }

  public String getCierre() {
    return cierre;
  }
}
`

const NOTAS = '/NOTAS.md'

// Archivos con los que empieza cada reto: el proyecto Biblioteca tal como queda tras m00-l1.
const proyecto = (extra = {}) => ({ '/pom.xml': POM, [APP]: appCon('Biblioteca'), ...extra })

const modulo = {
  id: 'm00',
  title: 'Bienvenida',
  summary: 'Aprende a usar la plataforma: abrir y crear archivos, comprobar tu código, pedir pistas y ver la solución.',
  lessons: [
    {
      id: 'm00-l1',
      title: 'Cómo funciona esta plataforma',
      explanation: `Piensa en una **receta de cocina**: arriba dice qué plato vas a preparar y debajo explica cómo se hace. Aquí pasa lo mismo:

- La pestaña **Reto** dice qué tienes que hacer ahora.
- La pestaña **Lección** explica lo que necesitas saber. Puedes cambiar entre las dos cuando quieras.

A la derecha está el **editor**, con una **pestaña por cada archivo** del proyecto. La pestaña muestra solo el nombre (\`BibliotecaApplication.java\`); si dejas el ratón encima, verás la ruta completa (\`/src/main/java/com/biblioteca/BibliotecaApplication.java\`). Haz clic en una pestaña para abrir ese archivo.

Durante todo el curso construiremos el mismo proyecto: una **Biblioteca** (con libros, socios y préstamos).

Una cosa importante: aquí **tu código no se ejecuta** y no hay vista previa. Cuando pulsas **Comprobar**, la plataforma **lee el texto** de tus archivos, como un profesor que revisa los deberes en papel. Por eso es importante escribir los nombres y textos **exactamente** como pide el reto.`,
      challenges: [
        {
          id: 'm00-l1-c1',
          title: 'Ponle nombre al proyecto',
          instructions: `En el archivo \`BibliotecaApplication.java\` (ya está abierto) hay un comentario que dice:

\`// Proyecto: Mi proyecto\`

Cámbialo para que diga **// Proyecto: Biblioteca**. No toques nada más. Luego pulsa **Comprobar**.`,
          files: { '/pom.xml': POM, [APP]: appCon('Mi proyecto') },
          activeFile: APP,
          hints: [
            'Busca la línea que empieza con // (dos barras): es un comentario, un texto para personas.',
            'En esa línea, borra las palabras "Mi proyecto".',
            'Escribe Biblioteca en su lugar, para que la línea quede: // Proyecto: Biblioteca',
          ],
          solution: { [APP]: appCon('Biblioteca') },
          checks: [
            {
              type: 'file-includes',
              path: APP,
              pattern: '//\\s*Proyecto\\s*:\\s*Biblioteca\\b',
              label: 'El comentario dice "// Proyecto: Biblioteca"',
              message: 'En BibliotecaApplication.java no encuentro el comentario // Proyecto: Biblioteca.',
            },
            {
              type: 'file-excludes',
              path: APP,
              pattern: 'Mi proyecto',
              label: 'Ya no queda "Mi proyecto"',
              message: 'Todavía aparece "Mi proyecto": cámbialo por Biblioteca.',
            },
            {
              type: 'file-includes',
              path: APP,
              pattern: 'public\\s+class\\s+BibliotecaApplication\\b',
              label: 'La clase BibliotecaApplication sigue ahí',
              message: 'Parece que se borró la línea public class BibliotecaApplication. Usa "Reiniciar reto" si lo necesitas.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm00-l1-c2',
          title: 'Abre otro archivo',
          instructions: `Ahora el editor abre \`BibliotecaApplication.java\`, pero el cambio va en otro archivo.

1. Haz clic en la pestaña **Bienvenida.java** (su ruta es \`/src/main/java/com/biblioteca/Bienvenida.java\`).
2. Cambia el texto \`"Texto por cambiar"\` por **"Hola, Biblioteca"** (con las comillas).`,
          files: proyecto({ [BIENVENIDA]: bienvenidaCon('Texto por cambiar') }),
          activeFile: APP,
          hints: [
            'Mira la fila de pestañas encima del editor: una se llama Bienvenida.java. Haz clic en ella.',
            'Dentro verás MENSAJE = "Texto por cambiar". Solo cambia lo que está entre las comillas.',
            'La línea debe quedar: public static final String MENSAJE = "Hola, Biblioteca";',
          ],
          solution: { [BIENVENIDA]: bienvenidaCon('Hola, Biblioteca') },
          checks: [
            {
              type: 'file-includes',
              path: BIENVENIDA,
              pattern: 'MENSAJE\\s*=\\s*"Hola,\\s*Biblioteca"',
              label: 'MENSAJE vale "Hola, Biblioteca"',
              message: 'En Bienvenida.java, MENSAJE todavía no vale "Hola, Biblioteca".',
            },
            {
              type: 'file-excludes',
              path: BIENVENIDA,
              pattern: 'Texto por cambiar',
              label: 'Ya no queda "Texto por cambiar"',
              message: 'Todavía aparece "Texto por cambiar" en Bienvenida.java.',
            },
            {
              type: 'file-excludes',
              path: APP,
              pattern: 'Hola,\\s*Biblioteca',
              label: 'BibliotecaApplication.java no se tocó',
              message: 'El texto "Hola, Biblioteca" va en Bienvenida.java, no en BibliotecaApplication.java.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm00-l2',
      title: 'Crear archivos nuevos',
      explanation: `La ruta de un archivo es como una **dirección postal**: país, ciudad, calle y número. \`/src/main/java/com/biblioteca/Hola.java\` se lee igual: dentro de \`src\`, dentro de \`main\`, dentro de \`java\`, dentro de \`com\`, dentro de \`biblioteca\`, está el archivo \`Hola.java\`.

Para crear un archivo:

1. Pulsa **Nuevo archivo** (junto a las pestañas).
2. Escribe la **ruta completa**, por ejemplo \`src/main/java/com/biblioteca/Hola.java\`. Si la carpeta no existe, se crea sola.
3. Pulsa **Crear**. El archivo nuevo se abre vacío en su propia pestaña.

En Java, la primera línea de cada clase dice en qué carpeta vive, con puntos en lugar de barras: el archivo de la carpeta \`com/biblioteca\` empieza con \`package com.biblioteca;\`.`,
      challenges: [
        {
          id: 'm00-l2-c1',
          title: 'Tu primer archivo',
          instructions: `Crea el archivo \`/src/main/java/com/biblioteca/Hola.java\` con este contenido:

1. Primera línea: \`package com.biblioteca;\`
2. Después, una clase vacía llamada **Hola**: \`public class Hola { }\``,
          files: proyecto(),
          activeFile: APP,
          hints: [
            'Pulsa el botón "Nuevo archivo" que está junto a las pestañas.',
            'Escribe la ruta completa: src/main/java/com/biblioteca/Hola.java y pulsa Crear.',
            'En el archivo vacío escribe package com.biblioteca; y debajo public class Hola { }',
          ],
          solution: { [HOLA]: 'package com.biblioteca;\n\npublic class Hola {\n}\n' },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/main/java/com/biblioteca/Hola\\.java$',
              label: 'Existe el archivo Hola.java en com/biblioteca',
              message: 'No encuentro /src/main/java/com/biblioteca/Hola.java. Revisa la ruta y las mayúsculas (Hola con H mayúscula).',
            },
            {
              type: 'file-includes',
              path: HOLA,
              pattern: 'package\\s+com\\.biblioteca\\s*;?[ \\t]*(\\r?\\n|$)',
              label: 'Empieza con package com.biblioteca;',
              message: 'Falta la línea package com.biblioteca; al principio de Hola.java.',
            },
            {
              type: 'file-includes',
              path: HOLA,
              pattern: 'public\\s+class\\s+Hola\\b',
              label: 'Tiene la clase Hola',
              message: 'Falta public class Hola en Hola.java.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm00-l2-c2',
          title: 'Un archivo en una carpeta nueva',
          instructions: `Crea el archivo \`/src/main/java/com/biblioteca/util/Mensajes.java\` (la carpeta \`util\` se crea sola).

1. Primera línea: \`package com.biblioteca.util;\` (fíjate: termina en \`.util\`, igual que la carpeta).
2. Después, una clase vacía llamada **Mensajes**: \`public class Mensajes { }\``,
          files: proyecto(),
          activeFile: APP,
          hints: [
            'Igual que antes: botón "Nuevo archivo" y la ruta completa, ahora con util/ antes del nombre.',
            'La ruta es src/main/java/com/biblioteca/util/Mensajes.java.',
            'Contenido: package com.biblioteca.util; y debajo public class Mensajes { }',
          ],
          solution: { [MENSAJES]: 'package com.biblioteca.util;\n\npublic class Mensajes {\n}\n' },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/main/java/com/biblioteca/util/Mensajes\\.java$',
              label: 'Existe util/Mensajes.java',
              message: 'No encuentro /src/main/java/com/biblioteca/util/Mensajes.java. Revisa la ruta y las mayúsculas.',
            },
            {
              type: 'file-includes',
              path: MENSAJES,
              pattern: 'package\\s+com\\.biblioteca\\.util\\s*;?',
              label: 'Empieza con package com.biblioteca.util;',
              message: 'Falta la línea package com.biblioteca.util; en Mensajes.java.',
            },
            {
              type: 'file-excludes',
              path: MENSAJES,
              pattern: 'package\\s+com\\.biblioteca\\s*;',
              label: 'El paquete coincide con la carpeta',
              message: 'El archivo está en la carpeta util, así que el paquete es com.biblioteca.util, no com.biblioteca.',
            },
            {
              type: 'file-includes',
              path: MENSAJES,
              pattern: 'public\\s+class\\s+Mensajes\\b',
              label: 'Tiene la clase Mensajes',
              message: 'Falta public class Mensajes en Mensajes.java.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm00-l3',
      title: 'Pistas, solución y reiniciar',
      explanation: `Un GPS no te da todo el viaje de golpe: te dice "gira a la derecha", y luego la siguiente indicación. Las **pistas** funcionan igual:

- **Pista** muestra una ayuda; si la vuelves a pulsar, aparece la siguiente, cada vez más concreta.
- **Ver solución** pone la respuesta en el editor. Úsala si te atascas, pero el reto te dará **solo la mitad de XP**.
- **Reiniciar reto** deja los archivos como estaban al principio. Útil si borraste algo sin querer.

Tu código se guarda solo mientras escribes: puedes cerrar la página y seguir otro día.

Algunos retos tienen una **casilla** para marcar tú mismo: la plataforma confía en ti para esa parte.`,
      challenges: [
        {
          id: 'm00-l3-c1',
          title: 'Usa las pistas',
          instructions: `Abre la pestaña **Horario.java**. La biblioteca cierra a las 18:00, pero el campo \`cierre\` todavía vale \`"??"\`.

Haz que \`cierre\` valga **"18:00"**. Si no sabes por dónde empezar, pulsa **Pista** (una vez, y otra, y otra).`,
          files: proyecto({ [HORARIO]: horarioCon('??') }),
          activeFile: APP,
          hints: [
            'Haz clic en la pestaña Horario.java, encima del editor.',
            'Busca la línea private String cierre = "??"; (está justo debajo de apertura).',
            'Cambia "??" por "18:00", para que quede: private String cierre = "18:00";',
          ],
          solution: { [HORARIO]: horarioCon('18:00') },
          checks: [
            {
              type: 'file-includes',
              path: HORARIO,
              pattern: 'cierre\\s*=\\s*"18:00"',
              label: 'cierre vale "18:00"',
              message: 'En Horario.java, cierre todavía no vale "18:00".',
            },
            {
              type: 'file-excludes',
              path: HORARIO,
              pattern: '"\\?\\?"',
              label: 'Ya no queda "??"',
              message: 'Todavía aparece "??" en Horario.java.',
            },
            {
              type: 'file-includes',
              path: HORARIO,
              pattern: 'apertura\\s*=\\s*"9:00"',
              label: 'apertura sigue valiendo "9:00"',
              message: 'apertura debe seguir valiendo "9:00": solo cambia cierre.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm00-l3-c2',
          title: 'Listo para empezar',
          instructions: `Último paso de la bienvenida:

1. Abre la pestaña **NOTAS.md** (está en la raíz del proyecto: \`/NOTAS.md\`) y escribe debajo la frase **Listo para empezar**.
2. Marca la casilla de abajo cuando sepas para qué sirven **Ver solución** y **Reiniciar reto** (lo explica la pestaña **Lección**).`,
          files: proyecto({ [NOTAS]: '# Mis notas\n\nEscribe aquí debajo:\n' }),
          activeFile: APP,
          hints: [
            'NOTAS.md es un archivo de texto normal: haz clic en su pestaña.',
            'Escribe Listo para empezar en una línea nueva, al final.',
            'Si no recuerdas qué hacen Ver solución y Reiniciar reto, abre la pestaña Lección y lee la lista.',
          ],
          solution: { [NOTAS]: '# Mis notas\n\nEscribe aquí debajo:\n\nListo para empezar\n' },
          checks: [
            {
              type: 'file-includes',
              path: NOTAS,
              pattern: '[Ll]isto\\s+para\\s+empezar',
              label: 'NOTAS.md dice "Listo para empezar"',
              message: 'En NOTAS.md no encuentro la frase Listo para empezar.',
            },
            {
              type: 'manual',
              label: 'Sé que "Ver solución" da la mitad de XP y que "Reiniciar reto" vuelve al principio',
            },
          ],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
