import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm03')
const retos = () => modulo.lessons.flatMap((l) => l.challenges)
const reto = (id) => retos().find((c) => c.id === id)

const LIBRO = '/src/main/java/com/biblioteca/models/Libro.java'
const SOCIO = '/src/main/java/com/biblioteca/models/Socio.java'

// ¿Pasa este check con estos archivos? (solo los de archivos; manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}

const conSolucion = (c) => ({ ...c.files, ...c.solution })
const fallan = (c, files) => c.checks.filter((k) => !pasa(k, files))
// Cambia un archivo de la solución y devuelve los archivos resultantes.
const solucionCon = (c, path, cambio) => {
  const files = conSolucion(c)
  return { ...files, [path]: cambio(files[path]) }
}

// Libro escrito "a su manera": todo junto, sin espacios, atributos en otro orden, import con *.
const LIBRO_COMPACTO = `package com.biblioteca.models;
import java.util.*;
import jakarta.persistence.*;
@Entity @Table(name="libros")
public class Libro {
  @Id @GeneratedValue(strategy=GenerationType.UUID) private UUID id;
  @Column(length=150,nullable=false)
  private String titulo;
  @Column(length=20, unique=true,nullable=false) private String isbn;
  @Column(length = 100,nullable = false,name="nombre_autor")
  private String autor;
  protected Libro(){}
  public Libro(String titulo, String isbn, String autor) { this.titulo = titulo; this.isbn = isbn; this.autor = autor; }
  public UUID getId() { return id; }
  public String getTitulo() { return titulo; }
  public void setTitulo(String titulo) { this.titulo = titulo; }
  public String getIsbn() { return isbn; }
  public void setIsbn(String isbn) { this.isbn = isbn; }
  public String getAutor() { return autor; }
  public void setAutor(String autor) { this.autor = autor; }
}
`

describe('módulo m03 Entidades', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Entidades')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución, activeFile, xp 10 y checks con label y message', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(200)
      l.challenges.forEach((c) => {
        expect(c.title, c.id).toBeTruthy()
        expect(c.instructions.length, c.id).toBeGreaterThan(40)
        expect(c.hints, c.id).toHaveLength(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files[c.activeFile], c.id).toBeDefined()
        expect(c.xp, c.id).toBe(10)
        expect(Object.keys(c.files).length, `${c.id}: varios archivos visibles`).toBeGreaterThan(1)
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('la solución de cada reto pasa todos sus checks', () => {
    retos().forEach((c) => expect(fallan(c, conSolucion(c)).map((k) => k.label), c.id).toEqual([]))
  })

  it('ningún reto viene resuelto de inicio: los archivos iniciales fallan algún check', () => {
    retos().forEach((c) => expect(fallan(c, c.files).length, c.id).toBeGreaterThan(0))
  })

  it('todo /pom.xml es el pom.xml base de docs/temario.md', () => {
    const doc = readFileSync('docs/temario.md', 'utf8')
    const base = doc.match(/```xml\n([\s\S]*?)```/)[1]
    retos().forEach((c) => {
      expect(c.files['/pom.xml'], c.id).toBe(base)
      if (c.solution['/pom.xml'] !== undefined) expect(c.solution['/pom.xml'], c.id).toBe(base)
    })
  })

  it('no usa conceptos de módulos posteriores (enums, relaciones, repositorios)', () => {
    const todo = JSON.stringify(modulo.lessons.map((l) => [l.explanation, l.challenges.map((c) => [c.instructions, c.hints, c.files, c.solution, c.checks])]))
    expect(todo).not.toMatch(/@Enumerated|EnumType|\benum\b|helpers|@ManyToOne|@OneToMany|@JoinColumn|mappedBy|@Json|JpaRepository|@Repository|Repositorio|findBy|existsBy|@Query/)
  })

  it('las soluciones usan jakarta.persistence, nunca javax.persistence', () => {
    retos().forEach((c) => Object.values(c.solution).forEach((t) => expect(t, c.id).not.toMatch(/javax\.persistence/)))
  })

  it('los checks toleran otra forma de escribir Libro (espacios, orden de atributos, import con *, protected)', () => {
    retos()
      .filter((c) => LIBRO in c.solution)
      .forEach((c) => expect(fallan(c, { ...c.files, [LIBRO]: LIBRO_COMPACTO }).map((k) => k.label), c.id).toEqual([]))
  })

  describe('lección 1: @Entity, @Id, @GeneratedValue y @Table', () => {
    it('tiene 3 retos', () => {
      expect(modulo.lessons[0].id).toBe('m03-l1')
      expect(modulo.lessons[0].challenges.map((c) => c.id)).toEqual(['m03-l1-c1', 'm03-l1-c2', 'm03-l1-c3'])
    })

    it('un @Entity dentro de un comentario no cuenta', () => {
      const c = reto('m03-l1-c1')
      const files = solucionCon(c, LIBRO, (t) => t.replace(/\n@Entity\b/, '\n// @Entity'))
      expect(fallan(c, files).map((k) => k.label)).toContain('Libro tiene @Entity encima de la clase')
    })

    it('detecta la clase sin @Entity y el import de javax.persistence', () => {
      const c = reto('m03-l1-c1')
      const sinEntity = solucionCon(c, LIBRO, (t) => t.replace(/\n@Entity\b/, ''))
      expect(fallan(c, sinEntity).map((k) => k.message)).toContain('Falta la anotación @Entity encima de public class Libro: sin ella, Libro es una clase normal y no se guarda en ninguna tabla.')
      const javax = solucionCon(c, LIBRO, (t) => t.replaceAll('jakarta.persistence', 'javax.persistence'))
      expect(fallan(c, javax).map((k) => k.label)).toContain('No usa javax.persistence')
    })

    it('@Id tiene que ir sobre el atributo id', () => {
      const c = reto('m03-l1-c1')
      const files = solucionCon(c, LIBRO, (t) => t.replace(/ {2}@Id\n/, '').replace('private String titulo;', '@Id\n  private String titulo;'))
      expect(fallan(c, files).map((k) => k.label)).toContain('@Id está encima de private UUID id')
    })

    it('Libro usa id UUID: el inicial ya trae private UUID id e import java.util.UUID', () => {
      const c = reto('m03-l1-c1')
      expect(c.files[LIBRO]).toMatch(/import java\.util\.UUID;[\s\S]*private UUID id;/)
      expect(c.files[LIBRO]).toMatch(/public UUID getId\(\)/)
    })

    it('@GeneratedValue exige la estrategia UUID; IDENTITY o Long fallan', () => {
      const c = reto('m03-l1-c2')
      const auto = solucionCon(c, LIBRO, (t) => t.replace('GenerationType.UUID', 'GenerationType.AUTO'))
      expect(fallan(c, auto).map((k) => k.label)).toEqual(['@GeneratedValue(strategy = GenerationType.UUID) sobre el id'])
      const identity = solucionCon(c, LIBRO, (t) => t.replace('GenerationType.UUID', 'GenerationType.IDENTITY'))
      expect(fallan(c, identity).map((k) => k.message)).toContain('IDENTITY cuenta 1, 2, 3 y sirve para un id Long. Aquí el id es UUID: usa GenerationType.UUID.')
      const largo = solucionCon(c, LIBRO, (t) => t.replace('private UUID id;', 'private Long id;'))
      expect(fallan(c, largo).map((k) => k.label)).toContain('@Id está encima de private UUID id')
    })

    it('@Table pide exactamente el nombre "libros"', () => {
      const c = reto('m03-l1-c3')
      const files = solucionCon(c, LIBRO, (t) => t.replace('name = "libros"', 'name = "libro"'))
      expect(fallan(c, files).length).toBeGreaterThan(0)
    })
  })

  describe('lección 2: @Column y el constructor vacío', () => {
    it('tiene 3 retos', () => {
      expect(modulo.lessons[1].id).toBe('m03-l2')
      expect(modulo.lessons[1].challenges.map((c) => c.id)).toEqual(['m03-l2-c1', 'm03-l2-c2', 'm03-l2-c3'])
    })

    it('isbn tiene que ser único, obligatorio y de 20; titulo obligatorio y de 150', () => {
      const c = reto('m03-l2-c1')
      const sinUnique = solucionCon(c, LIBRO, (t) => t.replace('unique = true, ', ''))
      expect(fallan(c, sinUnique).map((k) => k.label)).toEqual(['isbn es único (unique = true)'])
      const largoMal = solucionCon(c, LIBRO, (t) => t.replace('length = 150', 'length = 15'))
      expect(fallan(c, largoMal).map((k) => k.label)).toEqual(['titulo tiene length = 150'])
    })

    it('detecta unique = true puesto en titulo en vez de en isbn', () => {
      const c = reto('m03-l2-c1')
      const files = solucionCon(c, LIBRO, (t) => t.replace('@Column(nullable = false, length = 150)', '@Column(nullable = false, unique = true, length = 150)'))
      expect(fallan(c, files).map((k) => k.message)).toContain('unique = true va en isbn, no en titulo: dos libros distintos sí pueden llamarse igual.')
    })

    it('un @Column dentro de un comentario no cuenta', () => {
      const c = reto('m03-l2-c1')
      const files = solucionCon(c, LIBRO, (t) => t.replace('  @Column(nullable = false, unique = true, length = 20)', '  // @Column(nullable = false, unique = true, length = 20)'))
      expect(fallan(c, files).length).toBeGreaterThan(0)
    })

    it('autor necesita name = "nombre_autor"', () => {
      const c = reto('m03-l2-c2')
      const files = solucionCon(c, LIBRO, (t) => t.replace('name = "nombre_autor"', 'name = "autor"'))
      expect(fallan(c, files).map((k) => k.label)).toEqual(['La columna de autor se llama "nombre_autor"'])
    })

    it('el constructor vacío: el inicial no lo tiene y "public void Libro()" no sirve', () => {
      const c = reto('m03-l2-c3')
      expect(c.files[LIBRO]).toMatch(/public Libro\(String titulo/)
      const conVoid = solucionCon(c, LIBRO, (t) => t.replace('public Libro() {', 'public void Libro() {'))
      expect(fallan(c, conVoid).map((k) => k.label)).toEqual(['Libro tiene un constructor vacío'])
      const sinParams = solucionCon(c, LIBRO, (t) => t.replace(/ {2}public Libro\(String[\s\S]*?\n {2}\}\n\n/, ''))
      expect(fallan(c, sinParams).map((k) => k.label)).toEqual(['El constructor con titulo, isbn y autor sigue ahí'])
    })
  })

  describe('lección 3: Socio con UUID y los errores típicos', () => {
    it('tiene 2 retos y el módulo suma 8', () => {
      expect(modulo.lessons.map((l) => l.id)).toEqual(['m03-l1', 'm03-l2', 'm03-l3'])
      expect(modulo.lessons[2].challenges.map((c) => c.id)).toEqual(['m03-l3-c1', 'm03-l3-c2'])
      expect(retos()).toHaveLength(8)
    })

    it('el Libro con errores falla justo por los tres errores de clase', () => {
      const c = reto('m03-l3-c1')
      expect(fallan(c, c.files).map((k) => k.label)).toEqual([
        'Importa Entity de jakarta.persistence',
        'Libro tiene @Entity encima de la clase',
        'No usa javax.persistence',
        'El atributo se llama titulo, como en el getter',
        'Ya no queda titlo',
        'titulo conserva su @Column(nullable = false, length = 150)',
        'Importa Table de jakarta.persistence',
        'Importa GeneratedValue de jakarta.persistence',
        'Importa GenerationType de jakarta.persistence',
      ])
      // Arreglar solo los imports y @Entity no basta: falta el nombre del atributo.
      const casi = solucionCon(c, LIBRO, (t) => t.replace('private String titulo;', 'private String titlo;'))
      expect(fallan(c, casi).map((k) => k.label)).toEqual([
        'El atributo se llama titulo, como en el getter',
        'Ya no queda titlo',
        'titulo conserva su @Column(nullable = false, length = 150)',
      ])
      // Si al renombrar se borra el @Column, el mensaje lo dice aparte.
      const sinColumna = solucionCon(c, LIBRO, (t) => t.replace('  @Column(nullable = false, length = 150)\n', ''))
      expect(fallan(c, sinColumna).map((k) => k.label)).toEqual(['titulo conserva su @Column(nullable = false, length = 150)'])
    })

    it('el reto de crear Socio no trae Socio.java y sí muestra Libro como modelo', () => {
      const c = reto('m03-l3-c2')
      expect(c.files[SOCIO]).toBeUndefined()
      expect(c.files[LIBRO]).toBeDefined()
      expect(c.solution[SOCIO]).toMatch(/import java\.util\.UUID;/)
    })

    it('al terminar m03, Libro y Socio tienen id UUID con GenerationType.UUID', () => {
      const final = conSolucion(reto('m03-l3-c2'))
      ;[final[LIBRO], final[SOCIO]].forEach((t) => {
        expect(t).toMatch(/@Id\n {2}@GeneratedValue\(strategy = GenerationType\.UUID\)\n {2}private UUID id;/)
        expect(t).not.toMatch(/IDENTITY|Long/)
      })
    })

    const SOCIO_COMPACTO = `package com.biblioteca.models;
import java.util.*;
import jakarta.persistence.*;
@Table(name="socios") @Entity
public class Socio {
  @Id @GeneratedValue(strategy=GenerationType.UUID)
  private UUID id;
  @Column(length=100,nullable=false) private String nombre;
  @Column(unique=true,length=150,nullable=false)
  private String correo;
  protected Socio(){}
  public UUID getId(){return id;}
  public String getNombre(){return this.nombre;}
  public void setNombre(String n){this.nombre=n;}
  public String getCorreo(){return correo;}
  public void setCorreo(String c){this.correo=c;}
}
`

    it('acepta Socio escrito de otra forma', () => {
      const c = reto('m03-l3-c2')
      expect(fallan(c, { ...c.files, [SOCIO]: SOCIO_COMPACTO }).map((k) => k.label)).toEqual([])
    })

    it('detecta los errores típicos al crear Socio', () => {
      const c = reto('m03-l3-c2')
      const con = (cambio) => fallan(c, solucionCon(c, SOCIO, cambio))
      expect(con((t) => t.replace('\n@Entity\n', '\n')).map((k) => k.message)).toContain(
        'Falta la anotación @Entity encima de public class Socio: sin ella, Socio es una clase normal y no se guarda en ninguna tabla.',
      )
      expect(con((t) => t.replace('GenerationType.UUID', 'GenerationType.IDENTITY')).map((k) => k.label)).toEqual([
        '@GeneratedValue(strategy = GenerationType.UUID) sobre el id',
        'No usa IDENTITY con un id UUID',
      ])
      expect(con((t) => t.replace('private UUID id;', 'private Long id;')).map((k) => k.label)).toContain('@Id está encima de private UUID id')
      expect(con((t) => t.replace('unique = true, ', '')).map((k) => k.label)).toEqual(['correo es único (unique = true)'])
      expect(con((t) => t.replace('private String correo;', 'private String corrreo;')).map((k) => k.label)).toContain('correo es obligatorio, de 150, encima de private String correo')
      expect(con((t) => t.replaceAll('jakarta.persistence', 'javax.persistence')).map((k) => k.label)).toContain('No usa javax.persistence')
      expect(con((t) => t.replace('package com.biblioteca.models;', 'package com.biblioteca;')).map((k) => k.label)).toEqual(['Está en el paquete com.biblioteca.models'])
      expect(con((t) => t.replace(/ {2}public Socio\(\) \{\n {2}\}\n\n/, '')).map((k) => k.label)).toEqual(['Socio tiene un constructor vacío'])
    })
  })

  describe('comentarios junto a las anotaciones', () => {
    const libroSol = (id) => conSolucion(reto(id))[LIBRO]
    const pasaCon = (id, cambio) => fallan(reto(id), { ...conSolucion(reto(id)), [LIBRO]: cambio(libroSol(id)) }).map((k) => k.label)

    it('acepta un comentario al final de la línea de una anotación', () => {
      expect(pasaCon('m03-l1-c1', (t) => t.replace('  @Id\n', '  @Id // clave\n'))).toEqual([])
      expect(pasaCon('m03-l1-c1', (t) => t.replace('\n@Entity\n', '\n@Entity // ficha\n'))).toEqual([])
      expect(pasaCon('m03-l2-c1', (t) => t.replace('@Column(nullable = false, length = 150)\n', '@Column(nullable = false, length = 150) // nota\n'))).toEqual([])
    })

    it('acepta una línea de comentario entre anotaciones y entre la anotación y el atributo', () => {
      expect(pasaCon('m03-l1-c2', (t) => t.replace('  @Id\n', '  @Id\n  // la clave se crea sola\n'))).toEqual([])
      expect(pasaCon('m03-l1-c2', (t) => t.replace('  private UUID id;', '  /* código único */\n  private UUID id;'))).toEqual([])
    })

    it('acepta Javadoc antes de la clase y entre las anotaciones y la clase', () => {
      expect(pasaCon('m03-l1-c3', (t) => t.replace('\n@Entity\n', '\n/**\n * Ficha de un libro.\n */\n@Entity\n'))).toEqual([])
      expect(pasaCon('m03-l1-c3', (t) => t.replace('\npublic class Libro', '\n/** Ficha de un libro. */\npublic class Libro'))).toEqual([])
    })

    it('una anotación comentada sigue sin contar', () => {
      expect(pasaCon('m03-l1-c1', (t) => t.replace('  @Id\n', '  /* @Id */\n'))).toContain('@Id está encima de private UUID id')
      expect(pasaCon('m03-l1-c3', (t) => t.replace('\n@Entity\n@Table(name = "libros")\n', '\n@Table(name = "libros") // @Entity\n'))).toContain('Libro tiene @Entity encima de la clase')
      expect(pasaCon('m03-l1-c1', (t) => t.replace('  @Id\n', '  // ojo @Id\n'))).toContain('@Id está encima de private UUID id')
    })

    it('los imports no aceptan clases que solo empiezan igual (IdClass, EntityListeners)', () => {
      expect(pasaCon('m03-l1-c1', (t) => t.replace('import jakarta.persistence.Id;', 'import jakarta.persistence.IdClass;'))).toEqual(['Importa Id de jakarta.persistence'])
      expect(pasaCon('m03-l1-c1', (t) => t.replace('import jakarta.persistence.Entity;', 'import jakarta.persistence.EntityListeners;'))).toEqual(['Importa Entity de jakarta.persistence'])
    })
  })
})
