import courseConfig from './courseConfig.js'
import { COURSE_MODES, courseMode, isCodeOnly } from './mode.js'

export const CHECK_TYPES = [
  'text',
  'role',
  'count',
  'class',
  'interaction',
  'file-exists',
  'file-includes',
  'file-count',
  'file-excludes',
  'lint-clean',
  'manual',
]

export const IFRAME_CHECK_TYPES = ['text', 'role', 'count', 'class', 'interaction']

// Sin vista previa (modo solo código) solo valen las que miran el texto de los archivos.
// `lint-clean` tampoco: ESLint solo entiende JavaScript.
export const CODE_ONLY_CHECK_TYPES = ['file-exists', 'file-includes', 'file-excludes', 'file-count', 'manual']

const MAIN = '/src/main.jsx'

/**
 * Devuelve una lista de errores en español; vacía significa que el curso es válido.
 * `config` es la de src/content/courseConfig.js (se puede pasar otra en las pruebas).
 */
export function validateCourse(modules, config = courseConfig) {
  const errors = []
  if (config?.mode !== undefined && !COURSE_MODES.includes(config.mode)) {
    errors.push(`El modo del curso '${config.mode}' no existe. Usa 'sandbox' o 'code' en src/content/courseConfig.js.`)
  }
  const seen = new Set()
  const checkId = (id, donde) => {
    if (!id) errors.push(`Falta el id en ${donde}.`)
    else if (seen.has(id)) errors.push(`El id '${id}' está repetido.`)
    else seen.add(id)
  }

  let first = true
  for (const mod of modules) {
    checkId(mod.id, 'un módulo')
    for (const lesson of mod.lessons ?? []) {
      checkId(lesson.id, `una lección de '${mod.id}'`)
      for (const ch of lesson.challenges ?? []) {
        checkId(ch.id, `un reto de '${lesson.id}'`)
        validateChallenge(ch, first, errors, config)
        first = false
      }
    }
  }
  return errors
}

function validateChallenge(ch, isFirst, errors, config) {
  const previous = ch.startFrom === 'previous'
  const codeOnly = isCodeOnly(ch, config)
  if (previous && isFirst) {
    errors.push(`El reto '${ch.id}' usa startFrom 'previous' pero es el primero del curso.`)
  }
  if ('preview' in ch && typeof ch.preview !== 'boolean') {
    errors.push(`El reto '${ch.id}' tiene preview que no es true ni false.`)
  }
  if (ch.preview === true && courseMode(config) === 'code') {
    errors.push(`El reto '${ch.id}' pide preview: true, pero el curso es de solo código (no hay vista previa).`)
  }
  if (!previous && !codeOnly && !(ch.files && MAIN in ch.files)) {
    errors.push(`El reto '${ch.id}' no tiene ${MAIN} en files.`)
  }
  if (ch.activeFile && !(ch.files && ch.activeFile in ch.files) && !previous) {
    errors.push(`El archivo activo '${ch.activeFile}' del reto '${ch.id}' no está en files.`)
  }
  if (!Array.isArray(ch.checks) || ch.checks.length === 0) {
    errors.push(`El reto '${ch.id}' no tiene checks.`)
    return
  }
  ch.checks.forEach((check, i) => {
    if (!CHECK_TYPES.includes(check.type)) {
      errors.push(`El check ${i + 1} del reto '${ch.id}' tiene un tipo desconocido: '${check.type}'.`)
    }
    if (codeOnly && CHECK_TYPES.includes(check.type) && !CODE_ONLY_CHECK_TYPES.includes(check.type)) {
      errors.push(
        `El check ${i + 1} del reto '${ch.id}' es de tipo '${check.type}', que no funciona en modo solo código ` +
          `(sin vista previa). Usa ${CODE_ONLY_CHECK_TYPES.join(', ')}.`,
      )
    }
    if (check.type === 'file-excludes' && !isValidRegex(check.pattern)) {
      errors.push(`El check ${i + 1} del reto '${ch.id}' (file-excludes) necesita un pattern que sea una expresión regular válida.`)
    }
    if (!check.label) errors.push(`El check ${i + 1} del reto '${ch.id}' no tiene label.`)
    if ('message' in check && (typeof check.message !== 'string' || !check.message.trim())) {
      errors.push(`El check ${i + 1} del reto '${ch.id}' tiene un message que no es un texto.`)
    }
  })
}

function isValidRegex(pattern) {
  if (typeof pattern !== 'string' || pattern === '') return false
  try {
    new RegExp(pattern)
    return true
  } catch {
    return false
  }
}
