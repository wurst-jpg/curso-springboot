import { buildQuestion, LONG_TEXT_LIMIT, languageOf, NO_DOUBT, NO_CHECK } from '../../src/ask/buildQuestion.js'

const base = () => ({
  courseTitle: 'Curso de Spring Boot',
  codeOnly: true,
  moduleTitle: 'Módulo Java',
  lessonTitle: 'Clases',
  lessonExplanation: 'Una clase es un molde.',
  challengeTitle: 'Tu primera clase',
  instructions: 'Añade el campo titulo.',
  files: { '/pom.xml': '<project/>', '/src/Libro.java': 'public class Libro {}' },
  activeFile: '/src/Libro.java',
  results: null,
  hints: ['Pista uno', 'Pista dos secreta', 'Pista tres secreta'],
  hintsShown: 1,
  question: '',
})

describe('buildQuestion', () => {
  it('sigue el orden pedido', () => {
    const t = buildQuestion({ ...base(), question: 'No entiendo private' })
    const marks = [
      'Estoy haciendo el Curso de Spring Boot',
      'Mi duda:',
      'Módulo Java',
      'Clases',
      'Tu primera clase',
      'Añade el campo titulo.',
      'Una clase es un molde.',
      'Mi código actual:',
      'Resultado de Comprobar:',
      'Pistas que ya abrí',
    ]
    const idx = marks.map((m) => t.indexOf(m))
    expect(idx.every((i) => i >= 0)).toBe(true)
    expect([...idx].sort((a, b) => a - b)).toEqual(idx)
    expect(t).toContain('No entiendo private')
  })

  it('usa el título del curso y la nota de solo código solo cuando toca', () => {
    expect(buildQuestion(base())).toContain('Comprobar solo revisa el texto de mi código; no se ejecuta.')
    const t = buildQuestion({ ...base(), codeOnly: false, courseTitle: 'Curso de React' })
    expect(t).toContain('Estoy haciendo el Curso de React, un curso interactivo. Soy principiante.')
    expect(t).not.toContain('no se ejecuta')
  })

  it('duda vacía usa el texto por defecto', () => {
    expect(buildQuestion({ ...base(), question: '   ' })).toContain(NO_DOUBT)
  })

  it('incluye cada archivo con su lenguaje y marca el activo', () => {
    const t = buildQuestion(base())
    expect(t).toContain('### /pom.xml')
    expect(t).toContain('```xml\n<project/>\n```')
    expect(t).toContain('```java\npublic class Libro {}\n```')
    expect(t).toMatch(/### \/src\/Libro\.java.*archivo abierto/)
    expect(t).not.toMatch(/### \/pom\.xml.*archivo abierto/)
  })

  it('lenguajes por extensión', () => {
    const map = { 'A.java': 'java', 'a.xml': 'xml', 'a.properties': 'properties', 'a.jsx': 'jsx', 'a.js': 'js', 'a.css': 'css', 'a.html': 'html', 'a.md': 'md', 'a.txt': 'txt', 'a.xyz': '' }
    for (const [p, l] of Object.entries(map)) expect(languageOf(p)).toBe(l)
  })

  it('sin Comprobar', () => {
    expect(buildQuestion(base())).toContain(NO_CHECK)
  })

  it('con resultados de Comprobar', () => {
    const t = buildQuestion({
      ...base(),
      results: [
        { index: 0, label: 'Tiene titulo', status: 'pass' },
        { index: 1, label: 'Sin println', status: 'fail', message: 'Quita System.out' },
      ],
    })
    expect(t).toContain('✅ Tiene titulo')
    expect(t).toContain('❌ Sin println')
    expect(t).toContain('Quita System.out')
    expect(t).not.toContain(NO_CHECK)
  })

  it('solo incluye las pistas abiertas y nunca la solución', () => {
    const t = buildQuestion({ ...base(), solution: { '/x': 'SOLUCION_SECRETA' } })
    expect(t).toContain('Pistas que ya abrí: 1 de 3')
    expect(t).toContain('Pista uno')
    expect(t).not.toContain('secreta')
    expect(t).not.toContain('SOLUCION_SECRETA')
  })

  it('sin pistas abiertas o sin pistas', () => {
    const t = buildQuestion({ ...base(), hintsShown: 0 })
    expect(t).toContain('Pistas que ya abrí: 0 de 3')
    expect(t).not.toContain('Pista uno')
    expect(buildQuestion({ ...base(), hints: [], hintsShown: 0 })).not.toContain('Pistas que ya abrí')
  })

  it('el límite de texto largo es 60000', () => {
    expect(LONG_TEXT_LIMIT).toBe(60000)
  })
})
