import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm03')
const retos = () => modulo.lessons.flatMap((l) => l.challenges)
const reto = (id) => retos().find((c) => c.id === id)

const LIBRO = '/src/main/java/com/biblioteca/models/Libro.java'

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
import jakarta.persistence.*;
@Entity @Table(name="libros")
public class Libro {
  @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
  @Column(length=150,nullable=false)
  private String titulo;
  @Column(length=20, unique=true,nullable=false) private String isbn;
  @Column(length = 100,nullable = false,name="nombre_autor")
  private String autor;
  protected Libro(){}
  public Libro(String titulo, String isbn, String autor) { this.titulo = titulo; this.isbn = isbn; this.autor = autor; }
  public Long getId() { return id; }
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
      .filter((c) => c.activeFile === LIBRO)
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
      expect(fallan(c, files).map((k) => k.label)).toContain('@Id está encima de private Long id')
    })

    it('@GeneratedValue exige la estrategia IDENTITY', () => {
      const c = reto('m03-l1-c2')
      const files = solucionCon(c, LIBRO, (t) => t.replace('GenerationType.IDENTITY', 'GenerationType.AUTO'))
      expect(fallan(c, files).length).toBeGreaterThan(0)
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

    it('el constructor vacío: el inicial no lo tiene y "public void Libro()" no vale', () => {
      const c = reto('m03-l2-c3')
      expect(c.files[LIBRO]).toMatch(/public Libro\(String titulo/)
      const conVoid = solucionCon(c, LIBRO, (t) => t.replace('public Libro() {', 'public void Libro() {'))
      expect(fallan(c, conVoid).map((k) => k.label)).toEqual(['Libro tiene un constructor vacío'])
      const sinParams = solucionCon(c, LIBRO, (t) => t.replace(/ {2}public Libro\(String[\s\S]*?\n {2}\}\n\n/, ''))
      expect(fallan(c, sinParams).map((k) => k.label)).toEqual(['El constructor con titulo, isbn y autor sigue ahí'])
    })
  })
})
