import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm07')
const retos = modulo ? modulo.lessons.flatMap((l) => l.challenges) : []

const REPOS = '/src/main/java/com/biblioteca/repositories'
const LIBRO_REPO = `${REPOS}/ILibroRepositorio.java`
const SOCIO_REPO = `${REPOS}/ISocioRepositorio.java`
const PRESTAMO_REPO = `${REPOS}/IPrestamoRepositorio.java`

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

describe('módulo m07 Consultas por nombre (Spring Boot)', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Consultas por nombre')
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

  it('los repositorios de inicio son los de m06 (con @Repository y JpaRepository<Entidad, UUID>)', () => {
    retos.forEach((c) => {
      Object.entries(c.files)
        .filter(([p]) => p.startsWith(REPOS))
        .forEach(([p, texto]) => {
          expect(texto, `${c.id} ${p}`).toMatch(/@Repository\npublic interface I(\w+)Repositorio extends JpaRepository<\1, UUID>/)
        })
    })
  })

  it('usa jakarta.persistence y nunca javax.persistence', () => {
    expect(JSON.stringify(modulo)).not.toMatch(/javax\.persistence/)
  })

  it('no usa conceptos de módulos posteriores (servicios, controladores, validaciones)', () => {
    const todo = JSON.stringify(modulo)
    expect(todo).not.toMatch(/@Service|@Autowired|@RestController|@Controller|@GetMapping|@PostMapping|ResponseEntity|@Valid\b|@Transactional|@Modifying|nativeQuery/)
  })

  it('@Query solo aparece en el reto extra de @Query (y en la lección que lo explica)', () => {
    retos
      .filter((c) => c.id !== 'm07-l3-c2')
      .forEach((c) => expect(JSON.stringify([c.files, c.solution, c.instructions, c.hints]), c.id).not.toMatch(/@Query/))
  })

  describe('lección 1: findBy', () => {
    it('findByIsbn: tolera espacios, public, sin punto y coma e import con asterisco', () => {
      const c = reto('m07-l1-c1')
      const texto = resuelto(c)[LIBRO_REPO]
        .replace('Optional<Libro> findByIsbn(String isbn);', 'public Optional < Libro >  findByIsbn( String   codigo )')
        .replace('import java.util.Optional;', 'import java.util.*;')
      expect(fallan(c, resuelto(c, { [LIBRO_REPO]: texto })).map((k) => k.label)).toEqual([])
    })

    it('findByIsbn: un comentario con la respuesta no basta', () => {
      const c = reto('m07-l1-c1')
      const comentado = variar(c, LIBRO_REPO, 'Optional<Libro> findByIsbn(String isbn);', '// Optional<Libro> findByIsbn(String isbn);')
      expect(mensajesQueFallan(c, comentado)).toEqual([expect.stringMatching(/Optional<Libro> findByIsbn\(String isbn\)/)])
    })

    it('findByIsbn: detecta la lista en vez de Optional y el nombre ISBN en mayúsculas', () => {
      const c = reto('m07-l1-c1')
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'Optional<Libro> findByIsbn', 'List<Libro> findByIsbn'))).toContainEqual(
        expect.stringMatching(/único/),
      )
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'findByIsbn', 'findByISBN'))).toContainEqual(expect.stringMatching(/se llama isbn/))
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'import java.util.Optional;\n', ''))).toEqual([
        expect.stringMatching(/import java\.util\.Optional/),
      ])
    })

    it('findByCorreo: detecta findByEmail (el campo se llama correo)', () => {
      const c = reto('m07-l1-c2')
      expect(mensajesQueFallan(c, variar(c, SOCIO_REPO, 'findByCorreo', 'findByEmail'))).toContainEqual(expect.stringMatching(/se llama correo/))
    })

    it('findByCategoria: detecta el String donde va el enum (error de clase)', () => {
      const c = reto('m07-l1-c3')
      const msgs = mensajesQueFallan(c, variar(c, LIBRO_REPO, 'findByCategoria(CategoriaLibro categoria)', 'findByCategoria(String categoria)'))
      expect(msgs).toContainEqual(expect.stringMatching(/enum CategoriaLibro, no String/))
    })

    it('findByCategoria: detecta Optional (hay muchos libros por categoría) y que falte el import del enum', () => {
      const c = reto('m07-l1-c3')
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'List<Libro> findByCategoria', 'Optional<Libro> findByCategoria'))).toContainEqual(
        expect.stringMatching(/lista/),
      )
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, 'import com.biblioteca.models.helpers.CategoriaLibro;\n', ''))).toEqual([
        expect.stringMatching(/import com\.biblioteca\.models\.helpers\.CategoriaLibro/),
      ])
    })

    it('findByCategoria: conserva findByIsbn del reto anterior', () => {
      const c = reto('m07-l1-c3')
      expect(c.files[LIBRO_REPO]).toMatch(/Optional<Libro> findByIsbn\(String isbn\);/)
      expect(mensajesQueFallan(c, variar(c, LIBRO_REPO, '  Optional<Libro> findByIsbn(String isbn);\n', ''))).toContainEqual(
        expect.stringMatching(/findByIsbn/),
      )
    })
  })
})
