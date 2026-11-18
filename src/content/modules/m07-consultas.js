// Módulo 7: consultas por nombre. Le pides cosas al bibliotecario (el repositorio) escribiendo el nombre del método.
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

// Rutas del proyecto Biblioteca (docs/temario.md, "Nombres y rutas").
const MODELS = '/src/main/java/com/biblioteca/models'
const LIBRO = `${MODELS}/Libro.java`
const SOCIO = `${MODELS}/Socio.java`
const PRESTAMO = `${MODELS}/Prestamo.java`
const CATEGORIA = `${MODELS}/helpers/CategoriaLibro.java`
const TIPO = `${MODELS}/helpers/TipoSocio.java`
const REPOS = '/src/main/java/com/biblioteca/repositories'
const LIBRO_REPO = `${REPOS}/ILibroRepositorio.java`
const SOCIO_REPO = `${REPOS}/ISocioRepositorio.java`
const PRESTAMO_REPO = `${REPOS}/IPrestamoRepositorio.java`

// Entidades y enums tal como quedan al terminar m05 (ya terminados: en este módulo no se tocan).
const CATEGORIA_JAVA = `package com.biblioteca.models.helpers;

public enum CategoriaLibro {
  NOVELA,
  CIENCIA,
  HISTORIA,
  INFANTIL
}
`

const TIPO_JAVA = `package com.biblioteca.models.helpers;

public enum TipoSocio {
  ESTUDIANTE,
  DOCENTE,
  EXTERNO
}
`

const LIBRO_JAVA = `package com.biblioteca.models;

import com.biblioteca.models.helpers.CategoriaLibro;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

  @Column(nullable = false, length = 100)
  private String autor;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CategoriaLibro categoria;

  @OneToMany(mappedBy = "libro")
  @JsonManagedReference(value = "libro-prestamos")
  private List<Prestamo> prestamos = new ArrayList<>();

  public Libro() {
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
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

  public List<Prestamo> getPrestamos() {
    return prestamos;
  }

  public void setPrestamos(List<Prestamo> prestamos) {
    this.prestamos = prestamos;
  }
}
`

const SOCIO_JAVA = `package com.biblioteca.models;

import com.biblioteca.models.helpers.TipoSocio;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "socios")
public class Socio {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(nullable = false, length = 100)
  private String nombre;

  @Column(nullable = false, unique = true, length = 120)
  private String correo;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TipoSocio tipo;

  @OneToMany(mappedBy = "socio")
  @JsonManagedReference(value = "socio-prestamos")
  private List<Prestamo> prestamos = new ArrayList<>();

  public Socio() {
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
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

  public List<Prestamo> getPrestamos() {
    return prestamos;
  }

  public void setPrestamos(List<Prestamo> prestamos) {
    this.prestamos = prestamos;
  }
}
`

const PRESTAMO_JAVA = `package com.biblioteca.models;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "prestamos")
public class Prestamo {

  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private UUID id;

  @Column(name = "fecha_prestamo", nullable = false)
  private LocalDate fechaPrestamo;

  @Column(nullable = false)
  private boolean devuelto;

  @ManyToOne
  @JoinColumn(name = "libro_id")
  @JsonBackReference(value = "libro-prestamos")
  private Libro libro;

  @ManyToOne
  @JoinColumn(name = "socio_id")
  @JsonBackReference(value = "socio-prestamos")
  private Socio socio;

  public Prestamo() {
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public LocalDate getFechaPrestamo() {
    return fechaPrestamo;
  }

  public void setFechaPrestamo(LocalDate fechaPrestamo) {
    this.fechaPrestamo = fechaPrestamo;
  }

  public boolean isDevuelto() {
    return devuelto;
  }

  public void setDevuelto(boolean devuelto) {
    this.devuelto = devuelto;
  }

  public Libro getLibro() {
    return libro;
  }

  public void setLibro(Libro libro) {
    this.libro = libro;
  }

  public Socio getSocio() {
    return socio;
  }

  public void setSocio(Socio socio) {
    this.socio = socio;
  }
}
`

// Comienzo de línea: así una línea comentada (// ...) con la respuesta no pasa el check.
const L = '(?:^|\\n)[ \\t]*'

// Un repositorio como queda al terminar m06, con métodos de consulta dentro y sus imports extra.
const repoCon = (entidad, metodos = [], imports = []) => {
  const todos = [
    `com.biblioteca.models.${entidad}`,
    ...imports,
    'java.util.UUID',
    'org.springframework.data.jpa.repository.JpaRepository',
    'org.springframework.stereotype.Repository',
  ].sort()
  const cuerpo = metodos.length ? `\n${metodos.map((m) => `  ${m}\n`).join('\n')}` : ''
  return `package com.biblioteca.repositories;

${todos.map((i) => `import ${i};`).join('\n')}

@Repository
public interface I${entidad}Repositorio extends JpaRepository<${entidad}, UUID> {
${cuerpo}}
`
}

// Piezas de las expresiones regulares de los métodos.
const gen = (tipo, dentro) => `${tipo}\\s*<\\s*${dentro}\\s*>`
const p = (tipo) => `${tipo}\\s+\\w+`
const metodo = (retorno, nombre, ...params) =>
  `${L}(?:public\\s+)?${retorno}\\s+${nombre}\\s*\\(\\s*${params.join('\\s*,\\s*')}\\s*\\)\\s*;?`

const nombreDe = (path) => path.split('/').pop()

const chkImport = (path, paquete, clase) => ({
  type: 'file-includes',
  path,
  pattern: `${L}import\\s+${paquete.replaceAll('.', '\\.')}\\.(?:${clase}|\\*)\\s*;`,
  label: `Importa ${clase}`,
  message: `Falta import ${paquete}.${clase}; en ${nombreDe(path)}.`,
})

const chkMetodo = (path, pattern, label, message) => ({ type: 'file-includes', path, pattern, label, message })
const chkError = (path, pattern, label, message) => ({ type: 'file-excludes', path, pattern, label, message })

// El repositorio de m06 sigue entero (nadie borró la línea de la interface).
const chkSigue = (path, entidad) => ({
  type: 'file-includes',
  path,
  pattern: `${L}(?:public\\s+)?interface\\s+I${entidad}Repositorio\\s+extends\\s+JpaRepository\\s*<\\s*${entidad}\\s*,\\s*UUID\\s*>`,
  label: `I${entidad}Repositorio sigue heredando de JpaRepository<${entidad}, UUID>`,
  message: `No toques la línea public interface I${entidad}Repositorio extends JpaRepository<${entidad}, UUID>: los métodos van dentro de las llaves.`,
})

// Archivos de inicio: el pom.xml, las entidades y enums que hacen falta y los repositorios.
const conLibro = (repo) => ({ '/pom.xml': POM, [LIBRO]: LIBRO_JAVA, [CATEGORIA]: CATEGORIA_JAVA, [LIBRO_REPO]: repo })
const conSocio = (repo) => ({ '/pom.xml': POM, [SOCIO]: SOCIO_JAVA, [TIPO]: TIPO_JAVA, [SOCIO_REPO]: repo })

// Métodos que se van sumando reto a reto.
const ISBN = 'Optional<Libro> findByIsbn(String isbn);'
const CATEGORIA_M = 'List<Libro> findByCategoria(CategoriaLibro categoria);'
const CORREO = 'Optional<Socio> findByCorreo(String correo);'
const LIBRO_IMPORTS_1 = ['java.util.Optional']
const LIBRO_IMPORTS_2 = ['com.biblioteca.models.helpers.CategoriaLibro', 'java.util.List', 'java.util.Optional']

const chkIsbn = (path, message) =>
  chkMetodo(path, metodo(gen('Optional', 'Libro'), 'findByIsbn', p('String')), 'Tiene Optional<Libro> findByIsbn(String isbn)', message)
const chkCategoria = (path, message) =>
  chkMetodo(path, metodo(gen('List', 'Libro'), 'findByCategoria', p('CategoriaLibro')), 'Tiene List<Libro> findByCategoria(CategoriaLibro categoria)', message)
const chkCategoriaNoString = (path) =>
  chkError(path, 'findByCategoria\\w*\\s*\\(\\s*String\\b', 'categoria se busca con el enum, no con String',
    'categoria es del tipo enum CategoriaLibro, no String: el parámetro debe ser CategoriaLibro categoria.')

const AUTOR_M = 'List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor);'
const TIPO_M = 'List<Socio> findByTipoOrderByNombreAsc(TipoSocio tipo);'
const TITULO_M = 'List<Libro> findByTituloContainingIgnoreCase(String titulo);'
const SOCIO_IMPORTS_2 = ['com.biblioteca.models.helpers.TipoSocio', 'java.util.List', 'java.util.Optional']

const chkAutor = (path, message) =>
  chkMetodo(path, metodo(gen('List', 'Libro'), 'findByCategoriaAndAutor', p('CategoriaLibro'), p('String')),
    'Tiene List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor)', message)
const chkCorreo = (path, message) =>
  chkMetodo(path, metodo(gen('Optional', 'Socio'), 'findByCorreo', p('String')), 'Tiene Optional<Socio> findByCorreo(String correo)', message)
const chkTipo = (path, message) =>
  chkMetodo(path, metodo(gen('List', 'Socio'), 'findByTipoOrderByNombreAsc', p('TipoSocio')),
    'Tiene List<Socio> findByTipoOrderByNombreAsc(TipoSocio tipo)', message)
const chkTipoNoString = (path) =>
  chkError(path, '(?:findBy|countBy)Tipo\\w*\\s*\\(\\s*String\\b', 'tipo se busca con el enum, no con String',
    'tipo es del tipo enum TipoSocio, no String: el parámetro debe ser TipoSocio tipo.')

const modulo = {
  id: 'm07',
  title: 'Consultas por nombre',
  summary: 'Pide al repositorio justo lo que buscas escribiendo solo el nombre del método: findBy, And, OrderBy, Containing, existsBy y countBy, con los tipos correctos. Extra: @Query.',
  lessons: [
    {
      id: 'm07-l1',
      title: 'Pedir por nombre: findBy',
      explanation: `En m06 el bibliotecario ya sabía traer **todos** los libros o uno **por su id**. Pero en la vida real nadie pide un libro por su código UUID: dices "tráeme el libro con **ISBN** 978-84..." o "tráeme todas las **novelas**".

En Spring basta con **escribir el nombre del método** dentro del repositorio. Spring lee el nombre como una frase y escribe solo la consulta a la base de datos:

\`\`\`java
@Repository
public interface ILibroRepositorio extends JpaRepository<Libro, UUID> {

  Optional<Libro> findByIsbn(String isbn);
}
\`\`\`

Se lee así: **find** ("busca") **By** ("por") **Isbn** (el campo \`isbn\` de \`Libro\`). No escribes el cuerpo del método: es una interface, y Spring fabrica el trabajo, igual que con \`save\` o \`findAll\`.

### Tres reglas que Spring revisa al arrancar

1. **El nombre del campo, exacto.** Después de \`findBy\` va el nombre del campo de la entidad con la primera letra en mayúscula: \`isbn\` → \`findByIsbn\`, \`correo\` → \`findByCorreo\`. Si escribes \`findByISBN\` o \`findByEmail\`, Spring busca un campo que **no existe** en la ficha y la aplicación no arranca.
2. **El parámetro, del mismo tipo que el campo.** \`isbn\` es \`String\`, así que \`findByIsbn(String isbn)\`. Y \`categoria\` es el enum \`CategoriaLibro\`, así que el parámetro es \`CategoriaLibro categoria\`, **no** \`String categoria\` (error muy común en clase). Es como pedir un libro de la sección "Novela" señalando el cartel de la estantería, no escribiendo la palabra a mano con faltas.
3. **Lo que devuelve depende de cuántos puede haber.**
   - Campo **único** (\`isbn\`, \`correo\`): como mucho hay uno. Devuelve \`Optional<Libro>\`, la **caja** de m06 que puede venir vacía.
   - Campo que se **repite** (\`categoria\`): puede haber muchos. Devuelve \`List<Libro>\` (si no hay ninguno, la lista viene vacía).

\`Optional\` y \`List\` están en \`java.util\`, así que necesitan su import (\`import java.util.Optional;\`, \`import java.util.List;\`), igual que el enum: \`import com.biblioteca.models.helpers.CategoriaLibro;\`.`,
      challenges: [
        {
          id: 'm07-l1-c1',
          title: 'Busca un libro por su ISBN',
          instructions: `En \`ILibroRepositorio.java\`, dentro de las llaves de la interface, añade el método:

\`Optional<Libro> findByIsbn(String isbn);\`

Y arriba, junto a los otros imports: \`import java.util.Optional;\`

El isbn es **único** (mira \`unique = true\` en \`Libro.java\`): por eso devuelve \`Optional<Libro>\` y no una lista.`,
          files: conLibro(repoCon('Libro')),
          activeFile: LIBRO_REPO,
          hints: [
            'El método va dentro de las llaves { } de ILibroRepositorio, y no lleva cuerpo: termina en punto y coma.',
            'find + By + Isbn (el campo isbn con la I mayúscula). Devuelve la caja Optional porque solo puede haber un libro con ese isbn.',
            'Escribe dentro de la interface: Optional<Libro> findByIsbn(String isbn); y arriba import java.util.Optional;',
          ],
          solution: { [LIBRO_REPO]: repoCon('Libro', [ISBN], LIBRO_IMPORTS_1) },
          checks: [
            chkImport(LIBRO_REPO, 'java.util', 'Optional'),
            chkIsbn(LIBRO_REPO, 'Falta Optional<Libro> findByIsbn(String isbn); dentro de ILibroRepositorio.'),
            chkError(LIBRO_REPO, `${gen('List', 'Libro')}\\s+findByIsbn`, 'Devuelve Optional, no una lista',
              'El isbn es único: como mucho hay un libro con ese isbn, así que devuelve Optional<Libro>, no List<Libro>.'),
            chkError(LIBRO_REPO, 'findBy(?!Isbn\\b)[Ii][Ss][Bb][Nn]\\b', 'El nombre usa el campo tal cual: Isbn',
              'El campo se llama isbn: el método es findByIsbn (solo la I en mayúscula), no findByISBN.'),
            chkSigue(LIBRO_REPO, 'Libro'),
          ],
          xp: 10,
        },
        {
          id: 'm07-l1-c2',
          title: 'Busca un socio por su correo',
          instructions: `En \`ISocioRepositorio.java\` añade, dentro de la interface:

\`Optional<Socio> findByCorreo(String correo);\`

Y el import \`import java.util.Optional;\`

Mira \`Socio.java\`: el campo se llama \`correo\` (no \`email\`) y es único.`,
          files: conSocio(repoCon('Socio')),
          activeFile: SOCIO_REPO,
          hints: [
            'Es igual que findByIsbn, pero para socios y con el campo correo.',
            'Como el correo es único, devuelve la caja Optional<Socio>. El nombre del campo va con mayúscula: Correo.',
            'Escribe: Optional<Socio> findByCorreo(String correo); y arriba import java.util.Optional;',
          ],
          solution: { [SOCIO_REPO]: repoCon('Socio', [CORREO], ['java.util.Optional']) },
          checks: [
            chkImport(SOCIO_REPO, 'java.util', 'Optional'),
            chkMetodo(SOCIO_REPO, metodo(gen('Optional', 'Socio'), 'findByCorreo', p('String')), 'Tiene Optional<Socio> findByCorreo(String correo)',
              'Falta Optional<Socio> findByCorreo(String correo); dentro de ISocioRepositorio.'),
            chkError(SOCIO_REPO, `${gen('List', 'Socio')}\\s+findByCorreo`, 'Devuelve Optional, no una lista',
              'El correo es único: como mucho hay un socio con ese correo, así que devuelve Optional<Socio>, no List<Socio>.'),
            chkError(SOCIO_REPO, 'findBy(?:E-?[Mm]ail|Mail|CorreoElectronico)\\b', 'El nombre usa el campo tal cual: Correo',
              'El campo de Socio se llama correo: el método es findByCorreo. Spring no encontraría un campo email.'),
            chkSigue(SOCIO_REPO, 'Socio'),
          ],
          xp: 10,
        },
        {
          id: 'm07-l1-c3',
          title: 'Todos los libros de una categoría (con el enum)',
          instructions: `En \`ILibroRepositorio.java\` (ya tiene \`findByIsbn\`) añade debajo:

\`List<Libro> findByCategoria(CategoriaLibro categoria);\`

Y los imports \`import java.util.List;\` e \`import com.biblioteca.models.helpers.CategoriaLibro;\`

Ojo: \`categoria\` es un enum (\`CategoriaLibro\`), así que el parámetro es **CategoriaLibro categoria**, no \`String\`. Y como hay muchos libros de una misma categoría, devuelve una **List**.`,
          files: conLibro(repoCon('Libro', [ISBN], LIBRO_IMPORTS_1)),
          activeFile: LIBRO_REPO,
          hints: [
            'Mira en Libro.java de qué tipo es el campo categoria: ese mismo tipo va en el parámetro.',
            'Puede haber muchas novelas, así que no es Optional sino List<Libro>. List y CategoriaLibro necesitan su import.',
            'Escribe: List<Libro> findByCategoria(CategoriaLibro categoria); y arriba import java.util.List; e import com.biblioteca.models.helpers.CategoriaLibro;',
          ],
          solution: { [LIBRO_REPO]: repoCon('Libro', [ISBN, CATEGORIA_M], LIBRO_IMPORTS_2) },
          checks: [
            chkImport(LIBRO_REPO, 'java.util', 'List'),
            chkImport(LIBRO_REPO, 'com.biblioteca.models.helpers', 'CategoriaLibro'),
            chkCategoria(LIBRO_REPO, 'Falta List<Libro> findByCategoria(CategoriaLibro categoria); dentro de ILibroRepositorio.'),
            chkCategoriaNoString(LIBRO_REPO),
            chkError(LIBRO_REPO, `${gen('Optional', 'Libro')}\\s+findByCategoria`, 'Devuelve una lista, no Optional',
              'Hay muchos libros de una misma categoría: devuelve una lista, List<Libro>, no Optional.'),
            chkIsbn(LIBRO_REPO, 'No borres Optional<Libro> findByIsbn(String isbn); del reto anterior.'),
            chkSigue(LIBRO_REPO, 'Libro'),
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm07-l2',
      title: 'Combinar y ordenar: And, OrderBy y Containing',
      explanation: `Al bibliotecario le puedes pedir cosas más concretas: "tráeme las **novelas** **de** García Márquez", "dame la lista de **estudiantes** **ordenada por nombre**" o "busca los libros cuyo título **contenga** la palabra *mar*". Con Spring, todo eso sigue siendo **solo el nombre del método**.

### And: dos condiciones a la vez

\`\`\`java
List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor);
\`\`\`

\`And\` ("y") une dos campos. Los **parámetros van en el mismo orden** que los campos en el nombre: primero \`categoria\` (el enum), después \`autor\` (un \`String\`). Spring los empareja por posición, no por cómo los llames.

### OrderBy...Asc: ordenar el resultado

\`\`\`java
List<Socio> findByTipoOrderByNombreAsc(TipoSocio tipo);
\`\`\`

Después de la condición pegas **OrderBy** + el campo + **Asc** (de *ascending*: de la A a la Z) o **Desc** (de la Z a la A). \`OrderBy\` va pegado a la condición, **sin And** (\`findByTipoAndOrderBy...\` está mal). Y \`tipo\` es el enum \`TipoSocio\`, así que el parámetro es \`TipoSocio tipo\`.

### Containing e IgnoreCase: buscar un trozo de texto

\`\`\`java
List<Libro> findByTituloContainingIgnoreCase(String titulo);
\`\`\`

- **Containing**: el título **contiene** ese trozo, en cualquier parte (con "mar" encuentra "El viejo y el **mar**").
- **IgnoreCase**: no importan mayúsculas ni minúsculas ("MAR", "Mar" y "mar" valen igual).

Como siempre, los nombres de los campos van **exactamente** como en la entidad: \`Titulo\` (sin tilde y en español, como el campo \`titulo\`), no \`Title\` ni \`Título\`.`,
      challenges: [
        {
          id: 'm07-l2-c1',
          title: 'Libros de una categoría y un autor',
          instructions: `En \`ILibroRepositorio.java\` añade, debajo de los métodos que ya tienes:

\`List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor);\`

Los parámetros van **en el mismo orden** que en el nombre: primero el enum \`CategoriaLibro\`, después el \`String\` del autor.`,
          files: conLibro(repoCon('Libro', [ISBN, CATEGORIA_M], LIBRO_IMPORTS_2)),
          activeFile: LIBRO_REPO,
          hints: [
            'Parte de findByCategoria y añade And + el otro campo, Autor.',
            'Ahora hay dos parámetros, separados por coma: uno para categoria (su tipo es el enum) y otro para autor.',
            'Escribe: List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor);',
          ],
          solution: { [LIBRO_REPO]: repoCon('Libro', [ISBN, CATEGORIA_M, AUTOR_M], LIBRO_IMPORTS_2) },
          checks: [
            chkAutor(LIBRO_REPO, 'Falta List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor); dentro de ILibroRepositorio.'),
            chkCategoriaNoString(LIBRO_REPO),
            chkError(LIBRO_REPO, 'findByCategoriaAndAutor\\s*\\(\\s*String\\s+\\w+\\s*,\\s*CategoriaLibro\\b', 'Los parámetros van en el orden del nombre',
              'Los parámetros van en el mismo orden que en el nombre: primero CategoriaLibro categoria y después String autor.'),
            chkError(LIBRO_REPO, `${gen('Optional', 'Libro')}\\s+findByCategoriaAndAutor`, 'Devuelve una lista, no Optional',
              'Un autor puede tener muchos libros de una categoría: devuelve List<Libro>, no Optional.'),
            chkIsbn(LIBRO_REPO, 'No borres Optional<Libro> findByIsbn(String isbn); de los retos anteriores.'),
            chkCategoria(LIBRO_REPO, 'No borres List<Libro> findByCategoria(CategoriaLibro categoria); de los retos anteriores.'),
            chkSigue(LIBRO_REPO, 'Libro'),
          ],
          xp: 10,
        },
        {
          id: 'm07-l2-c2',
          title: 'Socios de un tipo, ordenados por nombre',
          instructions: `En \`ISocioRepositorio.java\` (ya tiene \`findByCorreo\`) añade:

\`List<Socio> findByTipoOrderByNombreAsc(TipoSocio tipo);\`

Y los imports \`import java.util.List;\` e \`import com.biblioteca.models.helpers.TipoSocio;\`

\`tipo\` es el enum \`TipoSocio\` (mira \`Socio.java\`), así que el parámetro es **TipoSocio tipo**, no \`String\`.`,
          files: conSocio(repoCon('Socio', [CORREO], ['java.util.Optional'])),
          activeFile: SOCIO_REPO,
          hints: [
            'Primero la condición (findByTipo) y luego, pegado y sin And, el orden: OrderByNombreAsc.',
            'El parámetro es del tipo del campo tipo: el enum TipoSocio. List y TipoSocio necesitan su import.',
            'Escribe: List<Socio> findByTipoOrderByNombreAsc(TipoSocio tipo); y arriba import java.util.List; e import com.biblioteca.models.helpers.TipoSocio;',
          ],
          solution: { [SOCIO_REPO]: repoCon('Socio', [CORREO, TIPO_M], SOCIO_IMPORTS_2) },
          checks: [
            chkImport(SOCIO_REPO, 'java.util', 'List'),
            chkImport(SOCIO_REPO, 'com.biblioteca.models.helpers', 'TipoSocio'),
            chkTipo(SOCIO_REPO, 'Falta List<Socio> findByTipoOrderByNombreAsc(TipoSocio tipo); dentro de ISocioRepositorio.'),
            chkTipoNoString(SOCIO_REPO),
            chkError(SOCIO_REPO, 'AndOrderBy', 'OrderBy va pegado, sin And',
              'OrderBy va pegado a la condición, sin And: findByTipoOrderByNombreAsc.'),
            chkCorreo(SOCIO_REPO, 'No borres Optional<Socio> findByCorreo(String correo); del reto anterior.'),
            chkSigue(SOCIO_REPO, 'Socio'),
          ],
          xp: 10,
        },
        {
          id: 'm07-l2-c3',
          title: 'Buscar por un trozo del título',
          instructions: `En \`ILibroRepositorio.java\` añade, debajo de los otros métodos:

\`List<Libro> findByTituloContainingIgnoreCase(String titulo);\`

Así, con "mar" encontrará "El viejo y el mar" y también "MAREA ROJA". El campo se llama \`titulo\`: sin tilde y en español.`,
          files: conLibro(repoCon('Libro', [ISBN, CATEGORIA_M, AUTOR_M], LIBRO_IMPORTS_2)),
          activeFile: LIBRO_REPO,
          hints: [
            'Empieza por findByTitulo y añade las dos palabras de la lección: una para "contiene" y otra para "da igual mayúsculas".',
            'Containing = contiene; IgnoreCase = no importan las mayúsculas. Van en ese orden, pegadas al nombre del campo.',
            'Escribe: List<Libro> findByTituloContainingIgnoreCase(String titulo);',
          ],
          solution: { [LIBRO_REPO]: repoCon('Libro', [ISBN, CATEGORIA_M, AUTOR_M, TITULO_M], LIBRO_IMPORTS_2) },
          checks: [
            chkMetodo(LIBRO_REPO, metodo(gen('List', 'Libro'), 'findByTituloContainingIgnoreCase', p('String')),
              'Tiene List<Libro> findByTituloContainingIgnoreCase(String titulo)',
              'Falta List<Libro> findByTituloContainingIgnoreCase(String titulo); dentro de ILibroRepositorio.'),
            chkError(LIBRO_REPO, 'findByTitle', 'El nombre usa el campo tal cual: Titulo',
              'El campo de Libro se llama titulo: el método empieza por findByTitulo, no findByTitle.'),
            chkError(LIBRO_REPO, 'findByT[íÍ]tulo', 'Titulo va sin tilde',
              'El campo se llama titulo, sin tilde: escribe findByTitulo, sin tilde en la i.'),
            chkIsbn(LIBRO_REPO, 'No borres Optional<Libro> findByIsbn(String isbn); de los retos anteriores.'),
            chkCategoria(LIBRO_REPO, 'No borres List<Libro> findByCategoria(CategoriaLibro categoria); de los retos anteriores.'),
            chkAutor(LIBRO_REPO, 'No borres List<Libro> findByCategoriaAndAutor(CategoriaLibro categoria, String autor); del reto anterior.'),
            chkSigue(LIBRO_REPO, 'Libro'),
          ],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
