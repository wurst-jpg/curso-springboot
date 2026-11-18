import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import ChallengePage from '../../src/pages/ChallengePage.jsx'
import { ProgressProvider } from '../../src/progress/ProgressContext.jsx'
import { PROGRESS_KEY } from '../../src/progress/progress.js'
import { codeKey } from '../../src/progress/code.js'

// Curso de prueba en modo solo código (como el futuro curso de Spring Boot).
const runMock = vi.hoisted(() => vi.fn())
vi.mock('../../src/sandbox/useCheckRunner.js', () => ({
  useCheckRunner: () => ({ run: runMock, ready: false }),
}))
vi.mock('../../src/content/courseConfig.js', () => ({ default: { mode: 'code' } }))

const LIBRO = '/src/main/java/com/biblioteca/models/Libro.java'
vi.mock('../../src/content/course.js', async (importOriginal) => {
  const actual = await importOriginal()
  const LIBRO = '/src/main/java/com/biblioteca/models/Libro.java'
  const fake = [
    {
      id: 'm00',
      title: 'Java',
      summary: 's',
      lessons: [
        {
          id: 'm00-l1',
          title: 'Clases',
          explanation: 'Una clase es un molde.',
          challenges: [
            {
              id: 'm00-l1-c1',
              title: 'Tu primera clase',
              instructions: 'Añade el campo titulo.',
              files: { '/pom.xml': '<project/>', [LIBRO]: 'public class Libro {\n}' },
              activeFile: LIBRO,
              solution: { [LIBRO]: 'public class Libro {\n  private String titulo;\n}' },
              checks: [
                { type: 'file-includes', path: LIBRO, pattern: 'private\\s+String\\s+titulo', label: 'Libro tiene titulo' },
                { type: 'file-excludes', pattern: 'System\\.out', label: 'No imprime por consola' },
              ],
            },
            {
              id: 'm00-l1-c2',
              title: 'Un getter',
              instructions: 'Añade getTitulo.',
              startFrom: 'previous',
              activeFile: LIBRO,
              solution: {
                [LIBRO]: 'public class Libro {\n  private String titulo;\n  public String getTitulo() { return titulo; }\n}',
              },
              checks: [{ type: 'file-includes', path: LIBRO, pattern: 'getTitulo', label: 'Tiene getTitulo' }],
            },
          ],
        },
      ],
    },
  ]
  return { ...actual, default: fake }
})

const sandpackProps = vi.hoisted(() => ({ provider: [], editor: [] }))
vi.mock('@codesandbox/sandpack-react', async () => {
  const { createSandpackMock } = await import('./sandpackMock.jsx')
  return createSandpackMock(sandpackProps)
})

function renderAt(path) {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/reto/:challengeId" element={<ChallengePage />} />
          <Route path="/" element={<p>Mapa del curso</p>} />
        </Routes>
      </MemoryRouter>
    </ProgressProvider>,
  )
}

const storedProgress = () => JSON.parse(localStorage.getItem(PROGRESS_KEY))

beforeEach(() => {
  localStorage.clear()
  runMock.mockReset()
  sandpackProps.provider.length = 0
  sandpackProps.editor.length = 0
})

test('no hay vista previa: ni iframe, ni zona de vista previa, ni aviso de "Preparando"', () => {
  renderAt('/reto/m00-l1-c1')
  expect(screen.queryByTestId('preview')).not.toBeInTheDocument()
  expect(document.querySelector('iframe')).toBeNull()
  expect(screen.queryByRole('region', { name: 'Vista previa' })).not.toBeInTheDocument()
  expect(screen.queryByText(/Preparando la vista previa/)).not.toBeInTheDocument()
  expect(screen.getByRole('region', { name: 'Comprobaciones' })).toBeInTheDocument()
})

test('Sandpack se configura sin plantilla y sin arrancar (autorun false); el editor no muestra "Run"', () => {
  renderAt('/reto/m00-l1-c1')
  const provider = sandpackProps.provider.at(-1)
  expect(provider.template).toBeUndefined()
  expect(provider.options.autorun).toBe(false)
  expect(Object.keys(provider.files)).not.toContain('/src/__harness__.js')
  const editor = sandpackProps.editor.at(-1)
  expect(editor.showRunButton).toBe(false)
  expect(editor.additionalLanguages.map((l) => l.name)).toEqual(expect.arrayContaining(['java', 'xml']))
})

test('las pestañas muestran el nombre del archivo Java y el pom.xml, sin archivos técnicos', () => {
  renderAt('/reto/m00-l1-c1')
  const tabs = screen.getByRole('navigation', { name: /archivos/i })
  expect(tabs).toHaveTextContent('Libro.java')
  expect(tabs).toHaveTextContent('pom.xml')
  expect(tabs).not.toHaveTextContent('package.json')
  expect(screen.getByLabelText('Editor de código')).toHaveValue('public class Libro {\n}')
})

test('"Comprobar" da los resultados de archivos al instante, sin vista previa', async () => {
  const user = userEvent.setup()
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('Todavía falta algo en ' + LIBRO + '.')).toBeInTheDocument()
  expect(runMock).not.toHaveBeenCalled()
  expect(screen.queryByText(/vista previa todavía se está preparando/)).not.toBeInTheDocument()

  const editor = screen.getByLabelText('Editor de código')
  await user.clear(editor)
  await user.type(editor, 'public class Libro {{ private String titulo; }')
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('¡Reto superado!')).toBeInTheDocument()
  expect(runMock).not.toHaveBeenCalled()
  expect(storedProgress().completed['m00-l1-c1']).toBeTruthy()
})

test('"Ver solución" funciona en modo solo código', async () => {
  const user = userEvent.setup()
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Ver solución' }))
  await user.click(screen.getByRole('button', { name: 'Sí, ver la solución' }))
  expect(screen.getByLabelText('Editor de código')).toHaveValue('public class Libro {\n  private String titulo;\n}')
  expect(storedProgress().solutionViewed['m00-l1-c1']).toBe(true)
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('¡Reto superado!')).toBeInTheDocument()
})

test('startFrom "previous" arranca con el código guardado del reto anterior y su solución se aplica', async () => {
  const user = userEvent.setup()
  localStorage.setItem(codeKey('m00-l1-c1'), JSON.stringify({ '/pom.xml': '<project/>', [LIBRO]: 'class Libro { private String titulo; /* mío */ }' }))
  renderAt('/reto/m00-l1-c2')
  expect(screen.getByLabelText('Editor de código')).toHaveValue('class Libro { private String titulo; /* mío */ }')
  expect(screen.getByRole('button', { name: 'Empezar desde versión limpia' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Ver solución' }))
  await user.click(screen.getByRole('button', { name: 'Sí, ver la solución' }))
  expect(screen.getByLabelText('Editor de código')).toHaveValue(
    'public class Libro {\n  private String titulo;\n  public String getTitulo() { return titulo; }\n}',
  )
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  expect(await screen.findByText('¡Reto superado!')).toBeInTheDocument()
})

test('"Nuevo archivo" acepta rutas Java desde la raíz', async () => {
  const user = userEvent.setup()
  renderAt('/reto/m00-l1-c1')
  await user.click(screen.getByRole('button', { name: 'Nuevo archivo' }))
  await user.type(screen.getByLabelText(/nombre del archivo/i), 'src/main/java/com/biblioteca/App.java')
  await user.click(screen.getByRole('button', { name: 'Crear' }))
  const tab = screen.getByRole('button', { name: 'App.java' })
  expect(tab).toHaveAttribute('title', '/src/main/java/com/biblioteca/App.java')
})
