// Módulo 3: entidades. Convertir clases Java (Libro y Socio) en tablas con las anotaciones de JPA.
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
const APP_CODE = `package com.biblioteca;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class BibliotecaApplication {

  public static void main(String[] args) {
    SpringApplication.run(BibliotecaApplication.class, args);
  }
}
`

const LIBRO = '/src/main/java/com/biblioteca/models/Libro.java'
const SOCIO = '/src/main/java/com/biblioteca/models/Socio.java'

// ---------- Ayudas para escribir las expresiones regulares ----------
// Principio de línea, con otras anotaciones delante si las hay (@Entity @Table(...) en la misma
// línea). Así "// @Entity" (un comentario) no cuenta: la línea empieza por //, no por @.
const ANOTACION = '@\\w+(?:\\s*\\([^)]*\\))?'
const LINEA = `(?:^|\\n)[ \\t]*(?:${ANOTACION}\\s*)*`
// Una anotación (anot) justo encima de una declaración (decl), con otras anotaciones en medio.
const sobre = (anot, decl) => `${LINEA}${anot}(?:\\s*${ANOTACION})*\\s*${decl}`
const importa = (clase) => `(?:^|\\n)[ \\t]*import\\s+jakarta\\s*\\.\\s*persistence\\s*\\.\\s*(?:\\*|${clase})\\s*;?`
const campo = (tipo, nombre) => `private\\s+${tipo}\\s+${nombre}\\b`

const NULLABLE = 'nullable\\s*=\\s*false\\b'
const UNIQUE = 'unique\\s*=\\s*true\\b'

// ---------- Generador de Libro.java según lo que lleve en cada reto ----------
// o: { entity, table, id, gen, cols (0 nada, 1 titulo+isbn, 2 también autor), vacio, params,
//      javax (imports viejos), campoTitulo (para el reto del error de nombre) }
function libro(o = {}) {
  const usa = []
  if (o.cols) usa.push('Column')
  if (o.entity || o.javax) usa.push('Entity')
  if (o.gen) usa.push('GeneratedValue', 'GenerationType')
  if (o.id) usa.push('Id')
  if (o.table) usa.push('Table')
  const paquete = o.javax ? 'javax' : 'jakarta'
  const imports = usa.length ? `\n${usa.map((c) => `import ${paquete}.persistence.${c};`).join('\n')}\n` : ''
  const cabecera = `${o.entity ? '@Entity\n' : ''}${o.table ? '@Table(name = "libros")\n' : ''}`
  const idAnot = `${o.id ? '  @Id\n' : ''}${o.gen ? '  @GeneratedValue(strategy = GenerationType.IDENTITY)\n' : ''}`
  const col1 = (a) => (o.cols >= 1 ? `  ${a}\n` : '')
  const col2 = (a) => (o.cols >= 2 ? `  ${a}\n` : '')
  const constructores = [
    o.vacio ? '  public Libro() {\n  }\n' : '',
    o.params
      ? '  public Libro(String titulo, String isbn, String autor) {\n    this.titulo = titulo;\n    this.isbn = isbn;\n    this.autor = autor;\n  }\n'
      : '',
  ]
    .filter(Boolean)
    .join('\n')
  return `package com.biblioteca.models;
${imports}
${cabecera}public class Libro {

${idAnot}  private Long id;

${col1('@Column(nullable = false, length = 150)')}  private String ${o.campoTitulo ?? 'titulo'};

${col1('@Column(nullable = false, unique = true, length = 20)')}  private String isbn;

${col2('@Column(name = "nombre_autor", nullable = false, length = 100)')}  private String autor;
${constructores ? `\n${constructores}` : ''}
  public Long getId() {
    return id;
  }

  public String getTitulo() {
    return titulo;
  }

  public void setTitulo(String titulo) {
    this.titulo = titulo;
  }

  public String getIsbn() {
    return isbn;
  }

  public void setIsbn(String isbn) {
    this.isbn = isbn;
  }

  public String getAutor() {
    return autor;
  }

  public void setAutor(String autor) {
    this.autor = autor;
  }
}
`
}

const proyecto = (extra = {}) => ({ '/pom.xml': POM, [APP]: APP_CODE, ...extra })

// Checks que se repiten en los retos de Libro.
const libroEsEntidad = [
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: importa('Entity'),
    label: 'Importa Entity de jakarta.persistence',
    message: 'Falta import jakarta.persistence.Entity; en Libro.java (debajo de la línea package).',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre('@Entity\\b', 'public\\s+class\\s+Libro\\b'),
    label: 'Libro tiene @Entity encima de la clase',
    message: 'Falta la anotación @Entity encima de public class Libro: sin ella, Libro es una clase normal y no se guarda en ninguna tabla.',
  },
]
const sinJavax = (path, nombre) => ({
  type: 'file-excludes',
  path,
  pattern: 'javax\\s*\\.\\s*persistence',
  label: 'No usa javax.persistence',
  message: `${nombre} importa de javax.persistence, el nombre antiguo. En Spring Boot 4 todo viene de jakarta.persistence.`,
})
const libroTieneId = [
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: importa('Id'),
    label: 'Importa Id de jakarta.persistence',
    message: 'Falta import jakarta.persistence.Id; en Libro.java.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre('@Id\\b', campo('Long', 'id')),
    label: '@Id está encima de private Long id',
    message: 'Falta @Id justo encima de private Long id; (el @Id marca el número que identifica a cada libro).',
  },
]
const libroIdentity = [
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: importa('GeneratedValue'),
    label: 'Importa GeneratedValue de jakarta.persistence',
    message: 'Falta import jakarta.persistence.GeneratedValue; en Libro.java.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: importa('GenerationType'),
    label: 'Importa GenerationType de jakarta.persistence',
    message: 'Falta import jakarta.persistence.GenerationType; en Libro.java.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre('@GeneratedValue\\s*\\(\\s*strategy\\s*=\\s*GenerationType\\s*\\.\\s*IDENTITY\\s*\\)', campo('Long', 'id')),
    label: '@GeneratedValue(strategy = GenerationType.IDENTITY) sobre el id',
    message: 'Falta @GeneratedValue(strategy = GenerationType.IDENTITY) encima de private Long id; (junto al @Id).',
  },
]
const libroTabla = [
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: importa('Table'),
    label: 'Importa Table de jakarta.persistence',
    message: 'Falta import jakarta.persistence.Table; en Libro.java.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre('@Table\\s*\\(\\s*name\\s*=\\s*"libros"\\s*\\)', 'public\\s+class\\s+Libro\\b'),
    label: '@Table(name = "libros") encima de la clase',
    message: 'Falta @Table(name = "libros") encima de public class Libro (el nombre va entre comillas dobles y en plural).',
  },
]

const modulo = {
  id: 'm03',
  title: 'Entidades',
  summary: 'Convierte las clases Libro y Socio en tablas de la base de datos con @Entity, @Id, @GeneratedValue, @Table y @Column.',
  lessons: [
    {
      id: 'm03-l1',
      title: 'La ficha del libro: @Entity, @Id y @Table',
      explanation: `Antes de los ordenadores, las bibliotecas tenían un **fichero**: un mueble con cajones llenos de **fichas de cartulina**, una por libro. Cada ficha tenía las mismas casillas: título, ISBN, autor.

Una **entidad** es exactamente eso: el modelo de la ficha. En la base de datos:

| Biblioteca de antes | Base de datos |
|---|---|
| El cajón de las fichas | La **tabla** \`libros\` |
| Una ficha | Una **fila** (un libro concreto) |
| Una casilla de la ficha | Una **columna** (\`titulo\`, \`isbn\`…) |

La clase \`Libro\` ya la sabes escribir: atributos, getters y setters. Lo nuevo es avisar a Spring de que esa clase **es una ficha que hay que guardar**. De eso se encarga **JPA** (viene con \`spring-boot-starter-data-jpa\`, que ya está en tu \`pom.xml\`). Con el \`spring.jpa.hibernate.ddl-auto\` del módulo anterior, JPA crea la tabla solo al arrancar, y con \`spring.jpa.show-sql=true\` verías en la consola el \`create table libros ...\`.

Las entidades van en el paquete \`com.biblioteca.models\` (la carpeta \`/src/main/java/com/biblioteca/models/\`).

**Las anotaciones de hoy** (todas se importan de \`jakarta.persistence\`):

- \`@Entity\` encima de la clase: "esta clase es una ficha: guárdala en una tabla". **Sin \`@Entity\`, la clase es normal y JPA la ignora**: no hay tabla.
- \`@Id\` encima del atributo \`id\`: el **número de registro** de la ficha. Dos fichas nunca tienen el mismo, y así se encuentra cada libro sin confusión. Toda entidad necesita uno.
- \`@GeneratedValue(strategy = GenerationType.IDENTITY)\` junto al \`@Id\`: como la **máquina de turnos de la panadería**, tú no eliges el número: la base de datos pone 1, 2, 3… sola. Por eso el \`id\` es \`Long\` y no tiene setter.
- \`@Table(name = "libros")\` encima de la clase: elige el **nombre del cajón**. Sin ella, la tabla se llamaría como la clase (\`libro\`). Se suele usar el plural.

Ojo: en tutoriales antiguos verás \`javax.persistence\`. Es el **nombre viejo**: en Spring Boot 4 es siempre \`jakarta.persistence\`. Con \`javax\` el proyecto no compila.

\`\`\`java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Libro {

  @Id
  private Long id;
  ...
}
\`\`\``,
      challenges: [
        {
          id: 'm03-l1-c1',
          title: 'Convierte Libro en una entidad',
          instructions: `Abre \`Libro.java\` (en \`/src/main/java/com/biblioteca/models/\`). Es una clase normal: vamos a convertirla en una ficha de la base de datos.

1. Debajo de \`package com.biblioteca.models;\` añade los imports \`import jakarta.persistence.Entity;\` e \`import jakarta.persistence.Id;\`
2. Escribe **@Entity** justo encima de \`public class Libro\`.
3. Escribe **@Id** justo encima de \`private Long id;\``,
          files: proyecto({ [LIBRO]: libro() }),
          activeFile: LIBRO,
          hints: [
            'Una anotación es una etiqueta que empieza por @ y se escribe en la línea de encima de lo que etiqueta.',
            'Los imports van entre la línea package y la clase. Las dos clases vienen de jakarta.persistence (no de javax).',
            'Debe quedar: import jakarta.persistence.Entity; import jakarta.persistence.Id; luego @Entity encima de public class Libro, y @Id encima de private Long id;',
          ],
          solution: { [LIBRO]: libro({ entity: true, id: true }) },
          checks: [...libroEsEntidad, ...libroTieneId, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
        {
          id: 'm03-l1-c2',
          title: 'Que la base de datos ponga el número',
          instructions: `No queremos inventar el \`id\` de cada libro a mano: que lo ponga la base de datos (1, 2, 3…).

1. Añade los imports \`import jakarta.persistence.GeneratedValue;\` e \`import jakarta.persistence.GenerationType;\`
2. Justo debajo de \`@Id\` (encima de \`private Long id;\`) escribe **@GeneratedValue(strategy = GenerationType.IDENTITY)**.`,
          files: proyecto({ [LIBRO]: libro({ entity: true, id: true }) }),
          activeFile: LIBRO,
          hints: [
            'La anotación que hace que el número se ponga solo se llama @GeneratedValue y va junto al @Id.',
            'Entre paréntesis le dices la estrategia: strategy = GenerationType.IDENTITY (la base de datos cuenta 1, 2, 3…).',
            'Quedan dos líneas seguidas encima del id: @Id y debajo @GeneratedValue(strategy = GenerationType.IDENTITY)',
          ],
          solution: { [LIBRO]: libro({ entity: true, id: true, gen: true }) },
          checks: [...libroIdentity, ...libroTieneId, ...libroEsEntidad, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
        {
          id: 'm03-l1-c3',
          title: 'Ponle nombre a la tabla',
          instructions: `Sin indicar nada, la tabla se llamaría \`libro\`. Queremos que se llame **libros**, en plural.

1. Añade \`import jakarta.persistence.Table;\`
2. Debajo de \`@Entity\` (encima de \`public class Libro\`) escribe **@Table(name = "libros")**.`,
          files: proyecto({ [LIBRO]: libro({ entity: true, id: true, gen: true }) }),
          activeFile: LIBRO,
          hints: [
            '@Table sirve para elegir el nombre de la tabla. Va encima de la clase, junto a @Entity.',
            'El nombre se da con name = y el texto va entre comillas dobles.',
            'Encima de public class Libro deben quedar dos líneas: @Entity y @Table(name = "libros")',
          ],
          solution: { [LIBRO]: libro({ entity: true, table: true, id: true, gen: true }) },
          checks: [...libroTabla, ...libroEsEntidad, ...libroIdentity, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
