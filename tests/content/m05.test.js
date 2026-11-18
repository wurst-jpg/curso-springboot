import { readFileSync } from 'node:fs'
import course from '../../src/content/course.js'

const modulo = course.find((m) => m.id === 'm05')
const retos = modulo ? modulo.lessons.flatMap((l) => l.challenges) : []
const reto = (id) => retos.find((c) => c.id === id)

const M = '/src/main/java/com/biblioteca/models/'
const LIBRO = `${M}Libro.java`
const SOCIO = `${M}Socio.java`
const PRESTAMO = `${M}Prestamo.java`

// ¿Pasa este check con estos archivos? (solo los de archivos; manual cuenta como pasado)
function pasa(check, files) {
  const textos = check.path ? (check.path in files ? [files[check.path]] : null) : Object.values(files)
  const re = new RegExp(check.pattern)
  if (check.type === 'file-exists') return Object.keys(files).some((p) => re.test(p))
  if (check.type === 'file-includes') return !!textos && textos.some((t) => re.test(t))
  if (check.type === 'file-excludes') return !!textos && !textos.some((t) => re.test(t))
  return true
}

const resuelto = (c) => ({ ...c.files, ...c.solution })
const fallos = (c, files) => c.checks.filter((k) => !pasa(k, files))
// Archivos de la solución con un cambio de texto en un archivo.
const conCambio = (c, path, de, a) => {
  const files = resuelto(c)
  expect(files[path], `${c.id}: ${path}`).toContain(de)
  return { ...files, [path]: files[path].replace(de, a) }
}
const mensajes = (c, files) => fallos(c, files).map((k) => k.message).join(' | ')

describe('módulo m05 Relaciones (Spring Boot)', () => {
  it('existe con título y resumen', () => {
    expect(modulo).toBeDefined()
    expect(modulo.title).toBe('Relaciones')
    expect(modulo.summary.length).toBeGreaterThan(10)
  })

  it('tiene 3 lecciones y 8 retos de 10 XP', () => {
    expect(modulo.lessons.map((l) => l.id)).toEqual(['m05-l1', 'm05-l2', 'm05-l3'])
    expect(retos).toHaveLength(8)
    retos.forEach((c) => expect(c.xp, c.id).toBe(10))
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
        expect(c.files['/package.json'], c.id).toBeUndefined()
        c.checks.forEach((k) => {
          expect(k.label, c.id).toBeTruthy()
          if (k.type !== 'manual') expect(k.message, `${c.id}: ${k.label}`).toBeTruthy()
        })
      })
    })
  })

  it('la solución de cada reto pasa todos sus checks', () => {
    retos.forEach((c) => {
      expect(fallos(c, resuelto(c)).map((k) => k.label), c.id).toEqual([])
    })
  })

  it('ningún reto viene resuelto de inicio', () => {
    retos.forEach((c) => expect(fallos(c, c.files).length, c.id).toBeGreaterThan(0))
  })

  it('el reto de crear Prestamo.java no trae ese archivo de inicio', () => {
    expect(reto('m05-l1-c1').files[PRESTAMO]).toBeUndefined()
    expect(reto('m05-l1-c1').solution[PRESTAMO]).toBeDefined()
  })

  it('muestra varios archivos: pom.xml, las entidades y los enums', () => {
    retos.forEach((c) => {
      expect(c.files['/pom.xml'], c.id).toBeDefined()
      expect(c.files[LIBRO], c.id).toBeDefined()
      expect(c.files[SOCIO], c.id).toBeDefined()
      expect(c.files[`${M}helpers/CategoriaLibro.java`], c.id).toBeDefined()
      expect(c.files[`${M}helpers/TipoSocio.java`], c.id).toBeDefined()
    })
  })

  it('Libro y Socio de inicio ya están terminados (UUID y enums en helpers)', () => {
    const c = reto('m05-l1-c1')
    expect(c.files[LIBRO]).toMatch(/@Entity[\s\S]*GenerationType\.UUID[\s\S]*private UUID id;/)
    expect(c.files[LIBRO]).toMatch(/@Enumerated\(EnumType\.STRING\)\s*[\s\S]*private CategoriaLibro categoria;/)
    expect(c.files[LIBRO]).toMatch(/import com\.biblioteca\.models\.helpers\.CategoriaLibro;/)
    expect(c.files[SOCIO]).toMatch(/@Enumerated\(EnumType\.STRING\)\s*[\s\S]*private TipoSocio tipo;/)
    expect(c.files[SOCIO]).toMatch(/unique = true[\s\S]*private String correo;/)
    expect(c.files[`${M}helpers/TipoSocio.java`]).toMatch(/package com\.biblioteca\.models\.helpers;\s*public enum TipoSocio/)
  })

  it('todas las soluciones usan jakarta.persistence y los paquetes correctos', () => {
    retos.forEach((c) => {
      Object.entries(c.solution).forEach(([path, texto]) => {
        expect(texto, `${c.id} ${path}`).not.toMatch(/javax\.persistence/)
        expect(texto, `${c.id} ${path}`).toMatch(/^package com\.biblioteca\.models;/)
      })
    })
    const final = resuelto(reto('m05-l3-c3'))
    expect(final[PRESTAMO]).toMatch(/import com\.fasterxml\.jackson\.annotation\.JsonBackReference;/)
    expect(final[LIBRO]).toMatch(/import com\.fasterxml\.jackson\.annotation\.JsonManagedReference;/)
    expect(final[LIBRO]).toMatch(/import java\.util\.ArrayList;[\s\S]*import java\.util\.List;/)
    expect(final[PRESTAMO]).toMatch(/import java\.time\.LocalDate;/)
  })

  describe('variantes tolerantes', () => {
    it('acepta @JoinColumn sin espacios, con otros atributos y en otro orden', () => {
      const c = reto('m05-l2-c2')
      const files = resuelto(c)
      const variante = files[PRESTAMO]
        .replace('@ManyToOne\n  @JoinColumn(name = "libro_id")', '@JoinColumn(nullable = false, name="libro_id")\n  @ManyToOne')
        .replace('@JoinColumn(name = "socio_id")', '@JoinColumn( name  =  "socio_id" , nullable = false )')
      expect(variante).not.toBe(files[PRESTAMO])
      expect(fallos(c, { ...files, [PRESTAMO]: variante }).map((k) => k.label)).toEqual([])
    })

    it('acepta mappedBy sin espacios y la lista sin inicializar', () => {
      const c = reto('m05-l3-c1')
      const files = conCambio(c, LIBRO, '@OneToMany(mappedBy = "libro")\n  private List<Prestamo> prestamos = new ArrayList<>();', '@OneToMany(mappedBy="libro")\n  private  List< Prestamo >  prestamos;')
      expect(fallos(c, files).map((k) => k.label)).toEqual([])
    })

    it('acepta @JsonBackReference("...") sin value y en otro orden', () => {
      const c = reto('m05-l3-c3')
      let files = conCambio(c, PRESTAMO, '@JsonBackReference(value = "libro-prestamo")\n  @ManyToOne', '@ManyToOne\n  @JsonBackReference("libro-prestamo")')
      files = { ...files, [LIBRO]: files[LIBRO].replace('@JsonManagedReference(value = "libro-prestamo")', '@JsonManagedReference(value="libro-prestamo")') }
      expect(fallos(c, files).map((k) => k.label)).toEqual([])
    })

    it('acepta Boolean y el punto y coma con espacios en Prestamo', () => {
      const c = reto('m05-l1-c1')
      const files = conCambio(c, PRESTAMO, 'private boolean devuelto;', 'private Boolean devuelto ;')
      expect(fallos(c, files).map((k) => k.label)).toEqual([])
    })
  })

  describe('un comentario con la respuesta no pasa', () => {
    it('// @Entity no cuenta como @Entity', () => {
      const c = reto('m05-l1-c2')
      const files = conCambio(c, PRESTAMO, '@Entity\n', '// @Entity\n')
      expect(mensajes(c, files)).toMatch(/@Entity/)
    })

    it('// @ManyToOne no cuenta como relación', () => {
      const c = reto('m05-l2-c1')
      const files = conCambio(c, PRESTAMO, '  @ManyToOne\n', '  // @ManyToOne\n')
      expect(fallos(c, files).length).toBeGreaterThan(0)
    })

    it('// @OneToMany(mappedBy = "libro") no cuenta', () => {
      const c = reto('m05-l3-c1')
      const files = conCambio(c, LIBRO, '  @OneToMany(mappedBy = "libro")\n', '  // @OneToMany(mappedBy = "libro")\n')
      expect(fallos(c, files).length).toBeGreaterThan(0)
    })
  })

  describe('errores típicos del proyecto de clase', () => {
    it('Prestamo sin @Entity falla con su mensaje', () => {
      const c = reto('m05-l1-c2')
      const mal = conCambio(c, PRESTAMO, '@Entity\n', '')
      expect(fallos(c, mal).map((k) => k.label)).toContain('Prestamo tiene @Entity')
      expect(mensajes(c, mal)).toMatch(/@Entity/)
      // También en el reto final.
      const fin = reto('m05-l3-c3')
      expect(mensajes(fin, conCambio(fin, PRESTAMO, '@Entity\n', ''))).toMatch(/@Entity/)
    })

    it('fechaPrestamo como String falla', () => {
      const c = reto('m05-l1-c1')
      const mal = conCambio(c, PRESTAMO, 'private LocalDate fechaPrestamo;', 'private String fechaPrestamo;')
      expect(mensajes(c, mal)).toMatch(/LocalDate/)
    })

    it('las dos @JoinColumn(name = "id") fallan con su mensaje (reto de arreglar)', () => {
      const c = reto('m05-l2-c3')
      expect(c.files[PRESTAMO].match(/@JoinColumn\(name = "id"\)/g)).toHaveLength(2)
      const labels = fallos(c, c.files).map((k) => k.label)
      expect(labels).toContain('Ninguna @JoinColumn usa name = "id"')
      expect(labels).toContain('Las dos @JoinColumn tienen nombres distintos')
      expect(mensajes(c, c.files)).toMatch(/"id"/)
    })

    it('@JoinColumn(name = "id") en una sola relación también falla', () => {
      const c = reto('m05-l2-c1')
      const mal = conCambio(c, PRESTAMO, '@JoinColumn(name = "libro_id")', '@JoinColumn(name="id")')
      expect(fallos(c, mal).map((k) => k.label)).toContain('Ninguna @JoinColumn usa name = "id"')
    })

    it('repetir libro_id en la columna del socio falla', () => {
      const c = reto('m05-l2-c2')
      const mal = conCambio(c, PRESTAMO, '"socio_id"', '"libro_id"')
      const labels = fallos(c, mal).map((k) => k.label)
      expect(labels).toContain('Las dos @JoinColumn tienen nombres distintos')
      expect(labels).toContain('socio usa @JoinColumn(name = "socio_id")')
    })

    it('mappedBy = "usuario" en Socio (como Video en clase) falla con su mensaje', () => {
      const c = reto('m05-l3-c2')
      expect(c.files[SOCIO]).toMatch(/mappedBy = "usuario"/)
      expect(fallos(c, c.files).map((k) => k.label)).toContain('mappedBy no apunta a "usuario"')
      expect(mensajes(c, c.files)).toMatch(/socio/)
    })

    it('mappedBy con el nombre de la columna o de la clase falla en Libro', () => {
      const c = reto('m05-l3-c1')
      ;['"libro_id"', '"Libro"', '"prestamos"'].forEach((malo) => {
        const mal = conCambio(c, LIBRO, '"libro")', `${malo})`)
        expect(fallos(c, mal).map((k) => k.label), malo).toContain('mappedBy nombra el campo libro de Prestamo')
      })
    })

    it('@JoinColumn también en Libro falla', () => {
      const c = reto('m05-l3-c1')
      const mal = conCambio(c, LIBRO, '  @OneToMany(mappedBy = "libro")\n', '  @OneToMany(mappedBy = "libro")\n  @JoinColumn(name = "libro_id")\n')
      expect(fallos(c, mal).map((k) => k.label)).toContain('Libro no lleva @JoinColumn')
    })

    it('values de referencia que no coinciden fallan', () => {
      const c = reto('m05-l3-c3')
      const mal = conCambio(c, PRESTAMO, '@JsonBackReference(value = "libro-prestamo")', '@JsonBackReference(value = "libro-prestamos")')
      const labels = fallos(c, mal).map((k) => k.label)
      expect(labels).toContain('libro tiene @JsonBackReference(value = "libro-prestamo")')
      expect(mensajes(c, mal)).toMatch(/iguales|igual/)
      // Valores cruzados: cada lado usa el de la otra pareja.
      const cruzado = conCambio(c, PRESTAMO, '@JsonBackReference(value = "libro-prestamo")', '@JsonBackReference(value = "socio-prestamo")')
      expect(fallos(c, cruzado).map((k) => k.label)).toContain('libro tiene @JsonBackReference(value = "libro-prestamo")')
    })

    it('poner @JsonManagedReference en Prestamo (el lado equivocado) falla', () => {
      const c = reto('m05-l3-c3')
      const mal = conCambio(c, PRESTAMO, '@JsonBackReference(value = "socio-prestamo")', '@JsonManagedReference(value = "socio-prestamo")')
      expect(fallos(c, mal).map((k) => k.label)).toContain('Prestamo no usa @JsonManagedReference')
    })
  })

  describe('correcciones de la revisión', () => {
    it('l1-c2: un getter que sigue devolviendo String falla', () => {
      const c = reto('m05-l1-c2')
      const mal = conCambio(c, PRESTAMO, 'public LocalDate getFechaPrestamo()', 'public String getFechaPrestamo()')
      expect(fallos(c, mal).map((k) => k.label)).toContain('Ya no queda String fechaPrestamo')
    })

    it('l3-c3 vuelve a comprobar @ManyToOne, sus import y jakarta', () => {
      const labels = reto('m05-l3-c3').checks.map((k) => k.label)
      ;['libro tiene @ManyToOne', 'socio tiene @ManyToOne', 'Importa jakarta.persistence.ManyToOne', 'Importa jakarta.persistence.JoinColumn', 'Usa jakarta.persistence, no javax'].forEach((l) =>
        expect(labels, l).toContain(l),
      )
      const c = reto('m05-l3-c3')
      const mal = conCambio(c, PRESTAMO, '  @ManyToOne\n  @JoinColumn(name = "socio_id")', '  @JoinColumn(name = "socio_id")')
      expect(fallos(c, mal).map((k) => k.label)).toContain('socio tiene @ManyToOne')
    })

    it('los retos que tocan Prestamo rechazan javax.persistence', () => {
      ;['m05-l1-c1', 'm05-l2-c1', 'm05-l2-c2', 'm05-l2-c3', 'm05-l3-c3'].forEach((id) => {
        const c = reto(id)
        const mal = conCambio(c, PRESTAMO, 'import jakarta.persistence.Column;', 'import javax.persistence.Column;')
        expect(fallos(c, mal).map((k) => k.label), id).toContain('Usa jakarta.persistence, no javax')
      })
    })

    it('acepta comentarios // entre las anotaciones y el campo', () => {
      const c = reto('m05-l2-c1')
      const files = conCambio(c, PRESTAMO, '  @ManyToOne\n  @JoinColumn(name = "libro_id")\n  private Libro libro;', '  @ManyToOne\n  // columna del libro\n  @JoinColumn(name = "libro_id")\n  // el libro prestado\n  private Libro libro;')
      expect(fallos(c, files).map((k) => k.label)).toEqual([])
      const fin = reto('m05-l3-c3')
      const f2 = conCambio(fin, LIBRO, '  @JsonManagedReference(value = "libro-prestamo")\n', '  // pareja libro-prestamo\n  @JsonManagedReference(value = "libro-prestamo")\n  // la lista sí sale en el JSON\n')
      expect(fallos(fin, f2).map((k) => k.label)).toEqual([])
    })

    it('un comentario // @ManyToOne sigue sin contar aunque haya comentarios permitidos', () => {
      const c = reto('m05-l2-c1')
      const mal = conCambio(c, PRESTAMO, '  @ManyToOne\n', '  // nota\n  // @ManyToOne\n')
      expect(fallos(c, mal).map((k) => k.label)).toContain('libro tiene @ManyToOne')
    })

    it('un comentario que menciona @JsonBackReference sin value no hace fallar', () => {
      const c = reto('m05-l3-c3')
      const files = conCambio(c, PRESTAMO, 'public class Prestamo {\n', 'public class Prestamo {\n\n  // aquí van los @JsonBackReference de cada pareja\n')
      expect(fallos(c, files).map((k) => k.label)).toEqual([])
    })

    it('l1-c1 comprueba los import de Id, Table, GeneratedValue, GenerationType y UUID', () => {
      const c = reto('m05-l1-c1')
      const casos = {
        'import jakarta.persistence.Id;\n': 'Importa jakarta.persistence.Id',
        'import jakarta.persistence.Table;\n': 'Importa jakarta.persistence.Table',
        'import jakarta.persistence.GeneratedValue;\n': 'Importa jakarta.persistence.GeneratedValue',
        'import jakarta.persistence.GenerationType;\n': 'Importa jakarta.persistence.GenerationType',
        'import java.util.UUID;\n': 'Importa java.util.UUID',
      }
      Object.entries(casos).forEach(([linea, label]) => {
        expect(fallos(c, conCambio(c, PRESTAMO, linea, '')).map((k) => k.label), label).toContain(label)
      })
      const files = resuelto(c)
      const comodin = files[PRESTAMO].replace(/import jakarta\.persistence\.\w+;\n/g, '').replace('import java.time', 'import jakarta.persistence.*;\nimport java.time')
      expect(fallos(c, { ...files, [PRESTAMO]: comodin }).map((k) => k.label)).toEqual([])
    })

    it('l3-c1 comprueba que Libro conserva @Entity', () => {
      const c = reto('m05-l3-c1')
      expect(fallos(c, conCambio(c, LIBRO, '@Entity\n', '')).map((k) => k.label)).toContain('Libro tiene @Entity')
    })

    it('la lección 3 avisa del error al recibir datos y de que el préstamo no muestra libro ni socio', () => {
      const l3 = modulo.lessons[2].explanation
      expect(l3).toMatch(/da error al recibir datos/)
      expect(l3).toMatch(/JSON de un préstamo no mostrará su libro ni su socio[\s\S]*se resolverá más adelante/)
      expect(modulo.lessons[0].explanation).not.toMatch(/no podría ordenar/)
    })
  })

  it('el pom.xml es el pom.xml base de docs/temario.md', () => {
    const doc = readFileSync('docs/temario.md', 'utf8')
    const base = doc.match(/```xml\n([\s\S]*?)```/)[1]
    retos.forEach((c) => expect(c.files['/pom.xml'], c.id).toBe(base))
    retos.forEach((c) => expect(c.solution['/pom.xml'], c.id).toBeUndefined())
  })

  it('no usa conceptos de módulos posteriores', () => {
    const todo = JSON.stringify(modulo.lessons.map((l) => [l.explanation, l.challenges.map((c) => [c.instructions, c.hints, c.files, c.solution, c.checks])]))
    expect(todo).not.toMatch(/JpaRepository|@Repository|Repositorio|findBy|existsBy|@Query|Optional|@Service|@RestController|@Controller|@GetMapping|@PostMapping|@Autowired|ResponseEntity|@Valid|@NotBlank|starter-validation|FetchType|cascade|orphanRemoval/)
  })
})
