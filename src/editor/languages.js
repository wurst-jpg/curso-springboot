import { LanguageSupport, StreamLanguage, language } from '@codemirror/language'
import { java } from '@codemirror/lang-java'
import { xml } from '@codemirror/lang-xml'

// `.properties` (application.properties de Spring): casi texto plano; solo se marcan los
// comentarios (# o !) y el nombre de cada clave para que se lea mejor.
const propertiesLanguage = StreamLanguage.define({
  name: 'properties',
  startState: () => ({ afterKey: false }),
  token(stream, state) {
    if (stream.sol()) {
      state.afterKey = false
      stream.eatSpace()
      if (stream.peek() === '#' || stream.peek() === '!') {
        stream.skipToEnd()
        return 'comment'
      }
    }
    if (!state.afterKey) {
      if (stream.match(/^[^=:\s]+/)) return 'propertyName'
      if (stream.eat(/[=:]/)) {
        state.afterKey = true
        return 'operator'
      }
    }
    stream.skipToEnd()
    return null
  },
  languageData: { commentTokens: { line: '#' } },
})

/**
 * Lenguajes que se añaden al editor de Sandpack (prop `additionalLanguages`), además de los
 * que ya trae (JavaScript/JSX, CSS, HTML). Sandpack elige el lenguaje por la extensión.
 */
export const ADDITIONAL_LANGUAGES = [
  { name: 'java', extensions: ['java'], language: java() },
  { name: 'xml', extensions: ['xml'], language: xml() },
  { name: 'properties', extensions: ['properties'], language: new LanguageSupport(propertiesLanguage) },
]

/** Nombre del lenguaje del editor ('javascript', 'java', 'xml'…) o null si no tiene. */
export function editorLanguage(state) {
  return state.facet(language)?.name ?? null
}

const JS_NAMES = new Set(['javascript', 'jsx', 'typescript', 'tsx'])
const WEB_NAMES = new Set([...JS_NAMES, 'css', 'html'])

/** ¿Es JavaScript? (sin lenguaje cuenta como JavaScript, como hasta ahora). ESLint solo corre aquí. */
export function isJsLanguage(state) {
  const name = editorLanguage(state)
  return name === null || JS_NAMES.has(name)
}

/** ¿Es un archivo web (JS, CSS, HTML)? Ahí sirven las sugerencias de React, Tailwind e import. */
export function isWebLanguage(state) {
  const name = editorLanguage(state)
  return name === null || WEB_NAMES.has(name)
}
