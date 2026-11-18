import { editorFiles, normalizeNewPath } from '../../src/sandbox/editorFiles.js'
import { CODE_PACKAGE_JSON_NAME } from '../../src/sandbox/buildSandbox.js'

test('editorFiles deja solo los archivos del alumno como texto plano', () => {
  const files = {
    '/App.js': { code: 'plantilla' },
    '/package.json': { code: '{}' },
    '/public/index.html': { code: '<html>', hidden: true },
    '/src/__harness__.js': { code: 'h', hidden: true },
    '/src/main.jsx': { code: 'main' },
    '/src/App.jsx': { code: 'app' },
    '/src/estilos.css': 'css',
  }
  expect(editorFiles(files)).toEqual({
    '/src/main.jsx': 'main',
    '/src/App.jsx': 'app',
    '/src/estilos.css': 'css',
  })
})

describe('normalizeNewPath', () => {
  const existing = ['/src/main.jsx', '/src/App.jsx']

  test.each([
    ['Saludo.jsx', '/src/Saludo.jsx'],
    ['  Saludo.jsx  ', '/src/Saludo.jsx'],
    ['/Saludo.jsx', '/src/Saludo.jsx'],
    ['src/Saludo.jsx', '/src/Saludo.jsx'],
    ['./src/Saludo.jsx', '/src/Saludo.jsx'],
    ['/src/components/Boton.js', '/src/components/Boton.js'],
    ['estilos.css', '/src/estilos.css'],
  ])('%s → %s', (input, path) => {
    expect(normalizeNewPath(input, existing)).toEqual({ path })
  })

  test.each([
    ['', /escribe un nombre/i],
    ['   ', /escribe un nombre/i],
    ['/src/', /escribe un nombre/i],
    ['notas.txt', /\.jsx/],
    ['Saludo', /\.jsx/],
    ['App.jsx', /ya existe/i],
    ['/src/main.jsx', /ya existe/i],
    ['__harness__.js', /ya existe|reservado/i],
    ['a/../b.jsx', /no es válido/i],
    ['mi archivo.jsx', /no es válido/i],
  ])('rechaza %j', (input, error) => {
    expect(normalizeNewPath(input, existing).error).toMatch(error)
  })
})

describe('modo solo código', () => {
  test('editorFiles con codeOnly deja todos los archivos del reto (también fuera de /src) y quita el package.json técnico', () => {
    const files = {
      '/pom.xml': { code: '<project/>' },
      '/src/main/java/com/biblioteca/App.java': { code: 'class App {}' },
      '/src/main/resources/application.properties': 'server.port=8080',
      '/package.json': { code: JSON.stringify({ name: CODE_PACKAGE_JSON_NAME, main: '', dependencies: {} }) },
    }
    expect(editorFiles(files, { codeOnly: true })).toEqual({
      '/pom.xml': '<project/>',
      '/src/main/java/com/biblioteca/App.java': 'class App {}',
      '/src/main/resources/application.properties': 'server.port=8080',
    })
  })

  test('editorFiles con codeOnly conserva un package.json propio del reto', () => {
    const files = { '/package.json': { code: '{"name":"mio"}' }, '/index.js': { code: 'x' } }
    expect(editorFiles(files, { codeOnly: true })).toEqual({ '/package.json': '{"name":"mio"}', '/index.js': 'x' })
  })

  const existing = ['/pom.xml', '/src/main/java/App.java']
  test.each([
    ['src/main/java/com/biblioteca/models/Libro.java', '/src/main/java/com/biblioteca/models/Libro.java'],
    ['/src/main/resources/application.properties', '/src/main/resources/application.properties'],
    ['otro.xml', '/otro.xml'],
    ['src/App.jsx', '/src/App.jsx'],
  ])('normalizeNewPath con codeOnly: %s → %s (la ruta es desde la raíz)', (input, path) => {
    expect(normalizeNewPath(input, existing, { codeOnly: true })).toEqual({ path })
  })

  test.each([
    ['pom.xml', /ya existe/i],
    ['src/main/java/App.java', /ya existe/i],
    ['programa.exe', /\.java/],
    ['', /escribe un nombre/i],
  ])('normalizeNewPath con codeOnly rechaza %j', (input, error) => {
    expect(normalizeNewPath(input, existing, { codeOnly: true }).error).toMatch(error)
  })

  test('sin codeOnly, .java no se permite (curso de React igual que siempre)', () => {
    expect(normalizeNewPath('Libro.java', ['/src/main.jsx']).error).toMatch(/\.jsx/)
  })
})
