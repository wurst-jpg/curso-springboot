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
// Espacios y comentarios entre anotaciones (// hasta el final de la línea, /* ... */ y /** ... */).
// El // se come la línea entera (lookahead), así no puede "saltarse" un // @Id comentado.
const HUECO = '(?:\\s|//[^\\n]*(?=\\n|$)|/\\*[\\s\\S]*?\\*/)*'
const LINEA = `(?:^|\\n)[ \\t]*(?:${ANOTACION}${HUECO})*`
// Una anotación (anot) justo encima de una declaración (decl), con otras anotaciones en medio.
const sobre = (anot, decl) => `${LINEA}${anot}(?:${HUECO}${ANOTACION})*${HUECO}${decl}`
// @Column(...) que contiene todas las condiciones, en cualquier orden (lookaheads).
const columna = (...conds) => `@Column\\s*\\(${conds.map((c) => `(?=[^)]*\\b${c})`).join('')}[^)]*\\)`
const importa = (clase) => `(?:^|\\n)[ \\t]*import\\s+jakarta\\s*\\.\\s*persistence\\s*\\.\\s*(?:\\*|${clase}\\b)\\s*;?`
const campo = (tipo, nombre) => `private\\s+${tipo}\\s+${nombre}\\b`

const NULLABLE = 'nullable\\s*=\\s*false\\b'
const UNIQUE = 'unique\\s*=\\s*true\\b'
const largo = (n) => `length\\s*=\\s*${n}\\b`

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
  const jpa = usa.length ? `\n${usa.map((c) => `import ${paquete}.persistence.${c};`).join('\n')}\n` : ''
  const imports = `\nimport java.util.UUID;\n${jpa}`
  const cabecera = `${o.entity ? '@Entity\n' : ''}${o.table ? '@Table(name = "libros")\n' : ''}`
  const idAnot = `${o.id ? '  @Id\n' : ''}${o.gen ? '  @GeneratedValue(strategy = GenerationType.UUID)\n' : ''}`
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

${idAnot}  private UUID id;

${col1('@Column(nullable = false, length = 150)')}  private String ${o.campoTitulo ?? 'titulo'};

${col1('@Column(nullable = false, unique = true, length = 20)')}  private String isbn;

${col2('@Column(name = "nombre_autor", nullable = false, length = 100)')}  private String autor;
${constructores ? `\n${constructores}` : ''}
  public UUID getId() {
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
    pattern: sobre('@Id\\b', campo('UUID', 'id')),
    label: '@Id está encima de private UUID id',
    message: 'Falta @Id justo encima de private UUID id; (el @Id marca el código que identifica a cada libro, y es del tipo UUID).',
  },
]
const libroGenerado = [
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
    pattern: sobre('@GeneratedValue\\s*\\(\\s*strategy\\s*=\\s*GenerationType\\s*\\.\\s*UUID\\s*\\)', campo('UUID', 'id')),
    label: '@GeneratedValue(strategy = GenerationType.UUID) sobre el id',
    message: 'Falta @GeneratedValue(strategy = GenerationType.UUID) encima de private UUID id; (junto al @Id).',
  },
  {
    type: 'file-excludes',
    path: LIBRO,
    pattern: 'GenerationType\\s*\\.\\s*IDENTITY',
    label: 'No usa IDENTITY con un id UUID',
    message: 'IDENTITY cuenta 1, 2, 3 y sirve para un id Long. Aquí el id es UUID: usa GenerationType.UUID.',
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

// Columnas de titulo e isbn (m03-l2-c1).
const libroColumnas = [
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: importa('Column'),
    label: 'Importa Column de jakarta.persistence',
    message: 'Falta import jakarta.persistence.Column; en Libro.java.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(NULLABLE), campo('String', 'titulo')),
    label: 'titulo es obligatorio (nullable = false)',
    message: 'Encima de private String titulo; falta @Column con nullable = false.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(largo(150)), campo('String', 'titulo')),
    label: 'titulo tiene length = 150',
    message: 'El @Column de titulo debe llevar length = 150.',
  },
  {
    type: 'file-excludes',
    path: LIBRO,
    pattern: sobre(columna(UNIQUE), campo('String', 'titulo')),
    label: 'titulo no es único',
    message: 'unique = true va en isbn, no en titulo: dos libros distintos sí pueden llamarse igual.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(NULLABLE), campo('String', 'isbn')),
    label: 'isbn es obligatorio (nullable = false)',
    message: 'Encima de private String isbn; falta @Column con nullable = false.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(UNIQUE), campo('String', 'isbn')),
    label: 'isbn es único (unique = true)',
    message: 'El @Column de isbn debe llevar unique = true: no puede haber dos libros con el mismo ISBN.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(largo(20)), campo('String', 'isbn')),
    label: 'isbn tiene length = 20',
    message: 'El @Column de isbn debe llevar length = 20.',
  },
]
// Columna de autor (m03-l2-c2).
const libroAutor = [
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna('name\\s*=\\s*"nombre_autor"'), campo('String', 'autor')),
    label: 'La columna de autor se llama "nombre_autor"',
    message: 'Encima de private String autor; falta @Column con name = "nombre_autor" (comillas dobles, con guion bajo).',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(NULLABLE), campo('String', 'autor')),
    label: 'autor es obligatorio (nullable = false)',
    message: 'El @Column de autor debe llevar nullable = false.',
  },
  {
    type: 'file-includes',
    path: LIBRO,
    pattern: sobre(columna(largo(100)), campo('String', 'autor')),
    label: 'autor tiene length = 100',
    message: 'El @Column de autor debe llevar length = 100.',
  },
]
const libroVacio = {
  type: 'file-includes',
  path: LIBRO,
  pattern: '(?:^|\\n)[ \\t]*(?:public|protected)\\s+Libro\\s*\\(\\s*\\)\\s*\\{',
  label: 'Libro tiene un constructor vacío',
  message: 'Falta el constructor vacío public Libro() { } (sin void y sin parámetros). JPA lo necesita para crear el libro al leerlo de la tabla.',
}
const libroParams = {
  type: 'file-includes',
  path: LIBRO,
  pattern: 'Libro\\s*\\(\\s*String\\s+titulo\\s*,\\s*String\\s+isbn\\s*,\\s*String\\s+autor\\s*\\)',
  label: 'El constructor con titulo, isbn y autor sigue ahí',
  message: 'No borres el constructor public Libro(String titulo, String isbn, String autor): el vacío se añade además de ese.',
}

// Socio.java tal como queda al terminar el módulo (solución de m03-l3-c2).
const SOCIO_CODE = `package com.biblioteca.models;

import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "socios")
public class Socio {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 100)
  private String nombre;

  @Column(nullable = false, unique = true, length = 150)
  private String correo;

  public Socio() {
  }

  public UUID getId() {
    return id;
  }

  public String getNombre() {
    return nombre;
  }

  public void setNombre(String nombre) {
    this.nombre = nombre;
  }

  public String getCorreo() {
    return correo;
  }

  public void setCorreo(String correo) {
    this.correo = correo;
  }
}
`
const LIBRO_FINAL = libro({ entity: true, table: true, id: true, gen: true, cols: 2, params: true, vacio: true })

// Getter que devuelve el atributo (atrapa nombres mal escritos entre atributo y getter).
const getter = (tipo, metodo, atributo) => `public\\s+${tipo}\\s+${metodo}\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+(?:this\\s*\\.\\s*)?${atributo}\\s*;`
const setter = (metodo, tipo) => `void\\s+${metodo}\\s*\\(\\s*${tipo}\\s+\\w+\\s*\\)`

const socioChecks = [
  {
    type: 'file-exists',
    pattern: '^/src/main/java/com/biblioteca/models/Socio\\.java$',
    label: 'Existe models/Socio.java',
    message: 'No encuentro /src/main/java/com/biblioteca/models/Socio.java. Revisa la ruta y la S mayúscula.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: '(?:^|\\n)[ \\t]*package\\s+com\\s*\\.\\s*biblioteca\\s*\\.\\s*models\\s*;?[ \\t]*(?:\\r?\\n|$)',
    label: 'Está en el paquete com.biblioteca.models',
    message: 'La primera línea de Socio.java debe ser package com.biblioteca.models; (como en Libro.java).',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: importa('Entity'),
    label: 'Importa Entity de jakarta.persistence',
    message: 'Falta import jakarta.persistence.Entity; en Socio.java.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre('@Entity\\b', 'public\\s+class\\s+Socio\\b'),
    label: 'Socio tiene @Entity encima de la clase',
    message: 'Falta la anotación @Entity encima de public class Socio: sin ella, Socio es una clase normal y no se guarda en ninguna tabla.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre('@Table\\s*\\(\\s*name\\s*=\\s*"socios"\\s*\\)', 'public\\s+class\\s+Socio\\b'),
    label: '@Table(name = "socios") encima de la clase',
    message: 'Falta @Table(name = "socios") encima de public class Socio (y su import jakarta.persistence.Table).',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: '(?:^|\\n)[ \\t]*import\\s+java\\s*\\.\\s*util\\s*\\.\\s*(?:\\*|UUID)\\s*;?',
    label: 'Importa java.util.UUID',
    message: 'Falta import java.util.UUID; en Socio.java (UUID no es de jakarta: viene de Java).',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre('@Id\\b', campo('UUID', 'id')),
    label: '@Id está encima de private UUID id',
    message: 'Falta @Id encima de private UUID id; (el id de Socio es del tipo UUID, no Long).',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre('@GeneratedValue\\s*\\(\\s*strategy\\s*=\\s*GenerationType\\s*\\.\\s*UUID\\s*\\)', campo('UUID', 'id')),
    label: '@GeneratedValue(strategy = GenerationType.UUID) sobre el id',
    message: 'Encima de private UUID id; falta @GeneratedValue(strategy = GenerationType.UUID).',
  },
  {
    type: 'file-excludes',
    path: SOCIO,
    pattern: 'GenerationType\\s*\\.\\s*IDENTITY',
    label: 'No usa IDENTITY con un id UUID',
    message: 'IDENTITY cuenta 1, 2, 3 y sirve para un id Long. Para un id UUID la estrategia es GenerationType.UUID.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre(columna(NULLABLE, largo(100)), campo('String', 'nombre')),
    label: 'nombre es obligatorio, de 100, encima de private String nombre',
    message: 'Encima de private String nombre; falta @Column(nullable = false, length = 100).',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre(columna(NULLABLE, largo(150)), campo('String', 'correo')),
    label: 'correo es obligatorio, de 150, encima de private String correo',
    message: 'Encima de private String correo; falta @Column con nullable = false y length = 150. Revisa también que el atributo se llame correo.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: sobre(columna(UNIQUE), campo('String', 'correo')),
    label: 'correo es único (unique = true)',
    message: 'El @Column de correo debe llevar unique = true: dos socios no pueden tener el mismo correo.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: '(?:^|\\n)[ \\t]*(?:public|protected)\\s+Socio\\s*\\(\\s*\\)\\s*\\{',
    label: 'Socio tiene un constructor vacío',
    message: 'Falta el constructor vacío public Socio() { } que necesita JPA.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: `(?=[\\s\\S]*${getter('UUID', 'getId', 'id')})(?=[\\s\\S]*${getter('String', 'getNombre', 'nombre')})[\\s\\S]*${getter('String', 'getCorreo', 'correo')}`,
    label: 'Getters getId, getNombre y getCorreo',
    message: 'Faltan getters: public UUID getId(), public String getNombre() y public String getCorreo(), cada uno devolviendo su atributo.',
  },
  {
    type: 'file-includes',
    path: SOCIO,
    pattern: `(?=[\\s\\S]*${setter('setNombre', 'String')})[\\s\\S]*${setter('setCorreo', 'String')}`,
    label: 'Setters setNombre y setCorreo',
    message: 'Faltan los setters public void setNombre(String nombre) y public void setCorreo(String correo).',
  },
  sinJavax(SOCIO, 'Socio.java'),
]

const modulo = {
  id: 'm03',
  title: 'Entidades',
  summary: 'Convierte las clases Libro y Socio en tablas de la base de datos con @Entity, @Id, @GeneratedValue, @Table y @Column.',
  lessons: [
    {
      id: 'm03-l1',
      title: 'La ficha del libro: @Entity, @Id y @Table',
      explanation: `Antes de los computadores, las bibliotecas tenían un **archivador**: un mueble con cajones llenos de **fichas de cartulina**, una por libro. Cada ficha tenía las mismas casillas: título, ISBN, autor.

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
- \`@Table(name = "libros")\` encima de la clase: elige el **nombre del cajón**. Sin ella, la tabla se llamaría como la clase (\`libro\`). Se suele usar el plural.
- \`@Id\` encima del atributo \`id\`: el **código de registro** de la ficha. Dos fichas nunca tienen el mismo, y así se encuentra cada libro sin confusión. Toda entidad necesita uno.
- \`@GeneratedValue(strategy = GenerationType.UUID)\` junto al \`@Id\`: **tú no eliges el código**, se crea solo al guardar el libro. Por eso el \`id\` no tiene setter.

**¿Qué es un UUID?** Mira la etiqueta de tu nevera: tiene un **número de serie** largo y raro, como \`3f2a9c1e-7b4d-4e0a-9c55-1d2e8f6a0b77\`. Nadie lo eligió a mano y no se repite en ningún otro aparato del mundo. Eso es un UUID. En el proyecto de clase **todas** las entidades usan UUID, así que el atributo es \`private UUID id;\` (la clase \`UUID\` viene de Java: \`import java.util.UUID;\`).

Verás también otra opción muy común: \`@GeneratedValue(strategy = GenerationType.IDENTITY)\` con \`private Long id;\`. Funciona como la **máquina de turnos de la panadería**: la base de datos cuenta 1, 2, 3… Es más corta, pero cualquiera puede **adivinar** el siguiente número (si existe el libro 7, seguro que existe el 8), y hay que preguntar a la base de datos cuál toca. Con UUID no pasa ninguna de las dos cosas. En este curso usamos UUID.

Ojo: en tutoriales antiguos verás \`javax.persistence\`. Es el **nombre viejo**: en Spring Boot 4 es siempre \`jakarta.persistence\`. Con \`javax\` el proyecto no compila.

\`\`\`java
import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class Libro {

  @Id
  private UUID id;
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
3. Escribe **@Id** justo encima de \`private UUID id;\` (el \`import java.util.UUID;\` ya está).`,
          files: proyecto({ [LIBRO]: libro() }),
          activeFile: LIBRO,
          hints: [
            'Una anotación es una etiqueta que empieza por @ y se escribe en la línea de encima de lo que etiqueta.',
            'Los imports van entre la línea package y la clase. Las dos clases vienen de jakarta.persistence (no de javax).',
            'Debe quedar: import jakarta.persistence.Entity; import jakarta.persistence.Id; luego @Entity encima de public class Libro, y @Id encima de private UUID id;',
          ],
          solution: { [LIBRO]: libro({ entity: true, id: true }) },
          checks: [...libroEsEntidad, ...libroTieneId, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
        {
          id: 'm03-l1-c2',
          title: 'Que el código del libro se cree solo',
          instructions: `No queremos inventar el \`id\` de cada libro a mano: que se cree solo, como un UUID.

1. Añade los imports \`import jakarta.persistence.GeneratedValue;\` e \`import jakarta.persistence.GenerationType;\`
2. Justo debajo de \`@Id\` (encima de \`private UUID id;\`) escribe **@GeneratedValue(strategy = GenerationType.UUID)**.

(No uses \`IDENTITY\`: esa estrategia cuenta 1, 2, 3 y es para un id \`Long\`.)`,
          files: proyecto({ [LIBRO]: libro({ entity: true, id: true }) }),
          activeFile: LIBRO,
          hints: [
            'La anotación que hace que el código se cree solo se llama @GeneratedValue y va junto al @Id.',
            'Entre paréntesis le dices la estrategia: strategy = GenerationType.UUID (un código largo que nunca se repite).',
            'Quedan dos líneas seguidas encima del id: @Id y debajo @GeneratedValue(strategy = GenerationType.UUID)',
          ],
          solution: { [LIBRO]: libro({ entity: true, id: true, gen: true }) },
          checks: [...libroGenerado, ...libroTieneId, ...libroEsEntidad, sinJavax(LIBRO, 'Libro.java')],
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
          checks: [...libroTabla, ...libroEsEntidad, ...libroGenerado, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
      ],
    },
    {
      id: 'm03-l2',
      title: 'Las casillas de la ficha: @Column y el constructor vacío',
      explanation: `Piensa en un **formulario de inscripción** en papel. Al lado de algunas casillas pone "obligatorio", otras tienen sitio para "máximo 100 letras", y la del documento de identidad avisa "no se puede repetir".

\`@Column\` pone esas mismas **reglas a una columna** de la tabla. Se escribe encima del atributo:

\`\`\`java
@Column(nullable = false, unique = true, length = 20)
private String isbn;
\`\`\`

- \`nullable = false\`: la casilla es **obligatoria**. La base de datos no deja guardar un libro sin ISBN.
- \`unique = true\`: el valor **no se puede repetir**. Dos libros distintos no pueden tener el mismo ISBN. (El título sí se puede repetir: hay muchos libros llamados "Poemas".)
- \`length = 20\`: el **tamaño de la casilla** para un texto (como mucho 20 letras). Si no lo pones, son 255.
- \`name = "nombre_autor"\`: el **nombre de la columna** en la tabla, si quieres que sea distinto del nombre del atributo. En Java sigues usando \`autor\`.

El orden de lo que va dentro del paréntesis da igual, y se separa con comas. Sin \`@Column\`, el atributo **también** se guarda como columna, pero con las reglas por defecto (puede quedar vacío, se puede repetir, 255 letras). ¿Por qué ponerlas? Porque la base de datos es la **última puerta**: aunque haya un fallo en otra parte del programa, nunca guardará un libro sin título o con un ISBN repetido.

**El constructor vacío.** Cuando JPA **lee** un libro de la tabla, primero crea una **ficha en blanco** con \`new Libro()\` y después rellena cada casilla con lo que hay en la fila. Por eso toda entidad necesita un constructor **sin parámetros** (puede ser \`public\` o \`protected\`).

Recuerda de Java: si escribes un constructor con parámetros, Java ya **no** crea el vacío por ti. Así que, si tu entidad tiene \`public Libro(String titulo, ...)\`, también tienes que escribir \`public Libro() { }\`. Sin él, la aplicación falla al leer los libros.`,
      challenges: [
        {
          id: 'm03-l2-c1',
          title: 'Reglas para el título y el ISBN',
          instructions: `En \`Libro.java\`:

1. Añade \`import jakarta.persistence.Column;\`
2. Encima de \`private String titulo;\` escribe **@Column(nullable = false, length = 150)**: obligatorio y de hasta 150 letras.
3. Encima de \`private String isbn;\` escribe **@Column(nullable = false, unique = true, length = 20)**: obligatorio, sin repetirse y de hasta 20 letras.`,
          files: proyecto({ [LIBRO]: libro({ entity: true, table: true, id: true, gen: true }) }),
          activeFile: LIBRO,
          hints: [
            '@Column va en la línea de encima de cada atributo, igual que @Id va encima del id.',
            'Dentro del paréntesis separas las reglas con comas: nullable = false (obligatorio), unique = true (no se repite), length = número (tamaño).',
            'Encima de titulo: @Column(nullable = false, length = 150). Encima de isbn: @Column(nullable = false, unique = true, length = 20).',
          ],
          solution: { [LIBRO]: libro({ entity: true, table: true, id: true, gen: true, cols: 1 }) },
          checks: [...libroColumnas, ...libroEsEntidad, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
        {
          id: 'm03-l2-c2',
          title: 'Otro nombre para la columna del autor',
          instructions: `En la tabla queremos que la columna del autor se llame \`nombre_autor\`, aunque en Java el atributo sigue siendo \`autor\`.

Encima de \`private String autor;\` escribe **@Column(name = "nombre_autor", nullable = false, length = 100)**. No cambies el nombre del atributo.`,
          files: proyecto({ [LIBRO]: libro({ entity: true, table: true, id: true, gen: true, cols: 1 }) }),
          activeFile: LIBRO,
          hints: [
            'Es otro @Column, ahora encima de private String autor;',
            'name = "..." elige el nombre de la columna en la tabla. Va con comillas dobles, igual que en @Table.',
            'La línea completa: @Column(name = "nombre_autor", nullable = false, length = 100)',
          ],
          solution: { [LIBRO]: libro({ entity: true, table: true, id: true, gen: true, cols: 2 }) },
          checks: [
            ...libroAutor,
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: campo('String', 'autor'),
              label: 'El atributo sigue llamándose autor',
              message: 'En Java el atributo sigue siendo private String autor; solo cambia el nombre de la columna (con name).',
            },
            ...libroColumnas,
            ...libroEsEntidad,
            sinJavax(LIBRO, 'Libro.java'),
          ],
          xp: 10,
        },
        {
          id: 'm03-l2-c3',
          title: 'La ficha en blanco: el constructor vacío',
          instructions: `Alguien añadió a \`Libro.java\` un constructor con parámetros: \`public Libro(String titulo, String isbn, String autor)\`. Desde ese momento Java ya no crea el constructor vacío, y JPA lo necesita.

Escribe, justo encima de ese constructor, un **constructor vacío**: \`public Libro() { }\`. No borres el otro.`,
          files: proyecto({ [LIBRO]: libro({ entity: true, table: true, id: true, gen: true, cols: 2, params: true }) }),
          activeFile: LIBRO,
          hints: [
            'Un constructor vacío no recibe nada y no hace nada: solo permite crear un Libro en blanco.',
            'Se escribe como el otro constructor pero con los paréntesis vacíos y sin nada dentro de las llaves. Los constructores no llevan void.',
            'Escribe public Libro() { } encima de public Libro(String titulo, String isbn, String autor).',
          ],
          solution: { [LIBRO]: libro({ entity: true, table: true, id: true, gen: true, cols: 2, params: true, vacio: true }) },
          checks: [libroVacio, libroParams, ...libroEsEntidad, ...libroAutor, sinJavax(LIBRO, 'Libro.java')],
          xp: 10,
        },
      ],
    },
    {
      id: 'm03-l3',
      title: 'Socio y los errores de siempre',
      explanation: `Una biblioteca no solo tiene fichas de libros: también tiene un **archivador de socios**, con una ficha por persona (nombre y correo). Es otra entidad, \`Socio\`, y se hace **igual** que \`Libro\`:

\`\`\`java
import java.util.UUID;   // UUID viene de Java, no de jakarta

@Entity
@Table(name = "socios")
public class Socio {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;          // también UUID, como Libro
  ...
}
\`\`\`

El getter del id es \`public UUID getId()\`. El correo, como el ISBN, no se puede repetir: dos socios no comparten correo.

**Los tres errores que más se ven en clase** (en un proyecto, a la clase \`Video\` le faltaba el \`@Entity\`):

1. **Olvidar \`@Entity\`.** La clase compila, pero no hay tabla: JPA la trata como una clase normal y falla en cuanto intentes usarla con un repositorio (lo verás en m06).
2. **Importar de \`javax.persistence\`.** Es el nombre antiguo; en Spring Boot 4 no existe y el proyecto no compila. Siempre \`jakarta.persistence\`.
3. **Escribir distinto el atributo y el getter.** Si el atributo es \`titlo\` y el getter hace \`return titulo;\`, Java no encuentra \`titulo\` y no compila. Además, el nombre del atributo es el nombre de la columna: un error ahí se queda en la tabla.`,
      challenges: [
        {
          id: 'm03-l3-c1',
          title: 'Encuentra los tres errores',
          instructions: `Este \`Libro.java\` lo escribió un compañero y tiene **los tres errores típicos**. Arréglalos:

1. Los imports usan \`javax.persistence\`: cámbialos todos a **jakarta.persistence**.
2. Falta **@Entity** encima de \`public class Libro\` (el import ya está).
3. El atributo se llama \`titlo\`, pero los getters y el constructor usan \`titulo\`: renómbralo a **titulo**.`,
          files: proyecto({
            [LIBRO]: libro({ javax: true, table: true, id: true, gen: true, cols: 2, params: true, vacio: true, campoTitulo: 'titlo' }),
          }),
          activeFile: LIBRO,
          hints: [
            'Revisa tres sitios: las líneas import, la línea de encima de public class Libro y la declaración del título.',
            'En cada import cambia la palabra javax por jakarta (lo demás se queda igual). Encima de @Table(name = "libros") falta una línea.',
            'Escribe @Entity encima de @Table(name = "libros") y cambia private String titlo; por private String titulo;',
          ],
          solution: { [LIBRO]: LIBRO_FINAL },
          checks: [
            ...libroEsEntidad,
            sinJavax(LIBRO, 'Libro.java'),
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: `${LINEA}${campo('String', 'titulo')}`,
              label: 'El atributo se llama titulo, como en el getter',
              message: 'El atributo debe llamarse titulo (como en getTitulo y en el constructor): private String titulo;',
            },
            {
              type: 'file-excludes',
              path: LIBRO,
              pattern: '\\btitlo\\b',
              label: 'Ya no queda titlo',
              message: 'Todavía aparece titlo (le falta la u): escríbelo titulo.',
            },
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: sobre(columna(NULLABLE, largo(150)), campo('String', 'titulo')),
              label: 'titulo conserva su @Column(nullable = false, length = 150)',
              message: 'Al renombrar el atributo no borres su anotación: encima de private String titulo; debe seguir @Column(nullable = false, length = 150).',
            },
            ...libroTabla,
            ...libroGenerado,
            libroVacio,
          ],
          xp: 10,
        },
        {
          id: 'm03-l3-c2',
          title: 'Crea la entidad Socio',
          instructions: `Ahora tú solo: crea el archivo \`/src/main/java/com/biblioteca/models/Socio.java\`. Puedes mirar \`Libro.java\` como modelo.

1. Paquete \`com.biblioteca.models\`.
2. Imports: \`java.util.UUID\` y, de \`jakarta.persistence\`: \`Column\`, \`Entity\`, \`GeneratedValue\`, \`GenerationType\`, \`Id\` y \`Table\`.
3. La clase **Socio** con **@Entity** y **@Table(name = "socios")**.
4. \`private UUID id;\` con **@Id** y **@GeneratedValue(strategy = GenerationType.UUID)**.
5. \`private String nombre;\` con **@Column(nullable = false, length = 100)**.
6. \`private String correo;\` con **@Column(nullable = false, unique = true, length = 150)**.
7. El constructor vacío **public Socio() { }**.
8. Los getters \`getId()\` (devuelve \`UUID\`), \`getNombre()\` y \`getCorreo()\`, y los setters \`setNombre\` y \`setCorreo\`.`,
          files: proyecto({ [LIBRO]: LIBRO_FINAL }),
          activeFile: LIBRO,
          hints: [
            'Pulsa "Nuevo archivo" y escribe la ruta src/main/java/com/biblioteca/models/Socio.java. Copiar la forma de Libro.java ayuda mucho.',
            'Lo que cambia respecto a Libro: la tabla es "socios" y los atributos son nombre y correo. El id es igual: private UUID id; con GenerationType.UUID.',
            'Encima del id: @Id y @GeneratedValue(strategy = GenerationType.UUID). Encima de correo: @Column(nullable = false, unique = true, length = 150). No olvides @Entity ni public Socio() { }.',
          ],
          solution: { [SOCIO]: SOCIO_CODE },
          checks: socioChecks,
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
