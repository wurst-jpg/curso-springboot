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

// ---------- Ayudas para escribir las expresiones regulares (las mismas que en m03) ----------
// Principio de línea, con otras anotaciones delante si las hay. Así "// @Enumerated(...)" (un
// comentario) no cuenta: la línea empieza por //, no por @.
const ANOTACION = '@\\w+(?:\\s*\\([^)]*\\))?'
const LINEA = `(?:^|\\n)[ \\t]*(?:${ANOTACION}\\s*)*`
// Una anotación (anot) encima de una declaración (decl), con otras anotaciones en medio.
const sobre = (anot, decl) => `${LINEA}${anot}(?:\\s*${ANOTACION})*\\s*${decl}`
// @Column(...) que contiene todas las condiciones, en cualquier orden (lookaheads).
const columna = (...conds) => `@Column\\s*\\(${conds.map((c) => `(?=[^)]*\\b${c})`).join('')}[^)]*\\)`
const importa = (clase) => `(?:^|\\n)[ \\t]*import\\s+jakarta\\s*\\.\\s*persistence\\s*\\.\\s*(?:\\*|${clase})\\s*;?`
const importaHelper = (clase) => `(?:^|\\n)[ \\t]*import\\s+com\\s*\\.\\s*biblioteca\\s*\\.\\s*models\\s*\\.\\s*helpers\\s*\\.\\s*(?:\\*|${clase})\\s*;?`
const campo = (tipo, nombre) => `private\\s+${tipo}\\s+${nombre}\\b`
const getter = (tipo, metodo, atributo) => `public\\s+${tipo}\\s+${metodo}\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+(?:this\\s*\\.\\s*)?${atributo}\\s*;`
const setter = (metodo, tipo) => `void\\s+${metodo}\\s*\\(\\s*${tipo}\\s+\\w+\\s*\\)`

const NULLABLE = 'nullable\\s*=\\s*false\\b'
const ENUM_STRING = '@Enumerated\\s*\\(\\s*(?:value\\s*=\\s*)?EnumType\\s*\\.\\s*STRING\\s*\\)'

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

// ---------- Checks del campo enum dentro de una entidad ----------
// (entidad, archivo, enum, atributo, getter, setter)
const campoEnum = (ent, ruta, tipo, atr, get, set) => [
  {
    type: 'file-includes',
    path: ruta,
    pattern: importaHelper(tipo),
    label: `Importa ${tipo} de com.biblioteca.models.helpers`,
    message: `Falta import com.biblioteca.models.helpers.${tipo}; en ${ent}.java (el enum está en otro paquete).`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: `${LINEA}${campo(tipo, atr)}`,
    label: `${ent} tiene private ${tipo} ${atr}`,
    message: `Falta el atributo private ${tipo} ${atr}; en ${ent}.java.`,
  },
  {
    type: 'file-excludes',
    path: ruta,
    pattern: `String\\s+${atr}\\b`,
    label: `${atr} no es un String`,
    message:
      atr === 'categoria'
        ? 'categoria debe ser del tipo enum CategoriaLibro, no String: así solo se aceptan las categorías de la lista.'
        : `${atr} debe ser del tipo enum ${tipo}, no String.`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: `(?=[\\s\\S]*${getter(tipo, get, atr)})[\\s\\S]*${setter(set, tipo)}`,
    label: `${get} y ${set} usan ${tipo}`,
    message: `Faltan public ${tipo} ${get}() (que devuelve ${atr}) y public void ${set}(${tipo} ${atr}).`,
  },
]

// @Enumerated(EnumType.STRING) y @Column(nullable = false) sobre el campo enum, sin ORDINAL ni unique.
const enumGuardado = (ent, ruta, tipo, atr) => [
  {
    type: 'file-includes',
    path: ruta,
    pattern: importa('Enumerated'),
    label: 'Importa Enumerated de jakarta.persistence',
    message: `Falta import jakarta.persistence.Enumerated; en ${ent}.java.`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: importa('EnumType'),
    label: 'Importa EnumType de jakarta.persistence',
    message: `Falta import jakarta.persistence.EnumType; en ${ent}.java.`,
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: sobre(ENUM_STRING, campo(tipo, atr)),
    label: `@Enumerated(EnumType.STRING) encima de ${atr}`,
    message: `Encima de private ${tipo} ${atr}; falta @Enumerated(EnumType.STRING), para que en la tabla se guarde el nombre del valor.`,
  },
  {
    type: 'file-excludes',
    path: ruta,
    pattern: 'EnumType\\s*\\.\\s*ORDINAL',
    label: 'No usa EnumType.ORDINAL',
    message: 'Cambia EnumType.ORDINAL por EnumType.STRING: ORDINAL guarda la posición (0, 1, 2…) y se rompe si alguien cambia el orden del enum.',
  },
  {
    type: 'file-excludes',
    path: ruta,
    pattern: '@Enumerated(?!\\s*\\()',
    label: '@Enumerated lleva (EnumType.STRING)',
    message: '@Enumerated solo, sin paréntesis, guarda la posición (ORDINAL). Escríbelo completo: @Enumerated(EnumType.STRING).',
  },
  {
    type: 'file-includes',
    path: ruta,
    pattern: sobre(columna(NULLABLE), campo(tipo, atr)),
    label: `${atr} es obligatorio (nullable = false)`,
    message: `Encima de private ${tipo} ${atr}; falta @Column con nullable = false.`,
  },
  {
    type: 'file-excludes',
    path: ruta,
    pattern: `unique\\s*=\\s*true\\b[^)]*\\)(?:\\s*${ANOTACION})*\\s*private\\s+\\w+\\s+${atr}\\b`,
    label: `${atr} no es ${atr === 'categoria' ? 'única' : 'único'}`,
    message:
      atr === 'categoria'
        ? 'categoria no puede ser unique = true: muchos libros comparten categoría (con unique solo cabría una novela en toda la biblioteca).'
        : `${atr} no puede ser unique = true: muchos socios son del mismo tipo (con unique solo cabría un estudiante).`,
  },
]
const categoriaCampo = campoEnum('Libro', LIBRO, 'CategoriaLibro', 'categoria', 'getCategoria', 'setCategoria')
const categoriaGuardada = enumGuardado('Libro', LIBRO, 'CategoriaLibro', 'categoria')

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
    {
      id: 'm04-l2',
      title: 'Guardar el enum en la tabla: @Enumerated(EnumType.STRING)',
      explanation: `Ahora \`Libro\` tendrá una casilla \`categoria\`. El tipo del atributo es el **enum**, no \`String\`:

\`\`\`java
import com.biblioteca.models.helpers.CategoriaLibro;
...
private CategoriaLibro categoria;
\`\`\`

(El \`import\` hace falta porque el enum vive en otro paquete, \`helpers\`.)

**¿Cómo se guarda un enum en una columna?** JPA tiene dos formas, y la que usa si no le dices nada es la mala:

- \`EnumType.ORDINAL\` (la de por defecto): guarda la **posición** en la lista. NOVELA = 0, CIENCIA = 1, HISTORIA = 2, INFANTIL = 3.
- \`EnumType.STRING\`: guarda el **nombre**: \`"NOVELA"\`, \`"HISTORIA"\`…

Imagina que las estanterías de la biblioteca están **numeradas** y en cada ficha apuntas "estantería 2". Un día alguien pone una estantería nueva al principio y todas cambian de número: tus fichas ahora mandan a la estantería equivocada. Eso pasa con ORDINAL: si un compañero añade \`POESIA\` al principio del enum, HISTORIA pasa a ser 3 y **todos los libros guardados con un 2 cambian de categoría sin que nadie se entere**. Si apuntas "estantería de Historia" (STRING), da igual cómo se reordenen. Por eso siempre:

\`\`\`java
@Enumerated(EnumType.STRING)
@Column(nullable = false)
private CategoriaLibro categoria;
\`\`\`

- \`@Enumerated\` se importa de \`jakarta.persistence\`, igual que \`EnumType\`. Escríbelo **con** el paréntesis: \`@Enumerated\` solo significa ORDINAL.
- \`@Column(nullable = false)\`: todo libro tiene que tener categoría.
- **Nunca** \`unique = true\` en una categoría: haría que solo pudiera existir **un** libro de cada categoría. Es un error que se ha visto en clase.`,
      challenges: [
        {
          id: 'm04-l2-c1',
          title: 'Añade la categoría al libro',
          instructions: `En \`Libro.java\`:

1. Añade \`import com.biblioteca.models.helpers.CategoriaLibro;\`
2. Debajo de \`autor\`, añade el atributo **private CategoriaLibro categoria;** (del tipo del enum, no \`String\`).
3. Al final de la clase, añade \`public CategoriaLibro getCategoria()\` (que devuelve \`categoria\`) y \`public void setCategoria(CategoriaLibro categoria)\`.

Las anotaciones las ponemos en el reto siguiente.`,
          files: proyecto({ [LIBRO]: libro(), [CATEGORIA]: CATEGORIA_CODE, [SOCIO]: socio(), [TIPO]: TIPO_CODE }),
          activeFile: LIBRO,
          hints: [
            'El tipo del atributo es el nombre del enum, igual que antes escribías String o Long.',
            'Como CategoriaLibro está en el paquete com.biblioteca.models.helpers, hay que importarlo debajo de la línea package.',
            'private CategoriaLibro categoria; y al final public CategoriaLibro getCategoria() { return categoria; } y public void setCategoria(CategoriaLibro categoria) { this.categoria = categoria; }',
          ],
          solution: { [LIBRO]: libro('campo') },
          checks: categoriaCampo,
          xp: 10,
        },
        {
          id: 'm04-l2-c2',
          title: 'Guarda el nombre, no la posición',
          instructions: `Ahora dile a JPA cómo guardar la categoría. En \`Libro.java\`:

1. Añade los imports \`import jakarta.persistence.EnumType;\` e \`import jakarta.persistence.Enumerated;\`
2. Encima de \`private CategoriaLibro categoria;\` escribe **@Enumerated(EnumType.STRING)** y **@Column(nullable = false)**.

No le pongas \`unique = true\`: muchos libros comparten categoría.`,
          files: proyecto({ [LIBRO]: libro('campo'), [CATEGORIA]: CATEGORIA_CODE, [SOCIO]: socio(), [TIPO]: TIPO_CODE }),
          activeFile: LIBRO,
          hints: [
            'La anotación que dice cómo se guarda un enum es @Enumerated. Entre paréntesis va la forma: EnumType.STRING (el nombre) o EnumType.ORDINAL (la posición).',
            'Hacen falta dos imports nuevos de jakarta.persistence: Enumerated y EnumType. @Column ya está importado.',
            'Encima del atributo deben quedar dos líneas: @Enumerated(EnumType.STRING) y @Column(nullable = false)',
          ],
          solution: { [LIBRO]: libro('final') },
          checks: [...categoriaGuardada, ...categoriaCampo],
          xp: 10,
        },
        {
          id: 'm04-l2-c3',
          title: 'Arregla la categoría de un compañero',
          instructions: `Este \`Libro.java\` tiene dos errores en la categoría, los dos vistos en clase:

1. Usa \`@Enumerated(EnumType.ORDINAL)\`: cámbialo a **EnumType.STRING**.
2. Su \`@Column\` tiene \`unique = true\`: **quítalo**, para que quede \`@Column(nullable = false)\`.`,
          files: proyecto({ [LIBRO]: libro('mal'), [CATEGORIA]: CATEGORIA_CODE, [SOCIO]: socio(), [TIPO]: TIPO_CODE }),
          activeFile: LIBRO,
          hints: [
            'Mira las dos líneas que hay encima de private CategoriaLibro categoria;',
            'ORDINAL guarda la posición y se rompe al reordenar el enum; unique = true dejaría una sola novela en toda la biblioteca.',
            'Deben quedar así: @Enumerated(EnumType.STRING) y @Column(nullable = false)',
          ],
          solution: { [LIBRO]: libro('final') },
          checks: [...categoriaGuardada, ...categoriaCampo],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
