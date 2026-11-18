import { readFileSync } from 'node:fs'
import courseConfig from '../../src/content/courseConfig.js'
import { courseMode, isCodeOnly } from '../../src/content/mode.js'

describe('courseConfig', () => {
  it('por defecto el curso es de vista previa (sandbox), como el curso de React', () => {
    expect(courseConfig).toEqual({ mode: 'sandbox' })
  })

  it('es un objeto simple sin import (lo copia el script de cursos nuevos)', () => {
    const source = readFileSync('src/content/courseConfig.js', 'utf8')
    expect(source).not.toMatch(/^\s*import\s/m)
  })
})

describe('modo del curso y de cada reto', () => {
  it('courseMode solo reconoce "code"; cualquier otra cosa es sandbox', () => {
    expect(courseMode({ mode: 'code' })).toBe('code')
    expect(courseMode({ mode: 'sandbox' })).toBe('sandbox')
    expect(courseMode({})).toBe('sandbox')
    expect(courseMode(undefined)).toBe('sandbox')
  })

  it('isCodeOnly: curso en modo code o reto con preview:false', () => {
    const sandbox = { mode: 'sandbox' }
    const code = { mode: 'code' }
    expect(isCodeOnly({ id: 'a' }, sandbox)).toBe(false)
    expect(isCodeOnly({ id: 'a', preview: true }, sandbox)).toBe(false)
    expect(isCodeOnly({ id: 'a', preview: false }, sandbox)).toBe(true)
    expect(isCodeOnly({ id: 'a' }, code)).toBe(true)
  })

  it('con la configuración real, los retos del curso de React usan vista previa', () => {
    expect(isCodeOnly({ id: 'x' })).toBe(false)
  })
})
