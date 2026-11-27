// Arma el texto que el alumno copia para pegarlo en Claude. Función pura: no toca la red ni el DOM.
// Nunca recibe ni incluye la solución ni las pistas que el alumno no ha abierto.

export const LONG_TEXT_LIMIT = 60000
export const NO_DOUBT = 'No escribí una duda concreta: dime qué me falta o qué está mal.'
export const NO_CHECK = 'Todavía no he pulsado Comprobar.'

const LANGUAGES = {
  java: 'java',
  xml: 'xml',
  properties: 'properties',
  jsx: 'jsx',
  js: 'js',
  css: 'css',
  html: 'html',
  md: 'md',
  txt: 'txt',
}

export function languageOf(path) {
  const dot = path.lastIndexOf('.')
  if (dot < 0) return ''
  return LANGUAGES[path.slice(dot + 1).toLowerCase()] ?? ''
}

// Si el código trae ``` el bloque se cierra antes de tiempo: se usa una valla más larga.
function fence(code, lang) {
  let ticks = '```'
  while (code.includes(ticks)) ticks += '`'
  return `${ticks}${lang}\n${code}\n${ticks}`
}

function filesSection(files, activeFile) {
  const parts = Object.entries(files).map(([path, code]) => {
    const mark = path === activeFile ? ' (archivo abierto ahora)' : ''
    return `### ${path}${mark}\n${fence(code, languageOf(path))}`
  })
  return `Mi código actual:\n\n${parts.join('\n\n')}`
}

function resultsSection(results) {
  if (!results) return `Resultado de Comprobar:\n${NO_CHECK}`
  const lines = results.map((r) => {
    const icon = r.status === 'pass' ? '✅' : '❌'
    return `- ${icon} ${r.label}${r.message ? ` — ${r.message}` : ''}`
  })
  return `Resultado de Comprobar:\n${lines.join('\n')}`
}

function hintsSection(hints, shown) {
  if (!hints?.length) return null
  const open = hints.slice(0, shown)
  const lines = [`Pistas que ya abrí: ${open.length} de ${hints.length}`]
  open.forEach((h, i) => lines.push(`${i + 1}. ${h}`))
  return lines.join('\n')
}

export function buildQuestion({
  courseTitle,
  codeOnly = false,
  question = '',
  moduleTitle,
  lessonTitle,
  lessonExplanation,
  challengeTitle,
  instructions,
  files = {},
  activeFile,
  results = null,
  hints = [],
  hintsShown = 0,
}) {
  const intro =
    `Estoy haciendo el ${courseTitle}, un curso interactivo. Soy principiante. Ayúdame con este reto en español sencillo ` +
    'y con ejemplos cotidianos. Guíame paso a paso y dame pistas; no me des la solución completa a menos que te la pida.' +
    (codeOnly ? ' Comprobar solo revisa el texto de mi código; no se ejecuta.' : '')
  const doubt = `Mi duda:\n${question.trim() || NO_DOUBT}`
  const challenge =
    `Módulo: ${moduleTitle}\nLección: ${lessonTitle}\nReto: ${challengeTitle}\n\n` +
    `Instrucciones del reto:\n${instructions}`
  const lesson = `Explicación de la lección:\n${lessonExplanation ?? ''}`
  return [intro, doubt, challenge, lesson, filesSection(files, activeFile), resultsSection(results), hintsSection(hints, hintsShown)]
    .filter(Boolean)
    .join('\n\n')
}
