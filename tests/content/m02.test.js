import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm02')
const retos = modulo.lessons.flatMap((l) => l.challenges)
const reto = (id) => retos.find((c) => c.id === id)
const PROPS = '/src/main/resources/application.properties'

// ¿Pasa este check con estos archivos? (solo los de archivos; manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}

// Archivos del reto tras aplicar la solución
const resuelto = (c) => ({ ...c.files, ...c.solution })
// Checks que fallan con un application.properties dado
const fallan = (c, texto) => c.checks.filter((k) => !pasa(k, { ...resuelto(c), [PROPS]: texto })).map((k) => k.label)

describe('módulo m02 Configuración (Spring Boot)', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Configuración')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('tiene 3 lecciones y 8 retos', () => {
    expect(modulo.lessons.map((l) => l.id)).toEqual(['m02-l1', 'm02-l2', 'm02-l3'])
    expect(retos).toHaveLength(8)
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución y checks con label y message', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(40)
      l.challenges.forEach((c) => {
        expect(c.title, c.id).toBeTruthy()
        expect(c.instructions.length, c.id).toBeGreaterThan(20)
        expect(c.hints, c.id).toHaveLength(3)
        expect(c.xp, c.id).toBe(10)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files[c.activeFile] ?? c.solution[c.activeFile], c.id).toBeDefined()
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('la solución de cada reto pasa todos sus checks', () => {
    retos.forEach((c) => {
      c.checks.forEach((k) => expect(pasa(k, resuelto(c)), `${c.id}: ${k.label}`).toBe(true))
    })
  })

  it('ningún reto viene resuelto de inicio: los archivos iniciales fallan algún check', () => {
    retos.forEach((c) => {
      expect(c.checks.filter((k) => !pasa(k, c.files)).length, c.id).toBeGreaterThan(0)
    })
  })

  it('el reto de crear application.properties no trae ese archivo de inicio', () => {
    expect(reto('m02-l1-c1').files[PROPS]).toBeUndefined()
  })

  it('los demás retos traen application.properties para editar', () => {
    retos.filter((c) => c.id !== 'm02-l1-c1').forEach((c) => expect(c.files[PROPS], c.id).toBeDefined())
  })

  it('los checks toleran espacios alrededor del = y saltos de línea Windows', () => {
    expect(fallan(reto('m02-l1-c1'), 'spring.application.name = biblioteca\r\n')).toEqual([])
    expect(fallan(reto('m02-l1-c2'), 'server.port  =  8081')).toEqual([])
    expect(fallan(reto('m02-l1-c2'), '  server.port=8081  \n')).toEqual([])
    expect(fallan(reto('m02-l2-c1'), 'spring.datasource.url = jdbc:h2:mem:biblioteca\nspring.datasource.username = sa\n')).toEqual([])
    expect(fallan(reto('m02-l2-c2'), 'spring.datasource.password = ${DB_PASSWORD:}\n')).toEqual([])
    expect(fallan(reto('m02-l2-c2'), 'spring.datasource.password=${DB_PASSWORD:secreta}')).toEqual([])
    expect(fallan(reto('m02-l3-c1'), 'spring.jpa.show-sql = true')).toEqual([])
    expect(fallan(reto('m02-l3-c2'), 'spring.jpa.hibernate.ddl-auto = update\n')).toEqual([])
  })

  it('un comentario con la respuesta no pasa el check', () => {
    expect(fallan(reto('m02-l1-c2'), '# server.port=8081\nserver.port=8080\n')).not.toEqual([])
    expect(fallan(reto('m02-l1-c1'), '# spring.application.name=biblioteca\n')).not.toEqual([])
    expect(fallan(reto('m02-l3-c1'), '#spring.jpa.show-sql=true\n')).not.toEqual([])
    expect(fallan(reto('m02-l3-c2'), '# spring.jpa.hibernate.ddl-auto=update\n')).not.toEqual([])
  })

  it('detecta errores típicos de clase', () => {
    // puerto equivocado o el de antes
    expect(fallan(reto('m02-l1-c2'), 'server.port=8080\n')).toContain('server.port vale 8081')
    // H2 en archivo en vez de en memoria
    expect(fallan(reto('m02-l2-c1'), 'spring.datasource.url=jdbc:h2:file:./data/biblioteca\nspring.datasource.username=sa\n')).not.toEqual([])
    // contraseña escrita en claro
    expect(fallan(reto('m02-l2-c2'), 'spring.datasource.password=12345\n')).not.toEqual([])
    // consola desactivada
    expect(fallan(reto('m02-l2-c3'), 'spring.h2.console.enabled=false\nspring.h2.console.path=/h2-console\n')).not.toEqual([])
    // ddl-auto create-drop en vez de update
    expect(fallan(reto('m02-l3-c2'), 'spring.jpa.hibernate.ddl-auto=create-drop\n')).not.toEqual([])
    // show-sql en false
    expect(fallan(reto('m02-l3-c1'), 'spring.jpa.show-sql=false\n')).not.toEqual([])
  })

  it('el reto final exige toda la configuración', () => {
    const c = reto('m02-l3-c3')
    expect(fallan(c, '# vacío\n').length).toBeGreaterThanOrEqual(7)
  })

  it('el pom.xml es el pom.xml base de docs/temario.md', () => {
    const doc = readFileSync('docs/temario.md', 'utf8')
    const base = doc.match(/```xml\n([\s\S]*?)```/)[1]
    retos.forEach((c) => expect(c.files['/pom.xml'], c.id).toBe(base))
  })

  it('no usa conceptos de módulos posteriores ni nombres de Spring Boot 3', () => {
    const todo = JSON.stringify(modulo.lessons.map((l) => [l.explanation, l.challenges.map((c) => [c.instructions, c.hints, c.solution, c.files, c.checks])]))
    expect(todo).not.toMatch(/@Entity|@Table|@Id\b|@Column|@Enumerated|@ManyToOne|@OneToMany|JpaRepository|@Repository|findBy|@Service|@RestController|@Autowired|entidad|javax\.persistence/i)
    expect(todo).not.toMatch(/spring-boot-starter-web[^m]/)
  })
})
