import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm06')
const retos = modulo ? modulo.lessons.flatMap((l) => l.challenges) : []

const REPOS = '/src/main/java/com/biblioteca/repositories'
const LIBRO_REPO = `${REPOS}/ILibroRepositorio.java`
const SOCIO_REPO = `${REPOS}/ISocioRepositorio.java`
const PRESTAMO_REPO = `${REPOS}/IPrestamoRepositorio.java`
const CHULETA = '/CHULETA.md'

// ¿Pasa este check con estos archivos? (solo los de archivos; manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}

const reto = (id) => {
  const c = retos.find((r) => r.id === id)
  if (!c) throw new Error(`No existe el reto ${id}`)
  return c
}
// Archivos como quedan al terminar el reto (iniciales + solución), con cambios opcionales.
const resuelto = (c, cambios = {}) => ({ ...c.files, ...c.solution, ...cambios })
const fallan = (c, files) => c.checks.filter((k) => !pasa(k, files))
const mensajesQueFallan = (c, files) => fallan(c, files).map((k) => k.message)
// Cambia un trozo de la solución (y comprueba que el trozo estaba, para no probar en vano).
function variar(c, path, de, a) {
  const texto = resuelto(c)[path]
  expect(texto, `${c.id}: ${path}`).toBeDefined()
  expect(texto.includes(de), `${c.id}: la solución de ${path} debería contener "${de}"`).toBe(true)
  return resuelto(c, { [path]: texto.replace(de, a) })
}

describe('módulo m06 Repositorios (Spring Boot)', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Repositorios')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución, xp 10 y checks con label y message', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(40)
      expect(l.challenges.length, l.id).toBeGreaterThanOrEqual(2)
      expect(l.challenges.length, l.id).toBeLessThanOrEqual(3)
      l.challenges.forEach((c) => {
        expect(c.title, c.id).toBeTruthy()
        expect(c.instructions.length, c.id).toBeGreaterThan(20)
        expect(c.hints, c.id).toHaveLength(3)
        expect(c.xp, c.id).toBe(10)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files[c.activeFile], c.id).toBeDefined()
        expect(c.files['/package.json'], c.id).toBeUndefined()
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('la solución de cada reto pasa todos sus checks', () => {
    retos.forEach((c) => {
      expect(fallan(c, resuelto(c)).map((k) => k.label), c.id).toEqual([])
    })
  })

  it('ningún reto viene resuelto de inicio: los archivos iniciales fallan algún check', () => {
    retos.forEach((c) => {
      expect(fallan(c, c.files).length, c.id).toBeGreaterThan(0)
    })
  })

  it('el pom.xml es el pom.xml base de docs/temario.md', () => {
    const doc = readFileSync('docs/temario.md', 'utf8')
    const base = doc.match(/```xml\n([\s\S]*?)```/)[1]
    retos.forEach((c) => {
      expect(c.files['/pom.xml'], c.id).toBe(base)
      if ('/pom.xml' in c.solution) expect(c.solution['/pom.xml'], c.id).toBe(base)
    })
  })

  it('usa jakarta.persistence y nunca javax.persistence', () => {
    expect(JSON.stringify(modulo)).not.toMatch(/javax\.persistence/)
  })

  it('no usa conceptos de módulos posteriores (consultas por nombre, @Query, servicios, controladores)', () => {
    const todo = JSON.stringify(modulo)
    expect(todo).not.toMatch(/findBy(?!Id\b)[A-Z]|existsBy(?!Id\b)[A-Z]|countBy|@Query|@Param|@Service|@Autowired|@RestController|@Controller|@GetMapping|@PostMapping|ResponseEntity|@Valid\b/)
  })

  describe('lección 1: qué es un repositorio', () => {
    it('crear ILibroRepositorio: el archivo no viene de inicio', () => {
      const c = reto('m06-l1-c1')
      expect(c.files[LIBRO_REPO]).toBeUndefined()
      expect(c.solution[LIBRO_REPO]).toBeDefined()
    })

    it('crear ILibroRepositorio: tolera espacios y saltos de línea de más', () => {
      const c = reto('m06-l1-c1')
      const variante = resuelto(c, {
        [LIBRO_REPO]: 'package   com.biblioteca.repositories\n\npublic   interface\n  ILibroRepositorio{\n}\n',
      })
      expect(fallan(c, variante).map((k) => k.label)).toEqual([])
    })

    it('crear ILibroRepositorio: detecta class en vez de interface y el paquete equivocado', () => {
      const c = reto('m06-l1-c1')
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'interface', 'class'))).toEqual([
        expect.stringMatching(/interface/),
        expect.stringMatching(/interface, no una class/),
      ])
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'package com.biblioteca.repositories;', 'package com.biblioteca;'))).toEqual([
        expect.stringMatching(/com\.biblioteca\.repositories/),
      ])
    })

    it('crear ILibroRepositorio: un comentario con la respuesta no basta', () => {
      const c = reto('m06-l1-c1')
      const comentado = resuelto(c, {
        [LIBRO_REPO]: '// package com.biblioteca.repositories;\n// public interface ILibroRepositorio {}\n',
      })
      expect(fallan(c, comentado).length).toBeGreaterThan(0)
    })

    it('extends JpaRepository<Libro, UUID>: tolera espacios y los imports con asterisco', () => {
      const c = reto('m06-l1-c2')
      const texto = resuelto(c)[LIBRO_REPO]
        .replace('JpaRepository<Libro, UUID>', 'JpaRepository < Libro ,UUID >')
        .replace('import java.util.UUID;', 'import java.util.*;')
        .replace('import com.biblioteca.models.Libro;', 'import com.biblioteca.models.*;')
      expect(fallan(c, resuelto(c, { [LIBRO_REPO]: texto })).map((k) => k.label)).toEqual([])
    })

    it('extends JpaRepository<Libro, UUID>: detecta el JpaRepository sin los dos datos (error de clase)', () => {
      const c = reto('m06-l1-c2')
      const msgs = mensajesQueFallan(c, variar(c, LIBRO_REPO, 'JpaRepository<Libro, UUID>', 'JpaRepository'))
      expect(msgs).toContainEqual(expect.stringMatching(/<Libro, UUID>/))
      expect(msgs).toContainEqual(expect.stringMatching(/sin los dos datos/))
    })

    it('extends JpaRepository<Libro, UUID>: detecta el tipo de id equivocado (Long en vez de UUID)', () => {
      const c = reto('m06-l1-c2')
      const msgs = mensajesQueFallan(c, variar(c, LIBRO_REPO, 'JpaRepository<Libro, UUID>', 'JpaRepository<Libro, Long>'))
      expect(msgs).toContainEqual(expect.stringMatching(/UUID/))
      expect(msgs).toContainEqual(expect.stringMatching(/id de Libro es UUID/))
    })

    it('extends JpaRepository<Libro, UUID>: detecta que falta un import', () => {
      const c = reto('m06-l1-c2')
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'import java.util.UUID;\n', ''))).toEqual([
        expect.stringMatching(/import java\.util\.UUID/),
      ])
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'import org.springframework.data.jpa.repository.JpaRepository;\n', ''))).toEqual([
        expect.stringMatching(/import org\.springframework\.data\.jpa\.repository\.JpaRepository/),
      ])
    })
  })
})
