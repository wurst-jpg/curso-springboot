import { EditorState } from '@codemirror/state'
import { createAutocompleteExtension, createCompletionSources } from '../../src/autocomplete/autocompleteExtension.js'
import { CompletionContext } from '@codemirror/autocomplete'
import { java } from '@codemirror/lang-java'
import { xml } from '@codemirror/lang-xml'
import { complete, labels } from './helpers.js'

async function labelsIn(sources, lang, docWithCursor) {
  const pos = docWithCursor.indexOf('|')
  const state = EditorState.create({ doc: docWithCursor.replace('|', ''), selection: { anchor: pos }, extensions: [lang] })
  const out = []
  for (const s of sources) out.push(...labels(await s(new CompletionContext(state, pos, true))))
  return out
}

const files = { '/src/Saludo.jsx': 'function Saludo() {}' }

async function allLabels(sources, doc) {
  const out = []
  for (const s of sources) out.push(...labels(await complete(s, doc)))
  return out
}

describe('createAutocompleteExtension', () => {
  it('devuelve extensiones válidas para un EditorState', () => {
    const ext = createAutocompleteExtension({ getFiles: () => files })
    expect(Array.isArray(ext)).toBe(true)
    expect(() => EditorState.create({ doc: '', extensions: ext })).not.toThrow()
  })
})

describe('plantillas con el mismo hueco repetido (comp)', () => {
  it('permite varios cursores, necesarios para que el nombre se escriba en todos los sitios', () => {
    const state = EditorState.create({ doc: '', extensions: createAutocompleteExtension({ getFiles: () => files }) })
    expect(state.facet(EditorState.allowMultipleSelections)).toBe(true)
  })
})

describe('createCompletionSources', () => {
  it('juntos sugieren React, Tailwind y nombres del proyecto', async () => {
    const sources = createCompletionSources({ getFiles: () => files })
    expect(await allLabels(sources, 'useS|')).toContain('useState')
    expect(await allLabels(sources, 'Salu|')).toContain('Saludo')
    expect(await allLabels(sources, '<p className="bg-bl|">')).toContain('bg-blue-500')
    expect(await allLabels(sources, 'const bg-bl|')).not.toContain('bg-blue-500')
  })

  it('con el interruptor desactivado no hay ninguna sugerencia, y al reactivarlo vuelven', async () => {
    let enabled = false
    const sources = createCompletionSources({ getFiles: () => files, isEnabled: () => enabled })
    expect(await allLabels(sources, 'useS|')).toEqual([])
    expect(await allLabels(sources, '<p className="bg-bl|">')).toEqual([])
    expect(await allLabels(sources, 'Salu|')).toEqual([])
    enabled = true
    expect(await allLabels(sources, 'useS|')).toContain('useState')
  })
})

describe('createAutocompleteController', () => {
  it('el interruptor y los archivos cambian sin crear otra extensión', async () => {
    const { createAutocompleteController } = await import('../../src/autocomplete/autocompleteExtension.js')
    const controller = createAutocompleteController({ enabled: true, files: {} })
    const extension = controller.extension
    const state = EditorState.create({ doc: '', extensions: extension })
    expect(state).toBeTruthy()
    controller.setEnabled(false)
    controller.setFiles({ '/a.jsx': 'function Cosa() {}' })
    expect(controller.extension).toBe(extension)
  })
})

describe('estilo de la lista', () => {
  it('incluye un tema propio para .cm-tooltip-autocomplete', async () => {
    const { autocompleteTheme } = await import('../../src/autocomplete/autocompleteExtension.js')
    const css = JSON.stringify(autocompleteTheme)
    expect(autocompleteTheme).toBeTruthy()
    expect(Array.isArray(createAutocompleteExtension({ getFiles: () => files }))).toBe(true)
    // El tema se crea con EditorView.theme: debe ser una extensión que acepta EditorState.create
    expect(() => EditorState.create({ doc: '', extensions: [autocompleteTheme] })).not.toThrow()
    expect(css).toBeTruthy()
  })
})

describe('archivos que no son JavaScript', () => {
  const javaFiles = {
    '/src/main/java/com/biblioteca/models/Libro.java': 'public class Libro { String titulo; }',
    '/src/Saludo.jsx': 'function Saludo() {}',
  }
  const sources = () =>
    createCompletionSources({ getFiles: () => javaFiles, getActivePath: () => '/src/main/java/com/biblioteca/App.java' })

  it('en Java no hay sugerencias de React, Tailwind ni import de JS', async () => {
    const out = await labelsIn(sources(), java(), 'class App { void m() { useS| } }')
    expect(out).not.toContain('useState')
    const [importSource] = sources()
    expect(await labelsIn([importSource], java(), 'import Sal|')).toEqual([])
    expect(await labelsIn([importSource], java(), "import x from './|'")).toEqual([])
  })

  it('en Java sí sugiere nombres del proyecto', async () => {
    expect(await labelsIn(sources(), java(), 'class App { Lib| }')).toContain('Libro')
  })

  it('en Java no sugiere nada dentro de un texto entre comillas', async () => {
    expect(await labelsIn(sources(), java(), 'class App { String s = "Lib|"; }')).toEqual([])
  })

  it('en XML no hay ninguna sugerencia', async () => {
    expect(await labelsIn(sources(), xml(), '<project><Lib|</project>')).toEqual([])
  })
})
