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

  describe('lección 2: @Enumerated(EnumType.STRING) en Libro', () => {
    it('tiene 3 retos', () => {
      expect(modulo.lessons[1].challenges.map((c) => c.id)).toEqual(['m04-l2-c1', 'm04-l2-c2', 'm04-l2-c3'])
    })

    it('detecta categoria como String (error típico) y el import que falta', () => {
      const c = reto('m04-l2-c1')
      const str = solucionCon(c, LIBRO, (t) => t.replaceAll('CategoriaLibro categoria', 'String categoria').replace('public CategoriaLibro getCategoria', 'public String getCategoria'))
      expect(mensajes(c, str)).toContain('categoria debe ser del tipo enum CategoriaLibro, no String: así solo se aceptan las categorías de la lista.')
      expect(etiquetas(c, solucionCon(c, LIBRO, (t) => t.replace(/import com\.biblioteca\.models\.helpers\.CategoriaLibro;\n/, '')))).toEqual(['Importa CategoriaLibro de com.biblioteca.models.helpers'])
    })

    it('acepta @Column antes que @Enumerated, en la misma línea y con value =', () => {
      const c = reto('m04-l2-c2')
      const files = solucionCon(c, LIBRO, (t) =>
        t.replace('  @Enumerated(EnumType.STRING)\n  @Column(nullable = false)\n', '  @Column(nullable=false) @Enumerated(value = EnumType.STRING)\n'),
      )
      expect(etiquetas(c, files)).toEqual([])
      const star = solucionCon(c, LIBRO, (t) => t.replace(/import jakarta\.persistence\.[A-Za-z]+;\n/g, '').replace('package com.biblioteca.models;\n', 'package com.biblioteca.models;\nimport jakarta.persistence.*;\n'))
      expect(etiquetas(c, star)).toEqual([])
    })

    it('rechaza ORDINAL, @Enumerated sin paréntesis y unique = true en categoria', () => {
      const c = reto('m04-l2-c2')
      expect(etiquetas(c, solucionCon(c, LIBRO, (t) => t.replace('EnumType.STRING', 'EnumType.ORDINAL')))).toEqual([
        '@Enumerated(EnumType.STRING) encima de categoria',
        'No usa EnumType.ORDINAL',
      ])
      expect(etiquetas(c, solucionCon(c, LIBRO, (t) => t.replace('@Enumerated(EnumType.STRING)', '@Enumerated')))).toContain('@Enumerated lleva (EnumType.STRING)')
      expect(mensajes(c, solucionCon(c, LIBRO, (t) => t.replace('@Column(nullable = false)\n  private CategoriaLibro', '@Column(nullable = false, unique = true)\n  private CategoriaLibro')))).toEqual([
        'categoria no puede ser unique = true: muchos libros comparten categoría (con unique solo cabría una novela en toda la biblioteca).',
      ])
    })

    it('un @Enumerated comentado no cuenta', () => {
      const c = reto('m04-l2-c2')
      expect(etiquetas(c, solucionCon(c, LIBRO, (t) => t.replace('  @Enumerated(EnumType.STRING)', '  // @Enumerated(EnumType.STRING)')))).toContain('@Enumerated(EnumType.STRING) encima de categoria')
    })

    it('el reto de arreglar trae ORDINAL y unique = true de inicio', () => {
      const c = reto('m04-l2-c3')
      expect(etiquetas(c, c.files)).toEqual(expect.arrayContaining(['No usa EnumType.ORDINAL', 'categoria no es única']))
    })
  })

  describe('lección 3: Socio y su TipoSocio', () => {
    it('tiene 2 retos y el módulo suma 7', () => {
      expect(modulo.lessons.map((l) => l.id)).toEqual(['m04-l1', 'm04-l2', 'm04-l3'])
      expect(modulo.lessons[2].challenges.map((c) => c.id)).toEqual(['m04-l3-c1', 'm04-l3-c2'])
      expect(retos()).toHaveLength(7)
    })

    it('el inicio de l3-c1 tiene String tipo y lo detecta', () => {
      const c = reto('m04-l3-c1')
      expect(c.files[SOCIO]).toMatch(/private String tipo;/)
      expect(mensajes(c, c.files)).toContain('tipo debe ser del tipo enum TipoSocio, no String.')
      const soloCampo = solucionCon(c, SOCIO, (t) => t.replace('public TipoSocio getTipo', 'public String getTipo'))
      expect(etiquetas(c, soloCampo)).toEqual(['getTipo y setTipo usan TipoSocio'])
    })

    it('el reto final integra: sin @Enumerated, con ORDINAL, unique o sin @Entity falla', () => {
      const c = reto('m04-l3-c2')
      const con = (cambio) => etiquetas(c, solucionCon(c, SOCIO, cambio))
      expect(con((t) => t.replace('  @Enumerated(EnumType.STRING)\n', ''))).toContain('@Enumerated(EnumType.STRING) encima de tipo')
      expect(con((t) => t.replace('EnumType.STRING', 'EnumType.ORDINAL'))).toContain('No usa EnumType.ORDINAL')
      expect(con((t) => t.replace('@Column(nullable = false, length = 20)', '@Column(nullable = false, unique = true, length = 20)'))).toEqual(['tipo no es único'])
      expect(con((t) => t.replace('\n@Entity\n', '\n'))).toEqual(['Socio tiene @Entity encima de la clase'])
      expect(con((t) => t.replace('unique = true, length = 150', 'length = 150'))).toEqual(['correo sigue siendo único'])
    })

    it('acepta el reto final escrito de otra forma', () => {
      const c = reto('m04-l3-c2')
      const files = solucionCon(c, SOCIO, (t) =>
        t
          .replace('  @Enumerated(EnumType.STRING)\n  @Column(nullable = false, length = 20)\n', '  @Column(length=20,nullable=false) @Enumerated(EnumType.STRING) ')
          .replace('import com.biblioteca.models.helpers.TipoSocio;', 'import com.biblioteca.models.helpers.*;'),
      )
      expect(etiquetas(c, files)).toEqual([])
    })
  })
})
