// Módulo 6: repositorios. El repositorio es el bibliotecario que guarda y trae las fichas (entidades).
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
const CHULETA = '/CHULETA.md'

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

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.biblioteca.models.helpers.CategoriaLibro;
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

  @Column(name = "nombre_autor", nullable = false, length = 100)
  private String autor;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private CategoriaLibro categoria;

  @OneToMany(mappedBy = "libro")
  @JsonManagedReference(value = "libro-prestamo")
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

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.biblioteca.models.helpers.TipoSocio;
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

  @Column(nullable = false, unique = true, length = 150)
  private String correo;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 20)
  private TipoSocio tipo;

  @OneToMany(mappedBy = "socio")
  @JsonManagedReference(value = "socio-prestamo")
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

  @Column(nullable = false)
  private LocalDate fechaPrestamo;

  @Column(nullable = false)
  private boolean devuelto;

  @JsonBackReference(value = "libro-prestamo")
  @ManyToOne
  @JoinColumn(name = "libro_id")
  private Libro libro;

  @JsonBackReference(value = "socio-prestamo")
  @ManyToOne
  @JoinColumn(name = "socio_id")
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

// Un repositorio terminado (con o sin @Repository).
const repoJava = (entidad, { anotado = true } = {}) => `package com.biblioteca.repositories;

import com.biblioteca.models.${entidad};
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
${anotado ? 'import org.springframework.stereotype.Repository;\n' : ''}
${anotado ? '@Repository\n' : ''}public interface I${entidad}Repositorio extends JpaRepository<${entidad}, UUID> {
}
`

// Comprobaciones que se repiten en cada repositorio.
const nombreDe = (path) => path.split('/').pop()

const chkPaquete = (path) => ({
  type: 'file-includes',
  path,
  pattern: `${L}package\\s+com\\.biblioteca\\.repositories(?![\\w.])\\s*;?`,
  label: 'Está en el paquete com.biblioteca.repositories',
  message: `${nombreDe(path)} debe empezar con package com.biblioteca.repositories; (igual que su carpeta).`,
})

const chkImportJpa = (path) => ({
  type: 'file-includes',
  path,
  pattern: `${L}import\\s+org\\.springframework\\.data\\.jpa\\.repository\\.(?:JpaRepository|\\*)\\s*;`,
  label: 'Importa JpaRepository',
  message: `Falta import org.springframework.data.jpa.repository.JpaRepository; en ${nombreDe(path)}.`,
})

const chkImportEntidad = (path, entidad) => ({
  type: 'file-includes',
  path,
  pattern: `${L}import\\s+com\\.biblioteca\\.models\\.(?:${entidad}|\\*)\\s*;`,
  label: `Importa la entidad ${entidad}`,
  message: `Falta import com.biblioteca.models.${entidad}; en ${nombreDe(path)}: ${entidad} vive en otro paquete.`,
})

const chkImportUUID = (path) => ({
  type: 'file-includes',
  path,
  pattern: `${L}import\\s+java\\.util\\.(?:UUID|\\*)\\s*;|JpaRepository\\s*<[^>]*java\\.util\\.UUID`,
  label: 'Importa UUID',
  message: `Falta import java.util.UUID; en ${nombreDe(path)}.`,
})

const chkExtends = (path, entidad) => ({
  type: 'file-includes',
  path,
  pattern: `${L}(?:public\\s+)?interface\\s+I${entidad}Repositorio\\s+extends\\s+JpaRepository\\s*<\\s*${entidad}\\s*,\\s*(?:java\\.util\\.)?UUID\\s*>`,
  label: `I${entidad}Repositorio hereda de JpaRepository<${entidad}, UUID>`,
  message: `La línea debe ser public interface I${entidad}Repositorio extends JpaRepository<${entidad}, UUID>.`,
})

const chkSinDatos = (path) => ({
  type: 'file-excludes',
  path,
  pattern: 'extends\\s+JpaRepository\\s*(?:\\{|$)',
  label: 'JpaRepository lleva sus dos datos entre < >',
  message: 'Escribiste JpaRepository sin los dos datos entre < >: Spring no sabría qué fichas guarda ni cómo es su id.',
})

const chkTipoId = (path, entidad) => ({
  type: 'file-excludes',
  path,
  pattern: `JpaRepository\\s*<\\s*${entidad}\\s*,\\s*(?:Long|long|Integer|int|String)\\s*>`,
  label: 'El tipo del id es el de la entidad (UUID)',
  message: `El id de ${entidad} es UUID (mira @Id en ${entidad}.java), así que el segundo dato es UUID, no Long, Integer ni String.`,
})

const chkOrden = (path) => ({
  type: 'file-excludes',
  path,
  pattern: 'JpaRepository\\s*<\\s*UUID',
  label: 'Primero la entidad, después el id',
  message: 'Va al revés: primero la entidad y después el tipo del id, por ejemplo JpaRepository<Libro, UUID>.',
})

const chkImportRepository = (path) => ({
  type: 'file-includes',
  path,
  pattern: `${L}import\\s+org\\.springframework\\.stereotype\\.(?:Repository|\\*)\\s*;`,
  label: 'Importa @Repository',
  message: `Falta import org.springframework.stereotype.Repository; en ${nombreDe(path)}.`,
})

const chkAnotado = (path, entidad) => ({
  type: 'file-includes',
  path,
  pattern: `${L}@Repository\\s+(?:(?://[^\\n]*|/\\*[\\s\\S]*?\\*/)\\s*)*(?:public\\s+)?interface\\s+I${entidad}Repositorio\\b`,
  label: `@Repository está justo encima de I${entidad}Repositorio`,
  message: `Falta @Repository en la línea de arriba de public interface I${entidad}Repositorio.`,
})

const chkEnIngles = (path) => ({
  type: 'file-excludes',
  path,
  pattern: '@Repositorio\\b',
  label: 'La anotación está en inglés: @Repository',
  message: 'La anotación se escribe en inglés: @Repository (aunque la interface se llame ...Repositorio).',
})

const PLURAL = { Libro: 'libros', Socio: 'socios', Prestamo: 'préstamos' }
const chkEntidadCorrecta = (path, entidad) => ({
  type: 'file-excludes',
  path,
  pattern: `JpaRepository\\s*<\\s*(?!${entidad}\\b)\\w+\\s*,`,
  label: `El primer dato es ${entidad}`,
  message: `I${entidad}Repositorio guarda ${PLURAL[entidad]}: el primer dato entre < > es ${entidad}. ¿Copiaste otro repositorio y olvidaste cambiarlo?`,
})

// Todo lo que debe cumplir un repositorio terminado.
const chksRepo = (path, entidad) => [
  chkPaquete(path),
  chkImportJpa(path),
  chkImportEntidad(path, entidad),
  chkImportUUID(path),
  chkImportRepository(path),
  chkAnotado(path, entidad),
  chkEnIngles(path),
  chkExtends(path, entidad),
  chkSinDatos(path),
  chkTipoId(path, entidad),
  chkOrden(path),
  chkEntidadCorrecta(path, entidad),
]

// Con varios archivos, cada label dice a qué archivo se refiere.
const enArchivo = (checks) => checks.map((k) => ({ ...k, label: `${nombreDe(k.path)}: ${k.label}` }))

const PRESTAMO_REPO_A_MEDIAS = `package com.biblioteca.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPrestamoRepositorio extends JpaRepository {
}
`

// Archivos de inicio: el pom.xml y las entidades que hacen falta en cada reto.
const conLibro = (extra = {}) => ({ '/pom.xml': POM, [LIBRO]: LIBRO_JAVA, [CATEGORIA]: CATEGORIA_JAVA, ...extra })
const conSocio = (extra = {}) => ({ '/pom.xml': POM, [SOCIO]: SOCIO_JAVA, [TIPO]: TIPO_JAVA, ...extra })
const conTodo = (extra = {}) => ({
  '/pom.xml': POM,
  [LIBRO]: LIBRO_JAVA,
  [SOCIO]: SOCIO_JAVA,
  [PRESTAMO]: PRESTAMO_JAVA,
  ...extra,
})

const LIBRO_REPO_VACIO = `package com.biblioteca.repositories;

public interface ILibroRepositorio {
}
`

const CHULETA_1 = `# Lo que puedo pedirle al bibliotecario (ILibroRepositorio)

Escribe, después de cada flecha (->), el método que lo hace:

Guardar un libro nuevo o sus cambios ->
Traer todos los libros ->
Buscar un libro por su id ->
Borrar un libro por su id ->
`

const CHULETA_1_HECHA = `# Lo que puedo pedirle al bibliotecario (ILibroRepositorio)

Escribe, después de cada flecha (->), el método que lo hace:

Guardar un libro nuevo o sus cambios -> save
Traer todos los libros -> findAll
Buscar un libro por su id -> findById
Borrar un libro por su id -> deleteById
`

const CHULETA_2 = `${CHULETA_1_HECHA}
Contar cuántos libros hay ->
Saber si existe un libro con ese id ->
findById no da el libro suelto: lo da dentro de una caja llamada ->
`

const CHULETA_2_HECHA = `${CHULETA_1_HECHA}
Contar cuántos libros hay -> count
Saber si existe un libro con ese id -> existsById
findById no da el libro suelto: lo da dentro de una caja llamada -> Optional
`

// Una línea de la chuleta con una sola respuesta (acepta save, **save**, \`save\`, save() o save(libro)).
const chkChuleta = (pregunta, metodo, message) => ({
  type: 'file-includes',
  path: CHULETA,
  pattern: `${pregunta}\\s*->[ \\t]*(?:\\*\\*)?\`?${metodo}(?:\\([^)\\n]*\\))?\`?(?:\\*\\*)?[ \\t]*(?:\\r?\\n|$)`,
  label: `${pregunta} -> ${metodo}`,
  message,
})

// Reto final: los tres repositorios con un error típico de clase cada uno.
const LIBRO_REPO_SIN_DATOS = `package com.biblioteca.repositories;

import com.biblioteca.models.Libro;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ILibroRepositorio extends JpaRepository {
}
`

const SOCIO_REPO_CON_LONG = `package com.biblioteca.repositories;

import com.biblioteca.models.Socio;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

public interface ISocioRepositorio extends JpaRepository<Socio, Long> {
}
`

const PRESTAMO_REPO_COPIADO = `package com.biblioteca.repositories;

import com.biblioteca.models.Prestamo;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IPrestamoRepositorio extends JpaRepository<Libro, UUID> {
}
`

const modulo = {
  id: 'm06',
  title: 'Repositorios',
  summary: 'Crea los repositorios de la Biblioteca con JpaRepository y @Repository, y conoce todo lo que te dan hecho: save, findAll, findById, deleteById, count y existsById.',
  lessons: [
    {
      id: 'm06-l1',
      title: 'El bibliotecario: qué es un repositorio',
      explanation: `En m03 hiciste las **fichas** (las entidades \`Libro\`, \`Socio\` y \`Prestamo\`). Pero una ficha sola no se guarda en el cajón. En una biblioteca de verdad, quien **guarda** las fichas en el archivador y quien te **trae** la que pides es el **bibliotecario**.

En Spring ese bibliotecario se llama **repositorio**: es la pieza que guarda las entidades en la base de datos y las trae de vuelta.

Lo mejor: **no tienes que programar al bibliotecario**. Solo escribes una **interface** (ya sabes qué es) que dice "quiero un bibliotecario para los libros", y Spring, al arrancar la aplicación, **fabrica solo la clase** que hace el trabajo. Por eso es una \`interface\` y no una \`class\`: tú describes *qué* quieres; Spring pone el *cómo*.

### Dónde y cómo se llama

- Carpeta: \`/src/main/java/com/biblioteca/repositories/\`, paquete \`com.biblioteca.repositories\`.
- Nombre: una **I** delante (de *interface*), el nombre de la entidad y **Repositorio**, como en clase con \`IUsuarioRepositorio\`. Para los libros: \`ILibroRepositorio\`.

### JpaRepository y sus dos datos

Para que la interface sea un repositorio, **hereda** (\`extends\`) de \`JpaRepository\`, que viene en el *starter* \`spring-boot-starter-data-jpa\` del \`pom.xml\`. Entre \`< >\` le das **dos datos**, y los dos son obligatorios:

\`\`\`java
public interface ILibroRepositorio extends JpaRepository<Libro, UUID> {
}
\`\`\`

1. **Qué fichas guarda**: la entidad, \`Libro\`.
2. **Cómo es el número de la ficha**: el tipo del campo con \`@Id\`. En \`Libro.java\` el id es \`private UUID id;\`, así que va \`UUID\`.

Es como decirle al bibliotecario "tú te encargas de **libros**, y cada libro se identifica con un **código UUID**". Si escribes \`extends JpaRepository\` a secas (sin \`< >\`), el bibliotecario no sabe qué fichas guarda; y si pones \`Long\` cuando el id es \`UUID\`, buscaría con un número que no existe en las fichas.

Como \`JpaRepository\`, \`Libro\` y \`UUID\` viven en otros paquetes, hacen falta sus \`import\`:

\`\`\`java
import com.biblioteca.models.Libro;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;
\`\`\``,
      challenges: [
        {
          id: 'm06-l1-c1',
          title: 'Crea la interface ILibroRepositorio',
          instructions: `Crea el archivo \`/src/main/java/com/biblioteca/repositories/ILibroRepositorio.java\` (la carpeta \`repositories\` se crea sola) con:

1. Primera línea: \`package com.biblioteca.repositories;\`
2. Una **interface** vacía llamada **ILibroRepositorio**: \`public interface ILibroRepositorio { }\`

Ojo: es \`interface\`, no \`class\`. En el siguiente reto le diremos qué fichas guarda.`,
          files: conLibro(),
          activeFile: LIBRO,
          hints: [
            'Pulsa "Nuevo archivo" y escribe la ruta completa: src/main/java/com/biblioteca/repositories/ILibroRepositorio.java',
            'La carpeta es repositories, así que el paquete es com.biblioteca.repositories.',
            'Contenido: package com.biblioteca.repositories; y debajo public interface ILibroRepositorio { }',
          ],
          solution: { [LIBRO_REPO]: LIBRO_REPO_VACIO },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/main/java/com/biblioteca/repositories/ILibroRepositorio\\.java$',
              label: 'Existe repositories/ILibroRepositorio.java',
              message: 'No encuentro /src/main/java/com/biblioteca/repositories/ILibroRepositorio.java. Revisa la ruta y las mayúsculas (I y L mayúsculas).',
            },
            chkPaquete(LIBRO_REPO),
            {
              type: 'file-includes',
              path: LIBRO_REPO,
              pattern: `${L}(?:public\\s+)?interface\\s+ILibroRepositorio\\b`,
              label: 'Es la interface ILibroRepositorio',
              message: 'Falta public interface ILibroRepositorio en el archivo (es una interface).',
            },
            {
              type: 'file-excludes',
              path: LIBRO_REPO,
              pattern: 'class\\s+ILibroRepositorio\\b',
              label: 'Es una interface, no una class',
              message: 'ILibroRepositorio es una interface, no una class: Spring fabrica la clase por ti.',
            },
          ],
          xp: 10,
        },
        {
          id: 'm06-l1-c2',
          title: 'Hereda de JpaRepository<Libro, UUID>',
          instructions: `Abre \`ILibroRepositorio.java\` y conviértelo en un repositorio de libros:

1. Debajo del \`package\`, añade los tres imports:
   - \`import com.biblioteca.models.Libro;\`
   - \`import java.util.UUID;\`
   - \`import org.springframework.data.jpa.repository.JpaRepository;\`
2. Haz que la interface herede de **JpaRepository<Libro, UUID>**:
   \`public interface ILibroRepositorio extends JpaRepository<Libro, UUID> { }\`

Mira \`Libro.java\`: el campo con \`@Id\` es \`UUID\`. Por eso el segundo dato es \`UUID\`.`,
          files: conLibro({ [LIBRO_REPO]: LIBRO_REPO_VACIO }),
          activeFile: LIBRO_REPO,
          hints: [
            'JpaRepository necesita dos datos entre < >: qué entidad guarda y de qué tipo es su id.',
            'La entidad es Libro y su id (el campo con @Id en Libro.java) es UUID. No olvides los tres import.',
            'La línea queda: public interface ILibroRepositorio extends JpaRepository<Libro, UUID> {',
          ],
          solution: { [LIBRO_REPO]: repoJava('Libro', { anotado: false }) },
          checks: [
            chkImportJpa(LIBRO_REPO),
            chkImportEntidad(LIBRO_REPO, 'Libro'),
            chkImportUUID(LIBRO_REPO),
            chkExtends(LIBRO_REPO, 'Libro'),
            chkSinDatos(LIBRO_REPO),
            chkTipoId(LIBRO_REPO, 'Libro'),
            chkOrden(LIBRO_REPO),
          ],
          xp: 10,
        },
      ],
    },
    {
      id: 'm06-l2',
      title: '@Repository y un bibliotecario para cada ficha',
      explanation: `En la biblioteca, el bibliotecario lleva una **placa** que dice "Bibliotecario": así todos saben quién guarda y trae las fichas. En Spring esa placa es la anotación **@Repository**, que va justo encima de la interface:

\`\`\`java
import org.springframework.stereotype.Repository;

@Repository
public interface ILibroRepositorio extends JpaRepository<Libro, UUID> {
}
\`\`\`

Te lo decimos claro: en una interface que hereda de \`JpaRepository\`, **@Repository es opcional**. Spring ya reconoce al bibliotecario por lo que hereda (\`extends JpaRepository\`) y él solo ya traduce los errores de la base de datos a errores de Spring. Funciona igual con placa o sin ella.

¿Entonces por qué la ponemos?

- **Deja claro su trabajo**: cualquiera que abra el archivo ve de un vistazo que esta pieza habla con la base de datos.
- **Es la convención de clase**: en el proyecto de clase todos los repositorios la llevan, y aquí hacemos lo mismo.

Fíjate: la anotación está **en inglés**, \`@Repository\`, aunque nuestra interface se llame \`...Repositorio\`.

### Un bibliotecario por cada tipo de ficha

Cada entidad tiene **su propio** repositorio: uno para \`Libro\`, otro para \`Socio\` y otro para \`Prestamo\`. Son casi iguales; solo cambia el **nombre** y el **primer dato** entre \`< >\`:

| Entidad | Repositorio | Hereda de |
|---------|-------------|-----------|
| \`Libro\` | \`ILibroRepositorio\` | \`JpaRepository<Libro, UUID>\` |
| \`Socio\` | \`ISocioRepositorio\` | \`JpaRepository<Socio, UUID>\` |
| \`Prestamo\` | \`IPrestamoRepositorio\` | \`JpaRepository<Prestamo, UUID>\` |

Un error muy común al copiar y pegar es dejar \`JpaRepository<Libro, UUID>\` dentro de \`ISocioRepositorio\`: tendrías dos bibliotecarios de libros y ninguno de socios. Otro error de clase es dejar el repositorio **a medio hacer**, con \`extends JpaRepository\` sin los dos datos.`,
      challenges: [
        {
          id: 'm06-l2-c1',
          title: 'Ponle la placa @Repository',
          instructions: `En \`ILibroRepositorio.java\`:

1. Añade el import \`import org.springframework.stereotype.Repository;\` junto a los otros.
2. Escribe **@Repository** en la línea justo encima de \`public interface ILibroRepositorio\`.`,
          files: conLibro({ [LIBRO_REPO]: repoJava('Libro', { anotado: false }) }),
          activeFile: LIBRO_REPO,
          hints: [
            'Una anotación va encima de lo que marca, igual que @Entity va encima de la clase Libro.',
            'Necesitas dos cosas: el import de org.springframework.stereotype.Repository y la anotación.',
            'Deja las dos líneas así: @Repository y debajo public interface ILibroRepositorio extends JpaRepository<Libro, UUID> {',
          ],
          solution: { [LIBRO_REPO]: repoJava('Libro') },
          checks: chksRepo(LIBRO_REPO, 'Libro'),
          xp: 10,
        },
        {
          id: 'm06-l2-c2',
          title: 'Crea ISocioRepositorio',
          instructions: `Crea el archivo \`/src/main/java/com/biblioteca/repositories/ISocioRepositorio.java\`: el bibliotecario de los socios. Debe tener:

1. \`package com.biblioteca.repositories;\`
2. Los imports de \`com.biblioteca.models.Socio\`, \`java.util.UUID\`, \`org.springframework.data.jpa.repository.JpaRepository\` y \`org.springframework.stereotype.Repository\`.
3. **@Repository** encima de \`public interface ISocioRepositorio extends JpaRepository<Socio, UUID> { }\`

Mira \`Socio.java\` para comprobar de qué tipo es su id.`,
          files: conSocio({ [LIBRO]: LIBRO_JAVA, [CATEGORIA]: CATEGORIA_JAVA, [LIBRO_REPO]: repoJava('Libro') }),
          activeFile: LIBRO_REPO,
          hints: [
            'Es igual que ILibroRepositorio.java (está abierto): puedes copiarlo como modelo.',
            'Cambia Libro por Socio en tres sitios: el import, el nombre de la interface y el primer dato entre < >.',
            'La línea clave: @Repository y debajo public interface ISocioRepositorio extends JpaRepository<Socio, UUID> {',
          ],
          solution: { [SOCIO_REPO]: repoJava('Socio') },
          checks: [
            {
              type: 'file-exists',
              pattern: '^/src/main/java/com/biblioteca/repositories/ISocioRepositorio\\.java$',
              label: 'Existe repositories/ISocioRepositorio.java',
              message: 'No encuentro /src/main/java/com/biblioteca/repositories/ISocioRepositorio.java. Revisa la ruta y las mayúsculas.',
            },
            ...chksRepo(SOCIO_REPO, 'Socio'),
          ],
          xp: 10,
        },
        {
          id: 'm06-l2-c3',
          title: 'Termina IPrestamoRepositorio, que quedó a medio hacer',
          instructions: `Alguien empezó \`IPrestamoRepositorio.java\` y lo dejó a medias: escribió \`extends JpaRepository\` **sin los dos datos** y le faltan imports. Termínalo:

1. Añade \`import com.biblioteca.models.Prestamo;\` y \`import java.util.UUID;\`
2. Cambia \`extends JpaRepository\` por **extends JpaRepository<Prestamo, UUID>**.
3. Deja \`@Repository\` donde está.`,
          files: conTodo({ [PRESTAMO_REPO]: PRESTAMO_REPO_A_MEDIAS }),
          activeFile: PRESTAMO_REPO,
          hints: [
            'JpaRepository sin < > no sabe qué fichas guarda: le faltan la entidad y el tipo de su id.',
            'La entidad es Prestamo y su id (mira @Id en Prestamo.java) es UUID. Cada uno necesita su import.',
            'La línea queda: public interface IPrestamoRepositorio extends JpaRepository<Prestamo, UUID> {',
          ],
          solution: { [PRESTAMO_REPO]: repoJava('Prestamo') },
          checks: chksRepo(PRESTAMO_REPO, 'Prestamo'),
          xp: 10,
        },
      ],
    },
    {
      id: 'm06-l3',
      title: 'Lo que el bibliotecario ya sabe hacer',
      explanation: `Cuando contratas a un bibliotecario con experiencia, no tienes que enseñarle a guardar ni a buscar fichas: **ya sabe**. Con \`JpaRepository\` pasa lo mismo: tu interface está vacía por dentro, pero al heredar de \`JpaRepository<Libro, UUID>\` ya trae un montón de métodos **hechos y gratis**.

Todavía no los vas a usar (eso llega más adelante, cuando otra pieza de la aplicación hable con el bibliotecario). Por ahora, esto es **lo que podrás pedirle**:

| Lo que le pides | Método | Qué te devuelve |
|-----------------|--------|-----------------|
| "Guarda este libro" (nuevo o con cambios) | \`save(libro)\` | el libro guardado; si era nuevo, ya con su id |
| "Tráeme todos los libros" | \`findAll()\` | una \`List<Libro>\` |
| "Tráeme el libro con este id" | \`findById(id)\` | un \`Optional<Libro>\` |
| "Borra el libro con este id" | \`deleteById(id)\` | nada |
| "¿Cuántos libros hay?" | \`count()\` | un número \`long\` |
| "¿Existe un libro con este id?" | \`existsById(id)\` | \`true\` o \`false\` |

Fíjate en dos detalles:

- **El id es del tipo que pusiste en el segundo dato** (\`UUID\`). Por eso ese dato tiene que coincidir con el \`@Id\` de la entidad: \`findById\` y \`deleteById\` reciben un \`UUID\`.
- **findById devuelve una caja: \`Optional\`.** Pides el libro con un código y el bibliotecario vuelve con una caja: puede traer el libro dentro o venir **vacía** si ese código no existe. Así nunca te devuelve "nada" a secas, y te obliga a pensar qué hacer si no está.

Ojo con los nombres: es \`existsById\`, **con s** (*exists*, "existe"). \`existById\` sin la s no existe.

Y lo mismo sirve para \`ISocioRepositorio\` e \`IPrestamoRepositorio\`: cada bibliotecario sabe hacer todo esto con sus propias fichas.`,
      challenges: [
        {
          id: 'm06-l3-c1',
          title: 'La chuleta del bibliotecario',
          instructions: `Abre \`CHULETA.md\` (en la raíz: \`/CHULETA.md\`). Después de cada flecha \`->\` escribe el **nombre del método** que lo hace (mira la tabla de la pestaña **Lección**):

1. Guardar un libro nuevo o sus cambios -> **save**
2. Traer todos los libros -> **findAll**
3. Buscar un libro por su id -> **findById**
4. Borrar un libro por su id -> **deleteById**

No cambies el texto de las preguntas.`,
          files: conLibro({ [LIBRO_REPO]: repoJava('Libro'), [CHULETA]: CHULETA_1 }),
          activeFile: CHULETA,
          hints: [
            'Todos estos métodos vienen gratis con JpaRepository: no tienes que escribirlos en ILibroRepositorio.',
            'Guardar es save y traer todos es findAll. Para buscar y borrar por id, el nombre termina en ById.',
            'Las respuestas, en orden: save, findAll, findById, deleteById (cada una después de su flecha).',
          ],
          solution: { [CHULETA]: CHULETA_1_HECHA },
          checks: [
            chkChuleta('Guardar un libro nuevo o sus cambios', 'save', 'Para guardar un libro (nuevo o con cambios) el método es save.'),
            chkChuleta('Traer todos los libros', 'findAll', 'Para traer todos los libros el método es findAll.'),
            chkChuleta('Buscar un libro por su id', 'findById', 'Para buscar un libro por su id el método es findById.'),
            chkChuleta('Borrar un libro por su id', 'deleteById', 'Para borrar un libro por su id el método es deleteById (con ById al final).'),
          ],
          xp: 10,
        },
        {
          id: 'm06-l3-c2',
          title: 'Contar, preguntar si existe y la caja Optional',
          instructions: `Sigue en \`CHULETA.md\`. Hay tres líneas nuevas al final; completa después de cada flecha:

1. Contar cuántos libros hay -> **count**
2. Saber si existe un libro con ese id -> **existsById** (con **s**)
3. findById no da el libro suelto: lo da dentro de una caja llamada -> **Optional**`,
          files: conLibro({ [LIBRO_REPO]: repoJava('Libro'), [CHULETA]: CHULETA_2 }),
          activeFile: CHULETA,
          hints: [
            'Repasa la tabla y los dos detalles del final de la pestaña Lección.',
            'Contar es count. Para preguntar si existe, piensa en inglés: exists ("existe") + ById.',
            'Las respuestas, en orden: count, existsById y Optional.',
          ],
          solution: { [CHULETA]: CHULETA_2_HECHA },
          checks: [
            chkChuleta('Contar cuántos libros hay', 'count', 'Para contar cuántos libros hay el método es count.'),
            chkChuleta('Saber si existe un libro con ese id', 'existsById', 'Para saber si existe un libro con ese id el método es existsById.'),
            {
              type: 'file-excludes',
              path: CHULETA,
              pattern: 'existById',
              label: 'existsById va con s',
              message: 'Es existsById, con s (exists = "existe"). existById sin la s no existe en JpaRepository.',
            },
            chkChuleta(
              'findById no da el libro suelto: lo da dentro de una caja llamada',
              'Optional',
              'findById devuelve una caja llamada Optional (con O mayúscula), que puede venir con el libro o vacía.',
            ),
          ],
          xp: 10,
        },
        {
          id: 'm06-l3-c3',
          title: 'Revisa los tres bibliotecarios',
          instructions: `Reto final del módulo. Los tres repositorios de la Biblioteca tienen **un error típico cada uno**. Arréglalos para que los tres queden así: \`@Repository\` encima, sus imports y \`extends JpaRepository<Entidad, UUID>\`.

1. \`ILibroRepositorio.java\`: tiene \`extends JpaRepository\` sin los dos datos. Debe ser **JpaRepository<Libro, UUID>**.
2. \`ISocioRepositorio.java\`: el id está como \`Long\` y le falta la placa. Debe ser **JpaRepository<Socio, UUID>** con **@Repository** encima.
3. \`IPrestamoRepositorio.java\`: se copió de otro y guarda la entidad equivocada. Debe ser **JpaRepository<Prestamo, UUID>**.`,
          files: conTodo({
            [LIBRO_REPO]: LIBRO_REPO_SIN_DATOS,
            [SOCIO_REPO]: SOCIO_REPO_CON_LONG,
            [PRESTAMO_REPO]: PRESTAMO_REPO_COPIADO,
          }),
          activeFile: LIBRO_REPO,
          hints: [
            'Revisa los tres archivos de la carpeta repositories, uno por uno. Los mensajes de Comprobar te dicen cuál falla.',
            'Cada repositorio: primer dato = su propia entidad; segundo dato = el tipo de @Id, que en las tres entidades es UUID.',
            'Quedan: JpaRepository<Libro, UUID>, JpaRepository<Socio, UUID> (y @Repository encima de ISocioRepositorio) y JpaRepository<Prestamo, UUID>.',
          ],
          solution: {
            [LIBRO_REPO]: repoJava('Libro'),
            [SOCIO_REPO]: repoJava('Socio'),
            [PRESTAMO_REPO]: repoJava('Prestamo'),
          },
          checks: [
            ...enArchivo(chksRepo(LIBRO_REPO, 'Libro')),
            ...enArchivo(chksRepo(SOCIO_REPO, 'Socio')),
            ...enArchivo(chksRepo(PRESTAMO_REPO, 'Prestamo')),
          ],
          xp: 10,
        },
      ],
    },
  ],
}

export default modulo
