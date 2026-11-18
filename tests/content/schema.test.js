import { validateCourse, CHECK_TYPES, IFRAME_CHECK_TYPES } from '../../src/content/schema.js'

const reto = (over = {}) => ({
  id: 'm1-l1-c1',
  title: 'Reto',
  instructions: 'Haz algo',
  files: { '/src/main.jsx': 'x', '/src/App.jsx': 'y' },
  activeFile: '/src/App.jsx',
  hints: ['pista'],
  solution: { '/src/App.jsx': 'z' },
  checks: [{ type: 'text', match: 'hola', label: 'Dice hola' }],
  ...over,
})

// Estas pruebas son del modo con vista previa: el modo se pasa explícito para no depender de
// src/content/courseConfig.js (que cambia en cada curso copiado).
const sandbox = { mode: 'sandbox' }

const curso = (retoOver, extraReto) => [
  {
    id: 'm1',
    title: 'M',
    summary: 's',
    lessons: [
      {
        id: 'm1-l1',
        title: 'L',
        explanation: 'e',
        challenges: [reto(retoOver), ...(extraReto ? [extraReto] : [])],
      },
    ],
  },
]

describe('validateCourse', () => {
  it('acepta un curso mínimo válido', () => {
    expect(validateCourse(curso(), sandbox)).toEqual([])
  })

  it('detecta ids repetidos en cualquier nivel', () => {
    const errores = validateCourse(curso({}, reto()), sandbox)
    expect(errores.some((e) => e.includes('m1-l1-c1'))).toBe(true)
    const c = curso()
    c[0].lessons[0].id = 'm1'
    expect(validateCourse(c, sandbox).some((e) => e.includes("'m1'"))).toBe(true)
  })

  it('detecta un reto sin checks', () => {
    expect(validateCourse(curso({ checks: [] }), sandbox).length).toBeGreaterThan(0)
  })

  it('exige /src/main.jsx salvo startFrom previous', () => {
    const sinMain = { files: { '/src/App.jsx': 'y' } }
    expect(validateCourse(curso(sinMain), sandbox).length).toBeGreaterThan(0)
    const segundo = reto({ id: 'm1-l1-c2', ...sinMain, startFrom: 'previous' })
    expect(validateCourse(curso({}, segundo), sandbox)).toEqual([])
  })

  it('detecta activeFile fuera de files', () => {
    expect(validateCourse(curso({ activeFile: '/src/Otro.jsx' }), sandbox).length).toBeGreaterThan(0)
  })

  it('detecta checks con tipo desconocido o sin label', () => {
    expect(
      validateCourse(curso({ checks: [{ type: 'magia', label: 'x' }] }), sandbox).length,
    ).toBeGreaterThan(0)
    expect(
      validateCourse(curso({ checks: [{ type: 'text', match: 'a' }] }), sandbox).length,
    ).toBeGreaterThan(0)
  })

  it('acepta message de texto y rechaza uno vacío o no textual', () => {
    const conMsg = (message) => curso({ checks: [{ type: 'file-exists', pattern: 'x', label: 'a', message }] })
    expect(validateCourse(conMsg('Falta algo.'), sandbox)).toEqual([])
    expect(validateCourse(conMsg(''), sandbox)).not.toEqual([])
    expect(validateCourse(conMsg(5), sandbox)).not.toEqual([])
  })

  it('rechaza startFrom previous en el primer reto del curso', () => {
    expect(validateCourse(curso({ startFrom: 'previous' }), sandbox).length).toBeGreaterThan(0)
  })
})

describe('validateCourse en modo solo código', () => {
  const javaReto = (over = {}) =>
    reto({
      files: { '/pom.xml': '<project/>', '/src/main/java/App.java': 'class App {}' },
      activeFile: '/src/main/java/App.java',
      solution: { '/src/main/java/App.java': 'public class App {}' },
      checks: [
        { type: 'file-includes', path: '/src/main/java/App.java', pattern: 'public class', label: 'a' },
        { type: 'file-excludes', pattern: 'System\\.exit', label: 'b' },
        { type: 'file-exists', pattern: 'App\\.java$', label: 'c' },
        { type: 'file-count', min: 1, label: 'd' },
        { type: 'manual', label: 'e' },
      ],
      ...over,
    })
  const code = { mode: 'code' }

  it('acepta un reto Java sin /src/main.jsx y solo con checks de página', () => {
    const c = curso()
    c[0].lessons[0].challenges = [javaReto()]
    expect(validateCourse(c, code)).toEqual([])
  })

  it('un reto con preview:false en un curso normal tampoco necesita /src/main.jsx', () => {
    const c = curso()
    c[0].lessons[0].challenges = [javaReto({ preview: false })]
    expect(validateCourse(c, sandbox)).toEqual([])
  })

  it('sin preview:false, un curso normal sigue exigiendo /src/main.jsx', () => {
    const c = curso()
    c[0].lessons[0].challenges = [javaReto()]
    expect(validateCourse(c, sandbox).some((e) => e.includes('/src/main.jsx'))).toBe(true)
  })

  it.each(['text', 'role', 'count', 'class', 'interaction', 'lint-clean'])(
    'rechaza checks %s (necesitan la vista previa o ESLint) en modo code y con preview:false',
    (type) => {
      const checks = [{ type, label: 'x', match: 'a', role: 'button', selector: 'p', pattern: 'a' }]
      const enCurso = curso()
      enCurso[0].lessons[0].challenges = [javaReto({ checks })]
      const errores = validateCourse(enCurso, code)
      expect(errores.some((e) => e.includes(type) && e.includes('solo código'))).toBe(true)

      const enReto = curso()
      enReto[0].lessons[0].challenges = [javaReto({ checks, preview: false })]
      expect(validateCourse(enReto, sandbox).length).toBeGreaterThan(0)
    },
  )

  it('rechaza un modo de curso desconocido y preview no booleano', () => {
    expect(validateCourse(curso(), { mode: 'java' }).some((e) => e.includes('java'))).toBe(true)
    expect(validateCourse(curso({ preview: 'no' }), sandbox).length).toBeGreaterThan(0)
  })

  it('en un curso en modo code, preview:true es una contradicción', () => {
    const c = curso()
    c[0].lessons[0].challenges = [javaReto({ preview: true })]
    expect(validateCourse(c, code).length).toBeGreaterThan(0)
  })

  it('file-excludes exige un pattern que sea una expresión regular válida', () => {
    const conPattern = (pattern) => curso({ checks: [{ type: 'file-excludes', label: 'a', pattern }] })
    expect(validateCourse(conPattern('console\\.log'), sandbox)).toEqual([])
    expect(validateCourse(conPattern(undefined), sandbox).length).toBeGreaterThan(0)
    expect(validateCourse(conPattern('('), sandbox).length).toBeGreaterThan(0)
  })
})

describe('constantes de checks', () => {
  it('tiene los 11 tipos y los del iframe', () => {
    expect(CHECK_TYPES).toHaveLength(11)
    expect(CHECK_TYPES).toContain('file-excludes')
    expect(IFRAME_CHECK_TYPES).toEqual(['text', 'role', 'count', 'class', 'interaction'])
    IFRAME_CHECK_TYPES.forEach((t) => expect(CHECK_TYPES).toContain(t))
  })
})
