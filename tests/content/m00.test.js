import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm00')
const retos = modulo.lessons.flatMap((l) => l.challenges)

// ¿Pasa este check con estos archivos? (solo los de archivos; manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}

describe('módulo m00 Bienvenida (Spring Boot)', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Bienvenida')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('tiene 3 lecciones y 6 retos', () => {
    expect(modulo.lessons.map((l) => l.id)).toEqual(['m00-l1', 'm00-l2', 'm00-l3'])
    expect(retos).toHaveLength(6)
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución y checks con label y message', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(40)
      l.challenges.forEach((c) => {
        expect(c.title, c.id).toBeTruthy()
        expect(c.instructions.length, c.id).toBeGreaterThan(20)
        expect(c.hints, c.id).toHaveLength(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files[c.activeFile], c.id).toBeDefined()
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('ningún reto viene resuelto de inicio: los archivos iniciales fallan algún check', () => {
    retos.forEach((c) => {
      const fallan = c.checks.filter((k) => !pasa(k, c.files))
      expect(fallan.length, c.id).toBeGreaterThan(0)
    })
  })

  it('los retos de crear archivo no traen ese archivo de inicio', () => {
    expect(retos.find((c) => c.id === 'm00-l2-c1').files['/src/main/java/com/biblioteca/Hola.java']).toBeUndefined()
    expect(retos.find((c) => c.id === 'm00-l2-c2').files['/src/main/java/com/biblioteca/util/Mensajes.java']).toBeUndefined()
  })

  it('los checks toleran espacios de más y el punto y coma opcional', () => {
    const hola = retos.find((c) => c.id === 'm00-l2-c1')
    const variante = { '/src/main/java/com/biblioteca/Hola.java': 'package   com.biblioteca\n\npublic  class  Hola{}' }
    hola.checks.forEach((k) => expect(pasa(k, variante), k.label).toBe(true))
    const mensaje = retos.find((c) => c.id === 'm00-l1-c2')
    const files = { ...mensaje.files, '/src/main/java/com/biblioteca/Bienvenida.java': 'MENSAJE="Hola,Biblioteca"' }
    expect(pasa(mensaje.checks[0], files)).toBe(true)
  })

  it('detecta el error típico de poner el paquete sin la carpeta util', () => {
    const reto = retos.find((c) => c.id === 'm00-l2-c2')
    const mal = { '/src/main/java/com/biblioteca/util/Mensajes.java': 'package com.biblioteca;\npublic class Mensajes {}' }
    expect(reto.checks.filter((k) => !pasa(k, mal)).map((k) => k.label)).toEqual([
      'Empieza con package com.biblioteca.util;',
      'El paquete coincide con la carpeta',
    ])
    const holaMal = { '/src/main/java/com/biblioteca/Hola.java': 'package com.biblioteca.util;\npublic class Hola {}' }
    const hola = retos.find((c) => c.id === 'm00-l2-c1')
    expect(hola.checks.some((k) => !pasa(k, holaMal))).toBe(true)
  })

  it('el pom.xml es el pom.xml base de docs/temario.md', () => {
    const doc = readFileSync('docs/temario.md', 'utf8')
    const base = doc.match(/```xml\n([\s\S]*?)```/)[1]
    retos.forEach((c) => expect(c.files['/pom.xml'], c.id).toBe(base))
  })

  it('solo enseña a usar la plataforma: no usa conceptos de módulos posteriores', () => {
    const todo = JSON.stringify(modulo.lessons.map((l) => [l.explanation, l.challenges.map((c) => [c.instructions, c.hints, c.solution, c.checks])]))
    expect(todo).not.toMatch(/@Entity|@Table|@Id\b|@Column|@Enumerated|@ManyToOne|@OneToMany|JpaRepository|@Repository|application\.properties|findBy/)
  })
})
