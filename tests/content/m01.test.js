import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm01')
const retos = modulo.lessons.flatMap((l) => l.challenges)
const reto = (id) => retos.find((c) => c.id === id)

const doc = readFileSync('docs/temario.md', 'utf8')
const BASE = doc.match(/```xml\n([\s\S]*?)```/)[1]

const POM = '/pom.xml'
const APP = '/src/main/java/com/biblioteca/BibliotecaApplication.java'

// ¿Pasa este check con estos archivos? (manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}
// Etiquetas de los checks que fallan con estos archivos (los de inicio + los cambios del alumno)
const fallan = (c, cambios) => c.checks.filter((k) => !pasa(k, { ...c.files, ...cambios })).map((k) => k.label)

const bloque = (artifact, scope) =>
  `    <dependency>\n      <groupId>org.springframework.boot</groupId>\n      <artifactId>${artifact}</artifactId>\n${scope ? `      <scope>${scope}</scope>\n` : ''}    </dependency>\n`
const conDependencia = (pom, b) => pom.replace('  </dependencies>', () => b + '  </dependencies>')
const DEVTOOLS = `    <dependency>
      <groupId>org.springframework.boot</groupId>
      <artifactId>spring-boot-devtools</artifactId>
      <scope>runtime</scope>
      <optional>true</optional>
    </dependency>
`

describe('módulo m01 Maven y el proyecto (Spring Boot)', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Maven y el proyecto')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('tiene 3 lecciones y 8 retos', () => {
    expect(modulo.lessons.map((l) => l.id)).toEqual(['m01-l1', 'm01-l2', 'm01-l3'])
    expect(retos.map((c) => c.id)).toEqual([
      'm01-l1-c1', 'm01-l1-c2', 'm01-l2-c1', 'm01-l2-c2', 'm01-l2-c3', 'm01-l3-c1', 'm01-l3-c2', 'm01-l3-c3',
    ])
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución, xp 10 y checks con label y message', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(300)
      l.challenges.forEach((c) => {
        expect(c.title, c.id).toBeTruthy()
        expect(c.instructions.length, c.id).toBeGreaterThan(20)
        expect(c.hints, c.id).toHaveLength(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files[c.activeFile], c.id).toBeDefined()
        expect(c.xp, c.id).toBe(10)
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('ningún reto viene resuelto de inicio', () => {
    retos.forEach((c) => expect(fallan(c, {}).length, c.id).toBeGreaterThan(0))
  })

  it('la solución de cada reto pasa todos sus checks', () => {
    retos.forEach((c) => expect(fallan(c, c.solution), c.id).toEqual([]))
  })

  it('los retos de crear archivo no traen ese archivo de inicio', () => {
    const c2 = reto('m01-l3-c2')
    expect(c2.files['/src/main/resources/bienvenida.txt']).toBeUndefined()
    expect(c2.files['/src/test/java/com/biblioteca/BibliotecaApplicationTests.java']).toBeUndefined()
    expect(reto('m01-l3-c3').files['/src/main/java/com/biblioteca/avisos/Aviso.java']).toBeUndefined()
  })

  it('todo /pom.xml de inicio es el canónico y en las soluciones solo cambia lo que pide el reto', () => {
    retos.forEach((c) => {
      if (c.files[POM] !== undefined) expect(c.files[POM], c.id).toBe(BASE)
    })
    const esperado = {
      'm01-l1-c1': BASE.replace('<version>0.0.1-SNAPSHOT</version>', '<version>1.0.0</version>'),
      'm01-l1-c2': BASE.replace('<name>biblioteca</name>', '<name>biblioteca</name>\n  <description>Sistema de la biblioteca</description>'),
      'm01-l2-c1': conDependencia(BASE, bloque('spring-boot-starter-actuator')),
      'm01-l2-c2': BASE.replace(DEVTOOLS, ''),
      'm01-l2-c3': conDependencia(BASE, bloque('spring-boot-starter-test', 'test')),
      'm01-l3-c3': conDependencia(BASE, bloque('spring-boot-starter-mail')).replace('<java.version>17</java.version>', '<java.version>21</java.version>'),
    }
    Object.entries(esperado).forEach(([id, pom]) => expect(reto(id).solution[POM], id).toBe(pom))
    ;['m01-l3-c1', 'm01-l3-c2'].forEach((id) => expect(reto(id).solution[POM], id).toBeUndefined())
  })

  it('los retos con pom.xml lo traen abierto junto a la clase principal', () => {
    retos.forEach((c) => {
      expect(c.files[APP], c.id).toBeDefined()
      expect(c.files[POM], c.id).toBeDefined()
    })
  })

  describe('l1: versión y descripción', () => {
    it('c1: acepta variantes con espacios y detecta tocar la versión de Spring Boot', () => {
      const c = reto('m01-l1-c1')
      const variante = BASE.replace('<version>0.0.1-SNAPSHOT</version>', '<version>  1.0.0\n  </version>')
      expect(fallan(c, { [POM]: variante })).toEqual([])
      const mal = BASE.replace('<version>4.1.2</version>', '<version>1.0.0</version>')
      expect(fallan(c, { [POM]: mal })).toEqual([
        'La versión del proyecto es 1.0.0',
        'Ya no queda 0.0.1-SNAPSHOT',
        'La versión de Spring Boot (4.1.2) no se tocó',
      ])
    })
    it('c2: tolera espacios y exige el texto pedido', () => {
      const c = reto('m01-l1-c2')
      const variante = BASE.replace('<name>biblioteca</name>', '<name>biblioteca</name><description>   Sistema   de la biblioteca </description>')
      expect(fallan(c, { [POM]: variante })).toEqual([])
      const otro = BASE.replace('<name>biblioteca</name>', '<name>biblioteca</name>\n<description>Mi proyecto</description>')
      expect(fallan(c, { [POM]: otro })).toEqual(['La descripción dice "Sistema de la biblioteca"'])
    })
  })

  describe('l2: dependencias', () => {
    it('c1: detecta scope de más, nombre antiguo, comentario y dependencia fuera de <dependencies>', () => {
      const c = reto('m01-l2-c1')
      expect(fallan(c, { [POM]: conDependencia(BASE, bloque('spring-boot-starter-actuator', 'test')) })).toEqual([
        'Existe la dependencia spring-boot-starter-actuator',
        'Sin scope: el pack se usa siempre',
      ])
      expect(fallan(c, { [POM]: conDependencia(BASE, bloque('spring-boot-actuator')) })).toContain('El nombre es spring-boot-starter-actuator')
      const comentada = conDependencia(BASE, `<!--\n${bloque('spring-boot-starter-actuator')}-->\n`)
      expect(fallan(c, { [POM]: comentada })).toContain('La dependencia no está comentada')
      const fuera = BASE.replace('</project>', () => bloque('spring-boot-starter-actuator') + '</project>')
      expect(fallan(c, { [POM]: fuera })).toContain('Existe la dependencia spring-boot-starter-actuator')
    })
    it('c1: acepta la dependencia en una sola línea y con espacios', () => {
      const c = reto('m01-l2-c1')
      const una = conDependencia(BASE, '<dependency><groupId>org.springframework.boot</groupId><artifactId> spring-boot-starter-actuator </artifactId></dependency>\n')
      expect(fallan(c, { [POM]: una })).toEqual([])
    })
    it('c2: comentar devtools no cuenta como quitarlo; borrar de más tampoco', () => {
      const c = reto('m01-l2-c2')
      const comentada = BASE.replace(DEVTOOLS, `<!--\n${DEVTOOLS}-->\n`)
      expect(fallan(c, { [POM]: comentada })).toEqual(['Ya no está spring-boot-devtools'])
      const demas = BASE.replace(DEVTOOLS, '').replace(bloque('spring-boot-starter-webmvc'), '')
      expect(fallan(c, { [POM]: demas })).toEqual(['Siguen las demás dependencias'])
    })
    it('c3: exige scope test', () => {
      const c = reto('m01-l2-c3')
      const sin = fallan(c, { [POM]: conDependencia(BASE, bloque('spring-boot-starter-test')) })
      expect(sin).toContain('spring-boot-starter-test con scope test')
      expect(sin).toContain('El pack no se queda sin scope')
      const otro = fallan(c, { [POM]: conDependencia(BASE, bloque('spring-boot-starter-test', 'runtime')) })
      expect(otro).toContain('El scope es test, no otro')
      const variante = conDependencia(BASE, bloque('spring-boot-starter-test', ' test '))
      expect(fallan(c, { [POM]: variante })).toEqual([])
    })
  })

  describe('l3: carpetas, clase principal y mvnw', () => {
    it('c1: la anotación comentada o el run con otra clase no valen', () => {
      const c = reto('m01-l3-c1')
      const base = c.solution[APP]
      expect(fallan(c, { [APP]: base.replace('@SpringBootApplication', '// @SpringBootApplication') })).toEqual([
        'La clase lleva @SpringBootApplication justo encima',
      ])
      expect(fallan(c, { [APP]: base.replace('(BibliotecaApplication.class', '(Otra.class') })).toContain('run recibe BibliotecaApplication.class')
      const variante = base.replace('@SpringBootApplication\npublic class', '@SpringBootApplication public   class').replace('args);', 'args)')
      expect(fallan(c, { [APP]: variante })).toEqual([])
    })
    it('c2: el paquete del test debe coincidir con su carpeta', () => {
      const c = reto('m01-l3-c2')
      const T = '/src/test/java/com/biblioteca/BibliotecaApplicationTests.java'
      const mal = { ...c.solution, [T]: 'package com.biblioteca.test;\npublic class BibliotecaApplicationTests {}' }
      expect(fallan(c, mal)).toEqual(['El paquete del test es com.biblioteca'])
      const enMain = { '/src/main/java/com/biblioteca/BibliotecaApplicationTests.java': c.solution[T], '/src/main/resources/bienvenida.txt': 'Hola desde resources' }
      expect(fallan(c, enMain)).toContain('Existe BibliotecaApplicationTests.java en src/test/java')
      const variante = { ...c.solution, [T]: 'package   com.biblioteca\npublic  class  BibliotecaApplicationTests{}' }
      expect(fallan(c, variante)).toEqual([])
    })
    it('c3: el paquete debe terminar en .avisos y se acepta Java 21 con espacios', () => {
      const c = reto('m01-l3-c3')
      const A = '/src/main/java/com/biblioteca/avisos/Aviso.java'
      const mal = { ...c.solution, [A]: 'package com.biblioteca;\npublic class Aviso {}' }
      expect(fallan(c, mal)).toEqual(['El paquete es com.biblioteca.avisos', 'El paquete coincide con la carpeta avisos'])
      const sin17 = { ...c.solution, [POM]: c.solution[POM].replace('<java.version>21</java.version>', '<java.version> 21 </java.version>') }
      expect(fallan(c, sin17)).toEqual([])
      const aun17 = { ...c.solution, [POM]: BASE }
      expect(fallan(c, aun17)).toEqual(expect.arrayContaining(['java.version vale 21', 'Ya no queda java.version 17']))
    })
    it('c3: incluye una casilla manual sobre mvnw', () => {
      expect(reto('m01-l3-c3').checks.some((k) => k.type === 'manual')).toBe(true)
    })
  })

  it('explica Maven, mvnw y los starters con nombres de Spring Boot 4', () => {
    const texto = modulo.lessons.map((l) => l.explanation).join('\n')
    expect(texto).toMatch(/receta/i)
    expect(texto).toMatch(/lista de (la )?compras?/i)
    expect(texto).toMatch(/\.\/mvnw spring-boot:run/)
    expect(texto).toContain('spring-boot-starter-webmvc')
    expect(texto).toMatch(/src\/main\/resources/)
    expect(texto).toMatch(/src\/test\/java/)
  })

  it('no usa nombres de Spring Boot 3 ni javax', () => {
    const todo = JSON.stringify(modulo)
    expect(todo).not.toMatch(/spring-boot-starter-web[^m]/)
    expect(todo).not.toMatch(/javax\./)
  })

  it('no usa conceptos de módulos posteriores', () => {
    const todo = JSON.stringify(modulo.lessons.map((l) => [l.explanation, l.challenges.map((c) => [c.instructions, c.hints, c.solution, c.checks])]))
    expect(todo).not.toMatch(
      /@Entity|@Table|@Id\b|@Column|@Enumerated|@ManyToOne|@OneToMany|JpaRepository|@Repository|application\.properties|findBy|@Service|@Autowired|@RestController|@Controller|@GetMapping|@Test\b|@SpringBootTest|h2-console|server\.port|ddl-auto|starter-validation|@Valid/,
    )
  })
})
