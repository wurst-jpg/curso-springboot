import { readFileSync } from 'node:fs'
import courseConfig from '../../src/content/courseConfig.js'
import { COURSE_MODES, courseMode, isCodeOnly } from '../../src/content/mode.js'

describe('courseConfig', () => {
  // El modo real cambia en cada curso copiado ('sandbox' en React, 'code' en Java…).
  it('solo tiene la clave mode, con un modo que existe', () => {
    expect(Object.keys(courseConfig)).toEqual(['mode'])
    expect(COURSE_MODES).toContain(courseConfig.mode)
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
    // (con undefined se usaría la configuración real por ser el valor por defecto del parámetro)
    expect(courseMode(null)).toBe('sandbox')
  })

  it('isCodeOnly: curso en modo code o reto con preview:false', () => {
    const sandbox = { mode: 'sandbox' }
    const code = { mode: 'code' }
    expect(isCodeOnly({ id: 'a' }, sandbox)).toBe(false)
    expect(isCodeOnly({ id: 'a', preview: true }, sandbox)).toBe(false)
    expect(isCodeOnly({ id: 'a', preview: false }, sandbox)).toBe(true)
    expect(isCodeOnly({ id: 'a' }, code)).toBe(true)
  })

  it('sin pasar config se usa la configuración real del curso', () => {
    expect(courseMode()).toBe(courseConfig.mode)
    expect(isCodeOnly({ id: 'x' })).toBe(courseConfig.mode === 'code')
    expect(isCodeOnly({ id: 'x', preview: false })).toBe(true)
  })
})
