# Temario del curso de Spring Boot

Curso interactivo para aprender a crear la parte de servidor (el "backend") de una aplicación con
**Spring Boot** y **Maven**. El alumno ya sabe programación orientada a objetos en Java (clases,
getters y setters, constructores, enums, interfaces): aquí no se enseña eso otra vez.

El curso está en modo **solo código**: no se ejecuta nada ni hay vista previa. "Comprobar" lee el
texto de los archivos, como un profesor que revisa los deberes en papel.

Todo el curso construye el mismo proyecto: **Biblioteca** (paquete `com.biblioteca`).

## Módulos

| Módulo | Título | Qué se aprende |
|--------|--------|----------------|
| m00 | Bienvenida | Usar la plataforma: pestañas Reto y Lección, abrir archivos en las pestañas (rutas largas como `/src/main/java/com/biblioteca/...`), crear archivos nuevos, que "Comprobar" lee tu código (no lo ejecuta), las pistas, "Ver solución" y "Reiniciar reto". |
| m01 | Maven y el proyecto | `pom.xml`; `groupId`, `artifactId` y `version`; los *starters* como dependencias; la estructura de carpetas (`src/main/java`, `src/main/resources`, `src/test/java`); la clase principal con `@SpringBootApplication`; el *wrapper* `mvnw`. |
| m02 | Configuración | `application.properties`; base de datos H2 y su consola (`spring.h2.console.enabled`, `/h2-console`); `server.port`; `spring.jpa.show-sql`; `spring.jpa.hibernate.ddl-auto`. |
| m03 | Entidades | `@Entity`, `@Table`, `@Id`, `@GeneratedValue` (también con UUID), `@Column` (`nullable`, `unique`, `length`); el constructor vacío obligatorio. |
| m04 | Enums en entidades | `@Enumerated(EnumType.STRING)`; el paquete `helpers` para los enums. |
| m05 | Relaciones | `@ManyToOne`, `@JoinColumn`, `@OneToMany(mappedBy = ...)`, `@JsonManagedReference` / `@JsonBackReference`. |
| m06 | Repositorios | `JpaRepository<T, ID>`, `@Repository`; los métodos heredados `save`, `findAll`, `findById`, `deleteById`. |
| m07 | Consultas por nombre | `findBy...`, `And`, `OrderBy...Asc`, `existsBy...`, `Optional`; tipos de parámetro correctos (un enum, no un `String`). Extra: `@Query`. |

Más adelante (todavía no):

- m08 Servicios
- m09 Controladores REST
- m10 Validaciones y errores
- m11 Proyecto final Biblioteca (libros, socios y préstamos)

## El proyecto Biblioteca

| Entidad | Campos |
|---------|--------|
| `Libro` | `titulo`, `isbn` (único), `autor`, `categoria` (enum) |
| `Socio` | `nombre`, `correo` (único), `tipo` (enum) |
| `Prestamo` | `fechaPrestamo`, `devuelto`, `@ManyToOne` a `Libro` y `@ManyToOne` a `Socio` |

Spring Boot 3 (la misma forma vale para Spring Boot 4): las anotaciones de JPA se importan de
`jakarta.persistence` (nunca de `javax.persistence`).

## Convenciones para autores

Antes de escribir un módulo lee también `docs/autoria-modulos.md` (formato de los archivos, tipos
de comprobación, cómo probar).

### Nombres y rutas

- Paquete base: `com.biblioteca`. Clase principal: `com.biblioteca.BibliotecaApplication`.
- Rutas (siempre desde la raíz, empezando por `/`):
  - `/pom.xml`
  - `/src/main/java/com/biblioteca/BibliotecaApplication.java`
  - `/src/main/resources/application.properties`
  - Entidades: `/src/main/java/com/biblioteca/models/Libro.java`, `Socio.java`, `Prestamo.java`
  - Enums: `/src/main/java/com/biblioteca/helpers/` (por ejemplo `CategoriaLibro.java`, `TipoSocio.java`)
  - Repositorios: `/src/main/java/com/biblioteca/repositories/` (por ejemplo `LibroRepository.java`)
  - Pruebas: `/src/test/java/com/biblioteca/`
- Entidades y campos: exactamente los de la tabla de arriba (`Libro`, `Socio`, `Prestamo`;
  `titulo`, `isbn`, `autor`, `categoria`, `nombre`, `correo`, `tipo`, `fechaPrestamo`, `devuelto`).
- Java 17. El proyecto hereda de `spring-boot-starter-parent`.

### `pom.xml` base

Todos los retos que muestren `/pom.xml` usan **exactamente este texto** (un test compara el de m00
con este bloque). Si un reto pide añadir algo, se parte de este texto.

```xml
<?xml version="1.0" encoding="UTF-8"?>
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
```

(m10 añadirá `spring-boot-starter-validation` cuando llegue el momento.)

### Cómo escribir las comprobaciones (checks)

- **Expresiones regulares tolerantes** (escritas como texto JS, por eso las barras van dobles). Acepta espacios y saltos de línea de más (`\\s*`, `\\s+`),
  el punto y coma opcional cuando no importa (`;?`) y comillas simples o dobles donde Java/XML lo
  permitan. Ejemplo: `'private\\s+String\\s+titulo\\s*;?'`, no `'private String titulo;'`.
- **Un `message` en cada check** de archivos, en español sencillo, diciendo qué falta y dónde
  ("Falta la anotación @Entity encima de la clase Libro.").
- **`file-excludes` para los errores típicos.** Por ejemplo, si el campo debe ser un enum:
  `{ type: 'file-excludes', path: LIBRO, pattern: 'String\\s+categoria', message: 'categoria debe ser del tipo enum CategoriaLibro, no String.' }`.
  Igual con `String rol`/`String tipo` donde se espera un enum, o `javax.persistence` donde va
  `jakarta.persistence`.
- **Nunca exijas un nombre que no esté en las instrucciones.** Si el check busca `LibroRepository`,
  `findByAutor` o `CategoriaLibro`, las instrucciones lo dicen tal cual.
- **Ningún concepto antes de su módulo.** Por ejemplo, nada de `@Entity` antes de m03 ni de
  `JpaRepository` antes de m06 (ni en los archivos de inicio, ni en las soluciones, ni en los checks).
  Única excepción: el esqueleto del proyecto (el `pom.xml` base y `BibliotecaApplication.java`) puede
  verse desde m00 como archivo de inicio, pero antes de m01 ningún reto pide entenderlo ni cambiar su
  código (en m00, como mucho, un comentario).
- La solución de cada reto debe pasar sus propios checks (`npm test` lo comprueba).
