import { CODE_PACKAGE_JSON_NAME, HIDDEN_PATHS, studentFiles } from './buildSandbox.js'

const codeOf = (value) => (typeof value === 'string' ? value : (value?.code ?? ''))

function isTechnicalPackageJson(path, value) {
  if (path !== '/package.json') return false
  try {
    return JSON.parse(codeOf(value))?.name === CODE_PACKAGE_JSON_NAME
  } catch {
    return false
  }
}

// Sandpack (template "react") mezcla sus propios archivos de plantilla (/App.js,
// /index.js, /styles.css, /package.json) con los nuestros. Los archivos del alumno
// son siempre los que viven bajo /src/ y no están ocultos.
// En modo solo código no hay plantilla: valen todos (también /pom.xml), menos el
// /package.json técnico que añade buildCodeOnlySetup().
export function editorFiles(sandpackFiles, { codeOnly = false } = {}) {
  const plain = {}
  for (const [path, value] of Object.entries(studentFiles(sandpackFiles))) {
    if (codeOnly ? isTechnicalPackageJson(path, value) : !path.startsWith('/src/')) continue
    plain[path] = codeOf(value)
  }
  return plain
}

const ALLOWED = /\.(jsx|js|css)$/
const CODE_ONLY_ALLOWED = /\.(java|xml|properties|ya?ml|sql|json|md|txt|jsx|js|css|html)$/
const SAFE_SEGMENT = /^[A-Za-z0-9_.-]+$/

/** Ejemplo de nombre que se le muestra al alumno al crear un archivo. */
export const newFileExample = (codeOnly) => (codeOnly ? 'src/main/java/Ejemplo.java' : 'Saludo.jsx')

/**
 * Convierte lo que escribe el alumno en una ruta `/src/...` o devuelve `{ error }`.
 * En modo solo código la ruta es desde la raíz del proyecto (`pom.xml` → `/pom.xml`,
 * `src/main/java/App.java` → `/src/main/java/App.java`) y valen más extensiones.
 */
export function normalizeNewPath(input, existingPaths, { codeOnly = false } = {}) {
  let rest = String(input ?? '').trim().replace(/\\/g, '/')
  rest = rest.replace(/^\.\//, '').replace(/^\/+/, '')
  if (!codeOnly && rest.startsWith('src/')) rest = rest.slice(4)
  rest = rest.replace(/^\/+/, '')
  if (rest === '' || (codeOnly && /\/$/.test(rest))) {
    return { error: `Escribe un nombre para el archivo, por ejemplo ${newFileExample(codeOnly)}.` }
  }
  const segments = rest.split('/')
  if (segments.some((s) => !SAFE_SEGMENT.test(s) || s === '.' || s === '..')) {
    return {
      error: 'Ese nombre no es válido. Usa solo letras, números, guiones y puntos, sin espacios.',
    }
  }
  if (codeOnly && !CODE_ONLY_ALLOWED.test(rest)) {
    return {
      error: `El nombre debe terminar en .java, .xml, .properties u otra extensión de texto (por ejemplo ${newFileExample(true)}).`,
    }
  }
  if (!codeOnly && !ALLOWED.test(rest)) {
    return { error: 'El nombre debe terminar en .jsx, .js o .css (por ejemplo Saludo.jsx).' }
  }
  const path = (codeOnly ? '/' : '/src/') + rest
  // En modo solo código, /package.json lo usa Sandpack por dentro (ver buildCodeOnlySetup).
  if (existingPaths.includes(path) || HIDDEN_PATHS.includes(path) || (codeOnly && path === '/package.json')) {
    return { error: `Ya existe un archivo llamado ${path}. Elige otro nombre.` }
  }
  return { path }
}
