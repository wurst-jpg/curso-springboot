import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm04')
const retos = () => modulo.lessons.flatMap((l) => l.challenges)
const reto = (id) => retos().find((c) => c.id === id)

const LIBRO = '/src/main/java/com/biblioteca/models/Libro.java'
const SOCIO = '/src/main/java/com/biblioteca/models/Socio.java'
const CATEGORIA = '/src/main/java/com/biblioteca/models/helpers/CategoriaLibro.java'
const TIPO = '/src/main/java/com/biblioteca/models/helpers/TipoSocio.java'

// ¿Pasa este check con estos archivos? (solo los de archivos; manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}

const conSolucion = (c) => ({ ...c.files, ...c.solution })
const fallan = (c, files) => c.checks.filter((k) => !pasa(k, files))
const etiquetas = (c, files) => fallan(c, files).map((k) => k.label)
const mensajes = (c, files) => fallan(c, files).map((k) => k.message)
const solucionCon = (c, path, cambio) => {
  const files = conSolucion(c)
  return { ...files, [path]: cambio(files[path]) }
}

describe('módulo m04 Enums en entidades', () => {
  it('existe con título y resumen', () => {
    expect(modulo.title).toBe('Enums en entidades')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('cada lección explica y cada reto tiene 3 pistas, solución, activeFile, xp 10 y checks con label y message', () => {
    modulo.lessons.forEach((l) => {
      expect(l.explanation.length, l.id).toBeGreaterThan(200)
      l.challenges.forEach((c) => {
        expect(c.title, c.id).toBeTruthy()
        expect(c.instructions.length, c.id).toBeGreaterThan(40)
        expect(c.hints, c.id).toHaveLength(3)
        expect(Object.keys(c.solution).length, c.id).toBeGreaterThan(0)
        expect(c.files[c.activeFile], c.id).toBeDefined()
        expect(c.xp, c.id).toBe(10)
        expect(Object.keys(c.files).length, `${c.id}: varios archivos visibles`).toBeGreaterThan(2)
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('la solución de cada reto pasa todos sus checks', () => {
    retos().forEach((c) => expect(etiquetas(c, conSolucion(c)), c.id).toEqual([]))
  })

  it('ningún reto viene resuelto de inicio', () => {
    retos().forEach((c) => expect(fallan(c, c.files).length, c.id).toBeGreaterThan(0))
  })

  it('todo /pom.xml es el pom.xml base de docs/temario.md', () => {
    const doc = readFileSync('docs/temario.md', 'utf8')
    const base = doc.match(/```xml\n([\s\S]*?)```/)[1]
    retos().forEach((c) => {
      expect(c.files['/pom.xml'], c.id).toBe(base)
      if (c.solution['/pom.xml'] !== undefined) expect(c.solution['/pom.xml'], c.id).toBe(base)
    })
  })

  it('no usa conceptos de módulos posteriores (relaciones, repositorios, consultas)', () => {
    const todo = JSON.stringify(modulo.lessons.map((l) => [l.explanation, l.challenges.map((c) => [c.instructions, c.hints, c.files, c.solution, c.checks])]))
    expect(todo).not.toMatch(/@ManyToOne|@OneToMany|@JoinColumn|mappedBy|@Json|JpaRepository|@Repository|Repositorio|findBy|existsBy|@Query|@Valid|@NotNull/)
  })

  it('las soluciones usan jakarta.persistence y los enums viven en models/helpers', () => {
    retos().forEach((c) => {
      Object.values(c.solution).forEach((t) => expect(t, c.id).not.toMatch(/javax\.persistence/))
      Object.keys(c.solution)
        .filter((p) => /CategoriaLibro|TipoSocio/.test(p))
        .forEach((p) => expect(p, c.id).toMatch(/^\/src\/main\/java\/com\/biblioteca\/models\/helpers\//))
    })
  })

  describe('lección 1: los enums en helpers', () => {
    it('tiene 2 retos de crear archivo, y el archivo no viene de inicio', () => {
      expect(modulo.lessons[0].challenges.map((c) => c.id)).toEqual(['m04-l1-c1', 'm04-l1-c2'])
      expect(reto('m04-l1-c1').files[CATEGORIA]).toBeUndefined()
      expect(reto('m04-l1-c2').files[TIPO]).toBeUndefined()
      expect(reto('m04-l1-c2').files[CATEGORIA]).toBeDefined()
    })

    it('acepta el enum escrito todo junto, con coma o punto y coma al final', () => {
      const c = reto('m04-l1-c1')
      const v = { ...c.files, [CATEGORIA]: 'package com.biblioteca.models.helpers\npublic enum CategoriaLibro{NOVELA,CIENCIA,HISTORIA,INFANTIL,;}' }
      expect(etiquetas(c, v)).toEqual([])
      const t = reto('m04-l1-c2')
      expect(etiquetas(t, { ...t.files, [TIPO]: 'package com.biblioteca.models.helpers;\n\npublic enum TipoSocio {\n  ESTUDIANTE,\n  DOCENTE,\n  EXTERNO\n}\n' })).toEqual([])
    })

    it('detecta class en vez de enum, el paquete sin helpers y un valor que falta', () => {
      const c = reto('m04-l1-c1')
      expect(mensajes(c, solucionCon(c, CATEGORIA, (t) => t.replace('public enum', 'public class')))).toContain(
        'CategoriaLibro tiene que ser un enum (public enum CategoriaLibro), no una clase.',
      )
      expect(etiquetas(c, solucionCon(c, CATEGORIA, (t) => t.replace('models.helpers', 'models')))).toEqual(['Está en el paquete com.biblioteca.models.helpers'])
      expect(etiquetas(c, solucionCon(c, CATEGORIA, (t) => t.replace(', INFANTIL', '')))).toEqual(['Tiene NOVELA, CIENCIA, HISTORIA e INFANTIL, en ese orden'])
      expect(etiquetas(c, { ...c.files, '/src/main/java/com/biblioteca/models/CategoriaLibro.java': conSolucion(c)[CATEGORIA] })).toContain('Existe models/helpers/CategoriaLibro.java')
    })
  })
})
