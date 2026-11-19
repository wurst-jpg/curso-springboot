// Módulo 5: relaciones entre entidades (@ManyToOne, @JoinColumn, @OneToMany(mappedBy), referencias JSON).
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

// ---------- Rutas ----------
const M = '/src/main/java/com/biblioteca/models/'
const LIBRO = `${M}Libro.java`
const SOCIO = `${M}Socio.java`
const PRESTAMO = `${M}Prestamo.java`
const CATEGORIA = `${M}helpers/CategoriaLibro.java`
const TIPO = `${M}helpers/TipoSocio.java`

// ---------- Generadores de código Java ----------

// Getter y setter de un campo (el alumno ya sabe POO: solo es relleno realista).
const gs = (tipo, campo) => {
  const C = campo[0].toUpperCase() + campo.slice(1)
  const pre = tipo === 'boolean' ? 'is' : 'get'
  return `
  public ${tipo} ${pre}${C}() {
    return ${campo};
  }

  public void set${C}(${tipo} ${campo}) {
    this.${campo} = ${campo};
  }
`
}

// Libro, Socio y los enums: el MISMO texto con el que termina m04 (solución de m04-l3-c2).
// m05 solo les agrega líneas (la lista de préstamos y sus import); un test lo comprueba.
const CATEGORIA_JAVA = `package com.biblioteca.models.helpers;

public enum CategoriaLibro {
  NOVELA, CIENCIA, HISTORIA, INFANTIL
}
`

const TIPO_JAVA = `package com.biblioteca.models.helpers;

public enum TipoSocio {
  ESTUDIANTE, DOCENTE, EXTERNO
}
`

const LIBRO_M04 = `package com.biblioteca.models;

import java.util.UUID;

import com.biblioteca.models.helpers.CategoriaLibro;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "libros")
public class Libro {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 150)
  private String titulo;

  @Column(nullable = false, unique = true, length = 20)
  private String isbn;

  @Column(name = "nombre_autor", nullable = false, length = 100)
  private String autor;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CategoriaLibro categoria;

  public Libro() {
  }

  public Libro(String titulo, String isbn, String autor) {
    this.titulo = titulo;
    this.isbn = isbn;
    this.autor = autor;
  }

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

  public CategoriaLibro getCategoria() {
    return categoria;
  }

  public void setCategoria(CategoriaLibro categoria) {
    this.categoria = categoria;
  }
}
`

const SOCIO_M04 = `package com.biblioteca.models;

import java.util.UUID;

import com.biblioteca.models.helpers.TipoSocio;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TipoSocio tipo;

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

  public TipoSocio getTipo() {
    return tipo;
  }

  public void setTipo(TipoSocio tipo) {
    this.tipo = tipo;
  }
}
`

// Lado "uno" de la relación: agrega a la entidad de m04 la lista de préstamos.
// `mappedBy`: null (sin lista) o el texto de mappedBy; `json`: null o el value de @JsonManagedReference.
const conLista = (base, clase, mappedBy, json) => {
  if (mappedBy === null) return base
  const enumImport = base.match(/import com\.biblioteca\.models\.helpers\.\w+;\n/)[0]
  return base
    .replace('import java.util.UUID;\n', 'import java.util.ArrayList;\nimport java.util.List;\nimport java.util.UUID;\n')
    .replace(enumImport, enumImport + (json ? 'import com.fasterxml.jackson.annotation.JsonManagedReference;\n' : ''))
    .replace('import jakarta.persistence.Id;\n', 'import jakarta.persistence.Id;\nimport jakarta.persistence.OneToMany;\n')
    .replace(
      `\n  public ${clase}() {`,
      `\n  @OneToMany(mappedBy = "${mappedBy}")\n${json ? `  @JsonManagedReference(value = "${json}")\n` : ''}  private List<Prestamo> prestamos = new ArrayList<>();\n\n  public ${clase}() {`,
    )
    .replace(/\}\n$/, `${gs('List<Prestamo>', 'prestamos')}}\n`)
}

const libroCon = ({ mappedBy = null, json = false } = {}) => conLista(LIBRO_M04, 'Libro', mappedBy, json ? 'libro-prestamo' : null)
const socioCon = ({ mappedBy = null, json = false } = {}) => conLista(SOCIO_M04, 'Socio', mappedBy, json ? 'socio-prestamo' : null)

// Lado "muchos": Prestamo. `libroCol` / `socioCol`: null (sin relación) o el name de @JoinColumn.
const prestamoCon = ({ entity = true, fecha = 'LocalDate', libroCol = null, socioCol = null, json = false } = {}) => {
  const conRelacion = libroCol !== null || socioCol !== null
  const imports = [
    ...(json ? ['import com.fasterxml.jackson.annotation.JsonBackReference;'] : []),
    'import jakarta.persistence.Column;',
    ...(entity ? ['import jakarta.persistence.Entity;'] : []),
    'import jakarta.persistence.GeneratedValue;',
    'import jakarta.persistence.GenerationType;',
    'import jakarta.persistence.Id;',
    ...(conRelacion ? ['import jakarta.persistence.JoinColumn;', 'import jakarta.persistence.ManyToOne;'] : []),
    'import jakarta.persistence.Table;',
    ...(fecha === 'LocalDate' ? ['import java.time.LocalDate;'] : []),
    'import java.util.UUID;',
  ].join('\n')
  const relacion = (clase, campo, col, valor) =>
    col === null
      ? ''
      : `
${json ? `  @JsonBackReference(value = "${valor}")\n` : ''}  @ManyToOne
  @JoinColumn(name = "${col}")
  private ${clase} ${campo};
`
  return `package com.biblioteca.models;

${imports}

${entity ? '@Entity\n' : ''}@Table(name = "prestamos")
public class Prestamo {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false)
  private ${fecha} fechaPrestamo;

  @Column(nullable = false)
  private boolean devuelto;
${relacion('Libro', 'libro', libroCol, 'libro-prestamo')}${relacion('Socio', 'socio', socioCol, 'socio-prestamo')}
  public Prestamo() {
  }
${gs('UUID', 'id')}${gs(fecha, 'fechaPrestamo')}${gs('boolean', 'devuelto')}${libroCol !== null ? gs('Libro', 'libro') : ''}${socioCol !== null ? gs('Socio', 'socio') : ''}}
`
}

// Archivos visibles de cada reto: pom.xml, las tres entidades (si existen) y los dos enums.
const proyecto = ({ libro = libroCon(), socio = socioCon(), prestamo } = {}) => ({
  '/pom.xml': POM,
  [LIBRO]: libro,
  [SOCIO]: socio,
  ...(prestamo ? { [PRESTAMO]: prestamo } : {}),
  [CATEGORIA]: CATEGORIA_JAVA,
  [TIPO]: TIPO_JAVA,
})

// ---------- Piezas de expresiones regulares (texto) ----------
// Inicio de línea: así un comentario "// @ManyToOne" no cuenta como anotación.
const L = String.raw`(?:^|\n)[ \t]*`
// Cero o más anotaciones seguidas (con o sin paréntesis), en cualquier orden. Entre ellas se
// permiten líneas de comentario "// ..." completas (deben llegar al final de la línea, así un
// "// @ManyToOne" no puede contar como la anotación).
const ANN = String.raw`(?:(?:@\w+(?:\([^)]*\))?|//[^\n]*\n)\s*)*`
// La anotación `anotacion` está en el grupo de anotaciones que hay justo encima de `campo`.
const encima = (anotacion, campo) => `${L}${ANN}${anotacion}\\s*${ANN}${campo}`

const CAMPO_LIBRO = String.raw`private\s+Libro\s+libro\s*;`
const CAMPO_SOCIO = String.raw`private\s+Socio\s+socio\s*;`
const CAMPO_LISTA = String.raw`private\s+List\s*<\s*Prestamo\s*>\s+prestamos\b`
const MANY = String.raw`@ManyToOne\b(?:\([^)]*\))?`
const ONE = String.raw`@OneToMany\b(?:\([^)]*\))?`
const JOIN = (n) => String.raw`@JoinColumn\([^)]*\bname\s*=\s*"` + n + String.raw`"[^)]*\)`
const MAPPED = (n) => String.raw`@OneToMany\([^)]*\bmappedBy\s*=\s*"` + n + String.raw`"[^)]*\)`
const REF = (tipo, valor) => `@${tipo}\\(\\s*(?:value\\s*=\\s*)?"${valor}"\\s*\\)`
const importa = (paquete, clase) => `import\\s+${paquete.replace(/\./g, '\\.')}\\.(?:${clase}|\\*)\\s*;`

// ---------- Checks reutilizables ----------
const importaEn = (path, paquete, clase) => ({
  type: 'file-includes',
  path,
  pattern: importa(paquete, clase),
  label: `Importa ${paquete}.${clase}`,
  message: `Falta import ${paquete}.${clase}; en ${path.split('/').pop()}.`,
})
const prestamoExiste = {
  type: 'file-exists',
  pattern: '^/src/main/java/com/biblioteca/models/Prestamo\\.java$',
  label: 'Existe models/Prestamo.java',
  message: 'No encuentro /src/main/java/com/biblioteca/models/Prestamo.java. Revisa la ruta y la P mayúscula.',
}
const conEntity = (path, clase) => ({
  type: 'file-excludes',
  path,
  pattern: String.raw`^(?![\s\S]*(?:^|\n)[ \t]*@Entity\b)`,
  label: `${clase} tiene @Entity`,
  message: `Falta @Entity encima de public class ${clase} (en su propia línea, no en un comentario). Sin @Entity, JPA no crea la tabla y la relación no funciona.`,
})
const sinJavax = (path) => ({
  type: 'file-excludes',
  path,
  pattern: 'javax\\.persistence',
  label: 'Usa jakarta.persistence, no javax',
  message: 'En Spring Boot 4 las anotaciones se importan de jakarta.persistence, no de javax.persistence.',
})
const sinIdComoColumna = {
  type: 'file-excludes',
  path: PRESTAMO,
  pattern: String.raw`@JoinColumn\([^)]*\bname\s*=\s*"id"`,
  label: 'Ninguna @JoinColumn usa name = "id"',
  message: 'Una @JoinColumn tiene name = "id", pero "id" ya es la columna de la llave del propio préstamo. Usa "libro_id" para libro y "socio_id" para socio.',
}
const sinColumnaRepetida = {
  type: 'file-excludes',
  path: PRESTAMO,
  pattern: String.raw`@JoinColumn\([^)]*\bname\s*=\s*"([^"]+)"[\s\S]*@JoinColumn\([^)]*\bname\s*=\s*"\1"`,
  label: 'Las dos @JoinColumn tienen nombres distintos',
  message: 'Las dos @JoinColumn usan el mismo name. Cada relación necesita su propia columna: "libro_id" para libro y "socio_id" para socio.',
}
const libroMany = {
  type: 'file-includes',
  path: PRESTAMO,
  pattern: encima(MANY, CAMPO_LIBRO),
  label: 'libro tiene @ManyToOne',
  message: 'Falta @ManyToOne justo encima de private Libro libro; en Prestamo.java.',
}
const libroJoin = {
  type: 'file-includes',
  path: PRESTAMO,
  pattern: encima(JOIN('libro_id'), CAMPO_LIBRO),
  label: 'libro usa @JoinColumn(name = "libro_id")',
  message: 'Falta @JoinColumn(name = "libro_id") encima de private Libro libro; en Prestamo.java.',
}
const socioMany = {
  type: 'file-includes',
  path: PRESTAMO,
  pattern: encima(MANY, CAMPO_SOCIO),
  label: 'socio tiene @ManyToOne',
  message: 'Falta @ManyToOne justo encima de private Socio socio; en Prestamo.java.',
}
const socioJoin = {
  type: 'file-includes',
  path: PRESTAMO,
  pattern: encima(JOIN('socio_id'), CAMPO_SOCIO),
  label: 'socio usa @JoinColumn(name = "socio_id")',
  message: 'Falta @JoinColumn(name = "socio_id") encima de private Socio socio; en Prestamo.java.',
}
const importaMany = {
  type: 'file-includes',
  path: PRESTAMO,
  pattern: importa('jakarta.persistence', 'ManyToOne'),
  label: 'Importa jakarta.persistence.ManyToOne',
  message: 'Falta import jakarta.persistence.ManyToOne; en Prestamo.java.',
}
const importaJoin = {
  type: 'file-includes',
  path: PRESTAMO,
  pattern: importa('jakarta.persistence', 'JoinColumn'),
  label: 'Importa jakarta.persistence.JoinColumn',
  message: 'Falta import jakarta.persistence.JoinColumn; en Prestamo.java.',
}
const listaOne = (path, clase) => ({
  type: 'file-includes',
  path,
  pattern: encima(ONE, CAMPO_LISTA),
  label: `prestamos de ${clase} tiene @OneToMany`,
  message: `Falta @OneToMany justo encima de private List<Prestamo> prestamos en ${clase}.java.`,
})
const libroMapped = {
  type: 'file-includes',
  path: LIBRO,
  pattern: encima(MAPPED('libro'), CAMPO_LISTA),
  label: 'mappedBy nombra el campo libro de Prestamo',
  message: 'En Libro.java falta @OneToMany(mappedBy = "libro") encima de la lista prestamos. mappedBy lleva el nombre del CAMPO de Prestamo (libro), no de la columna ni de la clase.',
}
const socioMapped = {
  type: 'file-includes',
  path: SOCIO,
  pattern: encima(MAPPED('socio'), CAMPO_LISTA),
  label: 'mappedBy nombra el campo socio de Prestamo',
  message: 'En Socio.java falta @OneToMany(mappedBy = "socio") encima de la lista prestamos. El campo de Prestamo se llama socio.',
}
const sinUsuario = {
  type: 'file-excludes',
  path: SOCIO,
  pattern: String.raw`mappedBy\s*=\s*"usuario"`,
  label: 'mappedBy no apunta a "usuario"',
  message: 'mappedBy = "usuario" no sirve: en Prestamo no existe ningún campo usuario. El campo se llama socio, así que va mappedBy = "socio".',
}
const sinJoinEn = (path, clase) => ({
  type: 'file-excludes',
  path,
  pattern: String.raw`(?:^|\n)[ \t]*@JoinColumn\b`,
  label: `${clase} no lleva @JoinColumn`,
  message: `Quita @JoinColumn de ${clase}.java: la columna ya la crea Prestamo. En el lado de la lista solo va @OneToMany(mappedBy = ...).`,
})

// ---------- Archivos de cada etapa ----------
const PRESTAMO_BASE = prestamoCon()
const PRESTAMO_LIBRO = prestamoCon({ libroCol: 'libro_id' })
const PRESTAMO_AMBOS = prestamoCon({ libroCol: 'libro_id', socioCol: 'socio_id' })
const LIBRO_LISTA = libroCon({ mappedBy: 'libro' })
const SOCIO_LISTA = socioCon({ mappedBy: 'socio' })

const modulo = {
  id: 'm05',
  title: 'Relaciones',
  summary: 'Une las entidades: un préstamo apunta a un libro y a un socio con @ManyToOne y @JoinColumn, cada libro y socio ve sus préstamos con @OneToMany(mappedBy) y se evita el bucle infinito del JSON.',
  lessons: [
    {
      id: 'm05-l1',
      title: 'Por qué relacionar entidades',
      explanation: `Piensa en la **ficha de préstamo** de una biblioteca de barrio. La ficha no vuelve a copiar el título, el autor y el ISBN del libro, ni el nombre y el correo del socio. Solo dice **"este libro"** y **"este socio"**, y la fecha. Si mañana se corrige el nombre del socio, todas sus fichas siguen bien, porque apuntan a él y no guardan una copia.

En nuestra Biblioteca ya tienes \`Libro\` y \`Socio\`. Ahora falta la tercera entidad, \`Prestamo\`, que **relaciona** las otras dos. Antes de unirlas, el préstamo necesita sus datos propios:

- \`fechaPrestamo\`: el día en que se prestó. Su tipo es \`LocalDate\` (de \`java.time\`), que guarda solo una fecha, como \`2026-11-18\`. **No** uses \`String\`: con texto, la base de datos no sabe que es una fecha.
- \`devuelto\`: si ya se devolvió o no. Es un \`boolean\` (sí o no).

\`Prestamo\` es una entidad igual que las que hiciste en m03: lleva \`@Entity\` (sin ella, JPA no crea la tabla \`prestamos\` y luego **no se podrá relacionar** con nada), \`@Table\`, la llave \`id\` de tipo \`UUID\` con \`@GeneratedValue(strategy = GenerationType.UUID)\` y el constructor vacío.

Un error que salió en el proyecto de clase: una clase con todo bien pero **sin \`@Entity\`**. El código se ve correcto, pero para JPA esa clase es una clase normal de Java, no una tabla.`,
      challenges: [
        {
          id: 'm05-l1-c1',
          title: 'Crea la entidad Prestamo',
          instructions: `Crea el archivo \`/src/main/java/com/biblioteca/models/Prestamo.java\` (todavía no existe). Mira \`Libro.java\` como modelo.

1. \`package com.biblioteca.models;\`
2. La clase \`public class Prestamo\` con \`@Entity\` y \`@Table(name = "prestamos")\`.
3. La llave: \`@Id\`, \`@GeneratedValue(strategy = GenerationType.UUID)\` y \`private UUID id;\`
4. \`private LocalDate fechaPrestamo;\` (importa \`java.time.LocalDate\`).
5. \`private boolean devuelto;\`
6. El constructor vacío \`public Prestamo() { }\`.

Importa las anotaciones de \`jakarta.persistence\`. Si quieres, pon \`@Column(nullable = false)\` en los dos campos, como en m03 (no se comprueba). Los getters y setters tampoco se comprueban.`,
          files: proyecto(),
          activeFile: LIBRO,
          hints: [
            'Pulsa "Nuevo archivo" y escribe la ruta src/main/java/com/biblioteca/models/Prestamo.java. Copia la estructura de Libro.java.',
            'Arriba van los import: jakarta.persistence.Entity, Table, Id, GeneratedValue, GenerationType, y también java.time.LocalDate y java.util.UUID.',
            'El cuerpo: @Id @GeneratedValue(strategy = GenerationType.UUID) private UUID id; luego private LocalDate fechaPrestamo; private boolean devuelto; y public Prestamo() { }',
          ],
          solution: { [PRESTAMO]: PRESTAMO_BASE },
          checks: [
            prestamoExiste,
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`package\s+com\.biblioteca\.models\s*;`,
              label: 'Empieza con package com.biblioteca.models;',
              message: 'Falta package com.biblioteca.models; al principio de Prestamo.java.',
            },
            conEntity(PRESTAMO, 'Prestamo'),
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: importa('jakarta.persistence', 'Entity'),
              label: 'Importa jakarta.persistence.Entity',
              message: 'Falta import jakarta.persistence.Entity; en Prestamo.java.',
            },
            importaEn(PRESTAMO, 'jakarta.persistence', 'Table'),
            importaEn(PRESTAMO, 'jakarta.persistence', 'Id'),
            importaEn(PRESTAMO, 'jakarta.persistence', 'GeneratedValue'),
            importaEn(PRESTAMO, 'jakarta.persistence', 'GenerationType'),
            importaEn(PRESTAMO, 'java.util', 'UUID'),
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: L + String.raw`@Table\(\s*name\s*=\s*"prestamos"\s*\)`,
              label: 'Tiene @Table(name = "prestamos")',
              message: 'Falta @Table(name = "prestamos") encima de la clase Prestamo.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`public\s+class\s+Prestamo\b`,
              label: 'Tiene la clase Prestamo',
              message: 'Falta public class Prestamo en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: encima(String.raw`@Id\b`, String.raw`private\s+UUID\s+id\s*;`),
              label: 'La llave es @Id private UUID id',
              message: 'Falta @Id encima de private UUID id; en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: L + String.raw`@GeneratedValue\(\s*strategy\s*=\s*GenerationType\.UUID\s*\)`,
              label: 'El id se genera como UUID',
              message: 'Falta @GeneratedValue(strategy = GenerationType.UUID) en el id de Prestamo.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`private\s+LocalDate\s+fechaPrestamo\s*;`,
              label: 'fechaPrestamo es LocalDate',
              message: 'Falta private LocalDate fechaPrestamo; en Prestamo.java.',
            },
            {
              type: 'file-excludes',
              path: PRESTAMO,
              pattern: String.raw`String\s+fechaPrestamo`,
              label: 'fechaPrestamo no es String',
              message: 'fechaPrestamo debe ser LocalDate, no String: así la base de datos sabe que es una fecha.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: importa('java.time', 'LocalDate'),
              label: 'Importa java.time.LocalDate',
              message: 'Falta import java.time.LocalDate; en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`private\s+(?:boolean|Boolean)\s+devuelto\s*;`,
              label: 'devuelto es boolean',
              message: 'Falta private boolean devuelto; en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`public\s+Prestamo\s*\(\s*\)`,
              label: 'Tiene el constructor vacío',
              message: 'Falta el constructor vacío public Prestamo() { } que JPA necesita.',
            },
            sinJavax(PRESTAMO),
          ],
          xp: 10,
        },
        {
          id: 'm05-l1-c2',
          title: 'Arregla el Prestamo de un compañero',
          instructions: `Un compañero escribió \`Prestamo.java\` (ya está abierto), pero tiene dos errores típicos de clase:

1. **Le falta \`@Entity\`** encima de \`public class Prestamo\`. Ponla y agrega \`import jakarta.persistence.Entity;\`.
2. \`fechaPrestamo\` es \`String\`. Cámbialo a **\`LocalDate\`** (en el campo, en el getter y en el setter) y agrega \`import java.time.LocalDate;\`.`,
          files: proyecto({ prestamo: prestamoCon({ entity: false, fecha: 'String' }) }),
          activeFile: PRESTAMO,
          hints: [
            'Compara Prestamo.java con Libro.java: ¿qué anotación tiene Libro encima de la clase que a Prestamo le falta?',
            'Escribe @Entity en la línea justo encima de @Table(name = "prestamos") y su import jakarta.persistence.Entity;',
            'Cambia las tres apariciones de String fechaPrestamo por LocalDate fechaPrestamo (campo, getter y parámetro del setter) e importa java.time.LocalDate.',
          ],
          solution: { [PRESTAMO]: PRESTAMO_BASE },
          checks: [
            conEntity(PRESTAMO, 'Prestamo'),
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: importa('jakarta.persistence', 'Entity'),
              label: 'Importa jakarta.persistence.Entity',
              message: 'Falta import jakarta.persistence.Entity; en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`private\s+LocalDate\s+fechaPrestamo\s*;`,
              label: 'fechaPrestamo es LocalDate',
              message: 'Falta private LocalDate fechaPrestamo; en Prestamo.java.',
            },
            {
              type: 'file-excludes',
              path: PRESTAMO,
              pattern: String.raw`String\s+(?:fechaPrestamo|getFechaPrestamo\s*\()`,
              label: 'Ya no queda String fechaPrestamo',
              message: 'Todavía aparece String fechaPrestamo (mira también el getter y el setter): debe ser LocalDate.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: importa('java.time', 'LocalDate'),
              label: 'Importa java.time.LocalDate',
              message: 'Falta import java.time.LocalDate; en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: String.raw`public\s+class\s+Prestamo\b`,
              label: 'La clase Prestamo sigue ahí',
              message: 'Parece que se borró public class Prestamo. Usa "Reiniciar reto" si lo necesitas.',
            },
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm05-l2',
      title: 'Muchos préstamos, un libro: @ManyToOne',
      explanation: `Un mismo libro se presta muchas veces a lo largo del año: hay **muchas fichas** de préstamo que apuntan a **un solo libro**. Eso es una relación **muchos a uno**, y en Java se escribe en el lado de "muchos", que es \`Prestamo\`:

\`\`\`java
@ManyToOne
@JoinColumn(name = "libro_id")
private Libro libro;
\`\`\`

- \`private Libro libro;\` guarda **el libro entero** (un objeto \`Libro\`), no un \`UUID\` suelto. Así, desde un préstamo puedes llegar a su título o a su autor.
- \`@ManyToOne\` le dice a JPA: "muchos préstamos pueden tener el mismo libro". Sin ella, JPA no sabría guardar un \`Libro\` dentro de la tabla \`prestamos\`.
- \`@JoinColumn(name = "libro_id")\` elige **el nombre de la columna** de la tabla \`prestamos\` donde se apunta el id del libro. Es como la casilla "Libro n.º" de la ficha.

El préstamo también tiene un socio: otra relación igual, con su **propia** columna, \`socio_id\`.

**Cuidado con el error de clase:** poner \`@JoinColumn(name = "id")\` en las dos relaciones. La tabla \`prestamos\` ya tiene una columna \`id\` (la llave del préstamo), y además las dos relaciones intentarían escribir en la misma casilla. Es como una ficha con una sola casilla "n.º" para el libro, el socio y la ficha a la vez: nadie sabría qué número es cuál. Cada relación lleva un nombre **distinto**: \`libro_id\` y \`socio_id\`.

Las dos anotaciones se importan de \`jakarta.persistence\`: \`jakarta.persistence.ManyToOne\` y \`jakarta.persistence.JoinColumn\`.`,
      challenges: [
        {
          id: 'm05-l2-c1',
          title: 'El préstamo apunta a un libro',
          instructions: `En \`Prestamo.java\`, debajo de \`devuelto\`, agrega la relación con el libro:

\`\`\`java
@ManyToOne
@JoinColumn(name = "libro_id")
private Libro libro;
\`\`\`

Agrega también \`import jakarta.persistence.ManyToOne;\` e \`import jakarta.persistence.JoinColumn;\`. El getter y el setter de \`libro\` son opcionales.`,
          files: proyecto({ prestamo: PRESTAMO_BASE }),
          activeFile: PRESTAMO,
          hints: [
            'El campo va en Prestamo, no en Libro: es el préstamo el que dice "este libro".',
            'El campo es del tipo Libro (la clase), no UUID: private Libro libro;',
            'Encima del campo, en dos líneas: @ManyToOne y @JoinColumn(name = "libro_id"). Arriba del archivo, los dos import de jakarta.persistence.',
          ],
          solution: { [PRESTAMO]: PRESTAMO_LIBRO },
          checks: [
            importaMany,
            importaJoin,
            libroMany,
            libroJoin,
            sinIdComoColumna,
            {
              type: 'file-excludes',
              path: PRESTAMO,
              pattern: String.raw`UUID\s+libroId\b`,
              label: 'Guarda el Libro entero, no solo su id',
              message: 'No uses private UUID libroId: con @ManyToOne el campo es private Libro libro; y JPA guarda el id por ti en la columna libro_id.',
            },
            conEntity(PRESTAMO, 'Prestamo'),
            sinJavax(PRESTAMO),
          ],
          xp: 10,
        },
        {
          id: 'm05-l2-c2',
          title: 'Y también a un socio',
          instructions: `Ahora agrega, debajo de \`libro\`, la relación con el socio. Fíjate en que la columna tiene **otro nombre**:

\`\`\`java
@ManyToOne
@JoinColumn(name = "socio_id")
private Socio socio;
\`\`\`

No cambies la relación de \`libro\`: sigue con \`@JoinColumn(name = "libro_id")\`.`,
          files: proyecto({ prestamo: PRESTAMO_LIBRO }),
          activeFile: PRESTAMO,
          hints: [
            'Es igual que la de libro, pero con la clase Socio y el campo socio.',
            'Los import de ManyToOne y JoinColumn ya están: no hace falta repetirlos.',
            'La columna se llama socio_id, distinta de libro_id: @ManyToOne, @JoinColumn(name = "socio_id") y private Socio socio;',
          ],
          solution: { [PRESTAMO]: PRESTAMO_AMBOS },
          checks: [socioMany, socioJoin, libroJoin, sinColumnaRepetida, sinIdComoColumna, conEntity(PRESTAMO, 'Prestamo'), sinJavax(PRESTAMO)],
          xp: 10,
        },
        {
          id: 'm05-l2-c3',
          title: 'Arregla las columnas repetidas',
          instructions: `Este \`Prestamo.java\` viene del proyecto de clase: las **dos** relaciones usan \`@JoinColumn(name = "id")\`. Así chocan entre ellas y con la llave del préstamo.

Arréglalo:

- En \`libro\`: \`@JoinColumn(name = "libro_id")\`
- En \`socio\`: \`@JoinColumn(name = "socio_id")\``,
          files: proyecto({ prestamo: prestamoCon({ libroCol: 'id', socioCol: 'id' }) }),
          activeFile: PRESTAMO,
          hints: [
            'Busca las dos líneas que dicen @JoinColumn(name = "id").',
            'Cada relación necesita su propia columna, y ninguna puede llamarse id porque esa es la llave del préstamo.',
            'La de encima de private Libro libro; queda @JoinColumn(name = "libro_id") y la de encima de private Socio socio; queda @JoinColumn(name = "socio_id").',
          ],
          solution: { [PRESTAMO]: PRESTAMO_AMBOS },
          checks: [sinIdComoColumna, sinColumnaRepetida, libroJoin, socioJoin, libroMany, socioMany, sinJavax(PRESTAMO)],
          xp: 10,
        },
      ],
    },
    {
      id: 'm05-l3',
      title: 'El otro lado: @OneToMany y el bucle del JSON',
      explanation: `En la ficha del libro, la biblioteca también apunta su **historial**: "este libro se prestó a Ana, luego a Luis...". Es el mismo dato que ya está en las fichas de préstamo, visto desde el otro lado: **un libro, muchos préstamos**.

\`\`\`java
@OneToMany(mappedBy = "libro")
private List<Prestamo> prestamos = new ArrayList<>();
\`\`\`

- \`@OneToMany\` es la pareja de \`@ManyToOne\`: "un libro tiene muchos préstamos".
- \`mappedBy = "libro"\` dice: "no crees otra columna; esta información **ya está guardada** en el campo \`libro\` de \`Prestamo\`". Por eso en \`Libro\` **no** va \`@JoinColumn\`.
- \`mappedBy\` lleva el **nombre del campo en Java** de la otra clase (\`private Libro libro;\` se llama \`libro\`). No es el nombre de la columna (\`libro_id\`), ni el de la clase (\`Libro\`), ni el de la lista.

Error del proyecto de clase: en \`Video\` se escribió \`mappedBy = "usuario"\`, pero el campo de la otra clase no se llamaba así. JPA busca un campo con ese nombre exacto y, si no existe, la aplicación **no arranca**. En \`Socio\`, el campo de \`Prestamo\` se llama \`socio\`, así que va \`mappedBy = "socio"\`.

### El bucle infinito del JSON

Más adelante (en m09) la aplicación enviará los datos como **JSON**, un texto que leen las webs y las apps del celular. Al convertir un libro a JSON, Java escribe sus préstamos; cada préstamo escribe su libro; ese libro vuelve a escribir sus préstamos... Es como poner **dos espejos frente a frente**: la imagen se repite sin fin y la aplicación acaba fallando.

La solución son dos anotaciones de \`com.fasterxml.jackson.annotation\` (Jackson es la librería que escribe el JSON):

- \`@JsonManagedReference\` en la **lista** (\`Libro\` y \`Socio\`): esta parte **sí** se escribe.
- \`@JsonBackReference\` en el campo de **vuelta** (\`libro\` y \`socio\` en \`Prestamo\`): esta parte **no** se escribe, y así se corta el bucle.

Como \`Prestamo\` tiene dos parejas, cada pareja lleva un \`value\` con su nombre, como las **dos mitades de una boleta de rifa** con el mismo número: \`@JsonManagedReference(value = "libro-prestamo")\` en \`Libro\` va con \`@JsonBackReference(value = "libro-prestamo")\` en \`Prestamo\`. Si los dos \`value\` no son **exactamente iguales**, Jackson no encuentra la pareja y da error al recibir datos.

Ojo: con \`@JsonBackReference\`, el JSON de un préstamo no mostrará su libro ni su socio (esa parte se corta para evitar el bucle); eso se resolverá más adelante en el curso.`,
      challenges: [
        {
          id: 'm05-l3-c1',
          title: 'El historial de préstamos del libro',
          instructions: `En \`Libro.java\`, debajo de \`categoria\`, agrega la lista de préstamos del libro:

\`\`\`java
@OneToMany(mappedBy = "libro")
private List<Prestamo> prestamos = new ArrayList<>();
\`\`\`

Agrega los import \`jakarta.persistence.OneToMany\`, \`java.util.List\` y \`java.util.ArrayList\`. No pongas \`@JoinColumn\` en \`Libro\`: la columna ya está en \`Prestamo\`.`,
          files: proyecto({ prestamo: PRESTAMO_AMBOS }),
          activeFile: LIBRO,
          hints: [
            'Mira Prestamo.java: ¿cómo se llama el campo de tipo Libro? Ese nombre es el que va en mappedBy.',
            'El campo se llama libro (private Libro libro;), así que es mappedBy = "libro": ni "libro_id" ni "Libro".',
            'En Libro.java: @OneToMany(mappedBy = "libro") y debajo private List<Prestamo> prestamos = new ArrayList<>(); con sus tres import.',
          ],
          solution: { [LIBRO]: LIBRO_LISTA },
          checks: [
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: importa('jakarta.persistence', 'OneToMany'),
              label: 'Importa jakarta.persistence.OneToMany',
              message: 'Falta import jakarta.persistence.OneToMany; en Libro.java.',
            },
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: importa('java.util', 'List'),
              label: 'Importa java.util.List',
              message: 'Falta import java.util.List; en Libro.java.',
            },
            {
              type: 'file-excludes',
              path: LIBRO,
              pattern: String.raw`^(?![\s\S]*import\s+java\.util\.(?:ArrayList|\*)\s*;)[\s\S]*new\s+ArrayList\b`,
              label: 'Si usas new ArrayList<>(), está importado',
              message: 'Usas new ArrayList<>() pero falta import java.util.ArrayList; en Libro.java.',
            },
            listaOne(LIBRO, 'Libro'),
            libroMapped,
            {
              type: 'file-excludes',
              path: LIBRO,
              pattern: String.raw`mappedBy\s*=\s*"(?!libro")`,
              label: 'mappedBy no usa otro nombre',
              message: 'En Libro.java, mappedBy debe ser exactamente "libro": el nombre del campo private Libro libro; de Prestamo.',
            },
            sinJoinEn(LIBRO, 'Libro'),
            conEntity(LIBRO, 'Libro'),
          ],
          xp: 10,
        },
        {
          id: 'm05-l3-c2',
          title: 'Arregla el mappedBy del socio',
          instructions: `Este \`Socio.java\` ya tiene su lista de préstamos, pero copia un error del proyecto de clase (el de \`Video\`): dice \`mappedBy = "usuario"\`.

Mira \`Prestamo.java\`: el campo de tipo \`Socio\` se llama \`socio\`. Cambia la anotación para que quede \`@OneToMany(mappedBy = "socio")\`.`,
          files: proyecto({ prestamo: PRESTAMO_AMBOS, libro: LIBRO_LISTA, socio: socioCon({ mappedBy: 'usuario' }) }),
          activeFile: SOCIO,
          hints: [
            'mappedBy no es un nombre cualquiera: es el nombre de un campo que tiene que existir en Prestamo.',
            'En Prestamo.java busca la línea private Socio ...; ¿cómo se llama ese campo?',
            'Se llama socio, así que la línea queda @OneToMany(mappedBy = "socio").',
          ],
          solution: { [SOCIO]: SOCIO_LISTA },
          checks: [
            sinUsuario,
            socioMapped,
            {
              type: 'file-excludes',
              path: SOCIO,
              pattern: String.raw`mappedBy\s*=\s*"(?!socio")`,
              label: 'mappedBy no usa otro nombre',
              message: 'En Socio.java, mappedBy debe ser exactamente "socio": el nombre del campo private Socio socio; de Prestamo.',
            },
            listaOne(SOCIO, 'Socio'),
            sinJoinEn(SOCIO, 'Socio'),
          ],
          xp: 10,
        },
        {
          id: 'm05-l3-c3',
          title: 'Corta el bucle del JSON',
          instructions: `Último reto del módulo: las relaciones ya están en las tres entidades. Agrega las **dos parejas** de referencias, con el \`value\` **igual** en las dos mitades:

**Pareja libro-prestamo**
- \`Libro.java\`, encima de \`prestamos\`: \`@JsonManagedReference(value = "libro-prestamo")\`
- \`Prestamo.java\`, encima de \`libro\`: \`@JsonBackReference(value = "libro-prestamo")\`

**Pareja socio-prestamo**
- \`Socio.java\`, encima de \`prestamos\`: \`@JsonManagedReference(value = "socio-prestamo")\`
- \`Prestamo.java\`, encima de \`socio\`: \`@JsonBackReference(value = "socio-prestamo")\`

Importa cada anotación de \`com.fasterxml.jackson.annotation\` en el archivo donde la uses. Se comprueba también que todo lo del módulo siga bien (\`@Entity\`, las columnas \`libro_id\`/\`socio_id\` y los \`mappedBy\`).`,
          files: proyecto({ prestamo: PRESTAMO_AMBOS, libro: LIBRO_LISTA, socio: SOCIO_LISTA }),
          activeFile: PRESTAMO,
          hints: [
            'Managed va en el lado de la lista (Libro y Socio) y Back en el lado de vuelta (los campos libro y socio de Prestamo).',
            'Los import son import com.fasterxml.jackson.annotation.JsonManagedReference; en Libro y Socio, e import com.fasterxml.jackson.annotation.JsonBackReference; en Prestamo.',
            'Encima de private Libro libro; escribe @JsonBackReference(value = "libro-prestamo") y encima de private Socio socio; escribe @JsonBackReference(value = "socio-prestamo"). Los mismos value van en los @JsonManagedReference de Libro y Socio.',
          ],
          solution: {
            [LIBRO]: libroCon({ mappedBy: 'libro', json: true }),
            [SOCIO]: socioCon({ mappedBy: 'socio', json: true }),
            [PRESTAMO]: prestamoCon({ libroCol: 'libro_id', socioCol: 'socio_id', json: true }),
          },
          checks: [
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: importa('com.fasterxml.jackson.annotation', 'JsonManagedReference'),
              label: 'Libro importa JsonManagedReference',
              message: 'Falta import com.fasterxml.jackson.annotation.JsonManagedReference; en Libro.java.',
            },
            {
              type: 'file-includes',
              path: LIBRO,
              pattern: encima(REF('JsonManagedReference', 'libro-prestamo'), CAMPO_LISTA),
              label: 'prestamos de Libro tiene @JsonManagedReference(value = "libro-prestamo")',
              message: 'En Libro.java falta @JsonManagedReference(value = "libro-prestamo") encima de la lista prestamos.',
            },
            {
              type: 'file-includes',
              path: SOCIO,
              pattern: importa('com.fasterxml.jackson.annotation', 'JsonManagedReference'),
              label: 'Socio importa JsonManagedReference',
              message: 'Falta import com.fasterxml.jackson.annotation.JsonManagedReference; en Socio.java.',
            },
            {
              type: 'file-includes',
              path: SOCIO,
              pattern: encima(REF('JsonManagedReference', 'socio-prestamo'), CAMPO_LISTA),
              label: 'prestamos de Socio tiene @JsonManagedReference(value = "socio-prestamo")',
              message: 'En Socio.java falta @JsonManagedReference(value = "socio-prestamo") encima de la lista prestamos.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: importa('com.fasterxml.jackson.annotation', 'JsonBackReference'),
              label: 'Prestamo importa JsonBackReference',
              message: 'Falta import com.fasterxml.jackson.annotation.JsonBackReference; en Prestamo.java.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: encima(REF('JsonBackReference', 'libro-prestamo'), CAMPO_LIBRO),
              label: 'libro tiene @JsonBackReference(value = "libro-prestamo")',
              message: 'Encima de private Libro libro; falta @JsonBackReference(value = "libro-prestamo"). El value tiene que ser igual al del @JsonManagedReference de Libro.',
            },
            {
              type: 'file-includes',
              path: PRESTAMO,
              pattern: encima(REF('JsonBackReference', 'socio-prestamo'), CAMPO_SOCIO),
              label: 'socio tiene @JsonBackReference(value = "socio-prestamo")',
              message: 'Encima de private Socio socio; falta @JsonBackReference(value = "socio-prestamo"). El value tiene que ser igual al del @JsonManagedReference de Socio.',
            },
            {
              type: 'file-excludes',
              pattern: String.raw`@Json(?:Managed|Back)Reference\(\s*(?:value\s*=\s*)?"(?!(?:libro|socio)-prestamo")`,
              label: 'Los value son solo "libro-prestamo" y "socio-prestamo"',
              message: 'Hay un value distinto de "libro-prestamo" o "socio-prestamo". Las dos mitades de cada pareja deben ser iguales, letra por letra.',
            },
            {
              type: 'file-excludes',
              pattern: L + String.raw`(?:@\w+(?:\([^)]*\))?[ \t]*)*@Json(?:Managed|Back)Reference\b(?!\s*\()`,
              label: 'Cada referencia lleva su value',
              message: 'Hay un @JsonManagedReference o @JsonBackReference sin value. Con dos parejas, cada una necesita su nombre: (value = "libro-prestamo") o (value = "socio-prestamo").',
            },
            {
              type: 'file-excludes',
              path: PRESTAMO,
              pattern: String.raw`(?:^|\n)[ \t]*@JsonManagedReference\b`,
              label: 'Prestamo no usa @JsonManagedReference',
              message: 'En Prestamo va @JsonBackReference (el lado de vuelta, que no se escribe). @JsonManagedReference va en las listas de Libro y Socio.',
            },
            {
              type: 'file-excludes',
              path: LIBRO,
              pattern: String.raw`(?:^|\n)[ \t]*@JsonBackReference\b`,
              label: 'Libro no usa @JsonBackReference',
              message: 'En la lista de Libro va @JsonManagedReference, no @JsonBackReference.',
            },
            {
              type: 'file-excludes',
              path: SOCIO,
              pattern: String.raw`(?:^|\n)[ \t]*@JsonBackReference\b`,
              label: 'Socio no usa @JsonBackReference',
              message: 'En la lista de Socio va @JsonManagedReference, no @JsonBackReference.',
            },
            conEntity(PRESTAMO, 'Prestamo'),
            importaMany,
            importaJoin,
            libroMany,
            socioMany,
            libroJoin,
            socioJoin,
            sinIdComoColumna,
            libroMapped,
            socioMapped,
            sinUsuario,
            sinJavax(PRESTAMO),
          ],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
