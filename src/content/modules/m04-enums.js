// Módulo 4: enums en entidades. CategoriaLibro y TipoSocio en models/helpers y @Enumerated(EnumType.STRING).
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
const CATEGORIA = '/src/main/java/com/biblioteca/models/helpers/CategoriaLibro.java'
const TIPO = '/src/main/java/com/biblioteca/models/helpers/TipoSocio.java'

const CATEGORIA_CODE = `package com.biblioteca.models.helpers;

public enum CategoriaLibro {
  NOVELA, CIENCIA, HISTORIA, INFANTIL
}
`
const TIPO_CODE = `package com.biblioteca.models.helpers;

public enum TipoSocio {
  ESTUDIANTE, DOCENTE, EXTERNO
}
`

// ---------- Libro.java ----------
// cat: 'no' (como terminó m03), 'campo' (atributo sin anotaciones), 'string' (error: String),
//      'final' (@Enumerated STRING + @Column nullable), 'mal' (ORDINAL y unique = true)
function libro(cat = 'no') {
  const conEnum = cat === 'final' || cat === 'mal'
  const jpa = ['Column', 'Entity', ...(conEnum ? ['EnumType', 'Enumerated'] : []), 'GeneratedValue', 'GenerationType', 'Id', 'Table']
  const tipo = cat === 'string' ? 'String' : 'CategoriaLibro'
  const anot = {
    final: '  @Enumerated(EnumType.STRING)\n  @Column(nullable = false)\n',
    mal: '  @Enumerated(EnumType.ORDINAL)\n  @Column(nullable = false, unique = true)\n',
  }[cat] ?? ''
  const conCampo = cat !== 'no'
  const importHelpers = conCampo && cat !== 'string' ? '\nimport com.biblioteca.models.helpers.CategoriaLibro;\n' : ''
  return `package com.biblioteca.models;
${importHelpers}
${jpa.map((c) => `import jakarta.persistence.${c};`).join('\n')}

@Entity
@Table(name = "libros")
public class Libro {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false, length = 150)
  private String titulo;

  @Column(nullable = false, unique = true, length = 20)
  private String isbn;

  @Column(name = "nombre_autor", nullable = false, length = 100)
  private String autor;
${conCampo ? `\n${anot}  private ${tipo} categoria;\n` : ''}
  public Libro() {
  }

  public Libro(String titulo, String isbn, String autor) {
    this.titulo = titulo;
    this.isbn = isbn;
    this.autor = autor;
  }

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
${
  conCampo
    ? `
  public ${tipo} getCategoria() {
    return categoria;
  }

  public void setCategoria(${tipo} categoria) {
    this.categoria = categoria;
  }
`
    : ''
}}
`
}

// ---------- Socio.java ----------
// tipo: 'no' (como terminó m03), 'string' (error: String tipo), 'campo' (TipoSocio sin anotaciones),
//       'final' (@Enumerated STRING + @Column nullable y length 20)
function socio(tipo = 'no') {
  const conEnum = tipo === 'final'
  const jpa = ['Column', 'Entity', ...(conEnum ? ['EnumType', 'Enumerated'] : []), 'GeneratedValue', 'GenerationType', 'Id', 'Table']
  const clase = tipo === 'string' ? 'String' : 'TipoSocio'
  const conCampo = tipo !== 'no'
  const importHelpers = conCampo && tipo !== 'string' ? '\nimport com.biblioteca.models.helpers.TipoSocio;\n' : ''
  const anot = conEnum ? '  @Enumerated(EnumType.STRING)\n  @Column(nullable = false, length = 20)\n' : ''
  return `package com.biblioteca.models;

import java.util.UUID;
${importHelpers}
${jpa.map((c) => `import jakarta.persistence.${c};`).join('\n')}

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
${conCampo ? `\n${anot}  private ${clase} tipo;\n` : ''}
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
${
  conCampo
    ? `
  public ${clase} getTipo() {
    return tipo;
  }

  public void setTipo(${clase} tipo) {
    this.tipo = tipo;
  }
`
    : ''
}}
`
}

const proyecto = (extra = {}) => ({ '/pom.xml': POM, [APP]: APP_CODE, ...extra })

// ---------- Checks de los archivos enum ----------
const enumChecks = (nombre, ruta, valores) => [
  {
    type: 'file-exists',
    pattern: `^/src/main/java/com/biblioteca/models/helpers/${nombre}\\.java$`,
    label: `Existe models/helpers/${nombre}.java`,
    message: `No encuentro ${ruta}. Va dentro de la carpeta models/helpers (revisa también las mayúsculas).`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: '(?:^|\\n)[ \\t]*package\\s+com\\s*\\.\\s*biblioteca\\s*\\.\\s*models\\s*\\.\\s*helpers\\s*;?[ \\t]*(?:\\r?\\n|$)',
    label: 'Está en el paquete com.biblioteca.models.helpers',
    message: `La primera línea de ${nombre}.java debe ser package com.biblioteca.models.helpers; (la carpeta es helpers, dentro de models).`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: `(?:^|\\n)[ \\t]*public\\s+enum\\s+${nombre}\\b`,
    label: `Es public enum ${nombre}`,
    message: `Falta public enum ${nombre} (con ese nombre exacto).`,
  },
  {
    type: 'file-excludes',
    path: ruta,
    pattern: `class\\s+${nombre}\\b`,
    label: 'Es un enum, no una clase',
    message: `${nombre} tiene que ser un enum (public enum ${nombre}), no una clase.`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: `enum\\s+${nombre}\\s*\\{\\s*${valores.join('\\s*,\\s*')}\\s*,?\\s*;?\\s*\\}`,
    label: `Tiene ${valores.slice(0, -1).join(', ')} ${/^[IH]/.test(valores.at(-1)) ? 'e' : 'y'} ${valores.at(-1)}, en ese orden`,
    message: `Los valores de ${nombre} deben ser exactamente ${valores.join(', ')}, en ese orden y en MAYÚSCULAS.`,
  },
]

const modulo = {
  id: 'm04',
  title: 'Enums en entidades',
  summary: 'Guarda la categoría de cada libro y el tipo de cada socio con enums en models/helpers y @Enumerated(EnumType.STRING).',
  lessons: [
    {
      id: 'm04-l1',
      title: 'Las listas cerradas van en helpers',
      explanation: `En muchas bibliotecas cada libro lleva una **pegatina de color** en el lomo: roja para novela, verde para ciencia, azul para historia, amarilla para infantil. No hay más colores: es una **lista cerrada**.

Si la categoría fuera un texto libre (\`String\`), cada bibliotecario escribiría lo que quisiera: "novela", "Novela", "novla", "NOVELAS"… y luego buscar todas las novelas sería un lío. Con un **enum** solo existen los valores de la lista, y si alguien escribe \`NOVLA\` el proyecto ni siquiera compila.

Los enums ya los sabes escribir en Java. Lo nuevo aquí es **dónde** ponerlos y **cómo** guardarlos en la tabla (lección siguiente).

**Dónde:** en el proyecto de clase, los enums que usan las entidades van en una subcarpeta \`helpers\` ("ayudantes") dentro de \`models\`:

\`\`\`text
src/main/java/com/biblioteca/models/
├── Libro.java
├── Socio.java
└── helpers/
    ├── CategoriaLibro.java
    └── TipoSocio.java
\`\`\`

Por eso su primera línea es \`package com.biblioteca.models.helpers;\`.

Un enum **no** lleva \`@Entity\`: no es una ficha ni tiene tabla propia. Es solo la lista de valores que puede tomar una casilla de otra ficha.

\`\`\`java
package com.biblioteca.models.helpers;

public enum CategoriaLibro {
  NOVELA, CIENCIA, HISTORIA, INFANTIL
}
\`\`\``,
      challenges: [
        {
          id: 'm04-l1-c1',
          title: 'Las categorías de los libros',
          instructions: `Crea el archivo \`/src/main/java/com/biblioteca/models/helpers/CategoriaLibro.java\`:

1. Primera línea: \`package com.biblioteca.models.helpers;\`
2. Un **enum** llamado **CategoriaLibro** con estos valores, en este orden: **NOVELA, CIENCIA, HISTORIA, INFANTIL**.`,
          files: proyecto({ [LIBRO]: libro(), [SOCIO]: socio() }),
          activeFile: LIBRO,
          hints: [
            'Pulsa "Nuevo archivo". La carpeta helpers va dentro de models: src/main/java/com/biblioteca/models/helpers/CategoriaLibro.java',
            'Como está en la carpeta helpers, el paquete termina en .helpers. Y es enum, no class.',
            'Contenido: package com.biblioteca.models.helpers; y debajo public enum CategoriaLibro { NOVELA, CIENCIA, HISTORIA, INFANTIL }',
          ],
          solution: { [CATEGORIA]: CATEGORIA_CODE },
          checks: enumChecks('CategoriaLibro', CATEGORIA, ['NOVELA', 'CIENCIA', 'HISTORIA', 'INFANTIL']),
          xp: 10,
        },
        {
          id: 'm04-l1-c2',
          title: 'Los tipos de socio',
          instructions: `Los socios pueden ser estudiantes, docentes o externos. Crea el archivo \`/src/main/java/com/biblioteca/models/helpers/TipoSocio.java\`:

1. Primera línea: \`package com.biblioteca.models.helpers;\`
2. Un **enum** llamado **TipoSocio** con estos valores, en este orden: **ESTUDIANTE, DOCENTE, EXTERNO**.`,
          files: proyecto({ [LIBRO]: libro(), [SOCIO]: socio(), [CATEGORIA]: CATEGORIA_CODE }),
          activeFile: CATEGORIA,
          hints: [
            'Es igual que CategoriaLibro.java (está abierto): misma carpeta, mismo paquete, otro nombre y otros valores.',
            'Ruta: src/main/java/com/biblioteca/models/helpers/TipoSocio.java',
            'Contenido: package com.biblioteca.models.helpers; y debajo public enum TipoSocio { ESTUDIANTE, DOCENTE, EXTERNO }',
          ],
          solution: { [TIPO]: TIPO_CODE },
          checks: enumChecks('TipoSocio', TIPO, ['ESTUDIANTE', 'DOCENTE', 'EXTERNO']),
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
