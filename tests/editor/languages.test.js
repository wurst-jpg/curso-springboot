import { EditorState } from '@codemirror/state'
import { javascript } from '@codemirror/lang-javascript'
import { ensureSyntaxTree, syntaxTree } from '@codemirror/language'
import { ADDITIONAL_LANGUAGES, editorLanguage, isJsLanguage, isWebLanguage } from '../../src/editor/languages.js'

const byExt = (ext) => ADDITIONAL_LANGUAGES.find((l) => l.extensions.includes(ext))

describe('lenguajes extra del editor', () => {
  it('registra Java, XML y .properties con la forma que pide Sandpack', () => {
    for (const ext of ['java', 'xml', 'properties']) {
      const lang = byExt(ext)
      expect(lang, ext).toBeTruthy()
      expect(typeof lang.name).toBe('string')
      expect(lang.language).toBeTruthy()
    }
    expect(byExt('java').name).toBe('java')
    expect(byExt('xml').name).toBe('xml')
  })

  it('Java y XML se analizan de verdad (hay árbol de sintaxis con sus nodos)', () => {
    const javaState = EditorState.create({ doc: 'public class Libro { String t = "x"; }', extensions: [byExt('java').language] })
    const nodes = []
    const javaTree = ensureSyntaxTree(javaState, javaState.doc.length, 5000)
    expect(javaTree).not.toBeNull()
    javaTree.iterate({ enter: (n) => nodes.push(n.name) })
    expect(nodes).toContain('ClassDeclaration')
    expect(nodes).toContain('StringLiteral')
    expect(editorLanguage(javaState)).toBe('java')

    const xmlState = EditorState.create({ doc: '<project><a b="c"/></project>', extensions: [byExt('xml').language] })
    const xmlNodes = []
    const xmlTree = ensureSyntaxTree(xmlState, xmlState.doc.length, 5000)
    expect(xmlTree).not.toBeNull()
    xmlTree.iterate({ enter: (n) => xmlNodes.push(n.name) })
    expect(xmlNodes).toContain('TagName')
    expect(editorLanguage(xmlState)).toBe('xml')
  })

  it('.properties marca los comentarios y no rompe con texto cualquiera', () => {
    const state = EditorState.create({
      doc: '# comentario\nserver.port=8080\n',
      extensions: [byExt('properties').language],
    })
    expect(editorLanguage(state)).toBe('properties')
    expect(() => syntaxTree(state)).not.toThrow()
  })

  it('isJsLanguage / isWebLanguage: sin lenguaje cuenta como JS (como hasta ahora)', () => {
    expect(isJsLanguage(EditorState.create({ doc: '' }))).toBe(true)
    expect(isJsLanguage(EditorState.create({ doc: '', extensions: [javascript({ jsx: true })] }))).toBe(true)
    const java = EditorState.create({ doc: '', extensions: [byExt('java').language] })
    expect(isJsLanguage(java)).toBe(false)
    expect(isWebLanguage(java)).toBe(false)
    expect(isWebLanguage(EditorState.create({ doc: '' }))).toBe(true)
  })
})
