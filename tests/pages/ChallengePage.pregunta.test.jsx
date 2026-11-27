import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import ChallengePage from '../../src/pages/ChallengePage.jsx'
import { ProgressProvider } from '../../src/progress/ProgressContext.jsx'

vi.mock('../../src/sandbox/useCheckRunner.js', () => ({
  useCheckRunner: () => ({ run: vi.fn(), ready: false }),
}))
vi.mock('../../src/content/courseConfig.js', () => ({ default: { mode: 'code' } }))
vi.mock('../../src/content/course.js', async (importOriginal) => {
  const actual = await importOriginal()
  const LIBRO = '/src/main/java/Libro.java'
  const fake = [
    {
      id: 'm00',
      title: 'Módulo Java',
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
              hints: ['PISTA_UNO', 'PISTA_DOS'],
              solution: { [LIBRO]: 'SOLUCION_SECRETA' },
              checks: [{ type: 'file-includes', path: LIBRO, pattern: 'titulo', label: 'Libro tiene titulo' }],
            },
          ],
        },
      ],
    },
  ]
  return { ...actual, default: fake }
})
vi.mock('@codesandbox/sandpack-react', async () => {
  const { createSandpackMock } = await import('./sandpackMock.jsx')
  return createSandpackMock()
})

let copied
beforeEach(() => localStorage.clear())

// userEvent.setup() instala su propio portapapeles: el falso se pone después.
function mockClipboard() {
  copied = null
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText: vi.fn(async (t) => void (copied = t)) },
    configurable: true,
  })
}

function renderPage() {
  return render(
    <ProgressProvider>
      <MemoryRouter initialEntries={['/reto/m00-l1-c1']}>
        <Routes>
          <Route path="/reto/:challengeId" element={<ChallengePage />} />
        </Routes>
      </MemoryRouter>
    </ProgressProvider>,
  )
}

async function ask(user, doubt) {
  await user.click(screen.getByRole('button', { name: 'Pregúntale a Claude' }))
  if (doubt) await user.type(screen.getByLabelText('¿Qué no entiendes? (opcional)'), doubt)
  await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
  await screen.findByText(/¡Copiado!/)
}

test('copia el reto, el código en vivo y sin resultados si no se comprobó', async () => {
  const user = userEvent.setup()
  mockClipboard()
  renderPage()
  const editor = screen.getByLabelText('Editor de código')
  await user.type(editor, ' // mi cambio')
  await ask(user, 'qué es una clase')
  expect(copied).toContain('Estoy haciendo el Curso de Spring Boot')
  expect(copied).toContain('Comprobar solo revisa el texto')
  expect(copied).toContain('qué es una clase')
  expect(copied).toContain('Módulo Java')
  expect(copied).toContain('Una clase es un molde.')
  expect(copied).toContain('// mi cambio')
  expect(copied).toContain('### /pom.xml')
  expect(copied).not.toContain('package.json')
  expect(copied).toContain('Todavía no he pulsado Comprobar.')
  expect(copied).toContain('Pistas que ya abrí: 0 de 2')
})

test('incluye resultados de Comprobar y solo las pistas abiertas, nunca la solución', async () => {
  const user = userEvent.setup()
  mockClipboard()
  renderPage()
  await user.click(screen.getByRole('button', { name: 'Pista' }))
  await user.click(screen.getByRole('button', { name: 'Comprobar' }))
  await screen.findByText('Todavía falta algo en /src/main/java/Libro.java.')
  await ask(user)
  expect(copied).toContain('❌ Libro tiene titulo')
  expect(copied).toContain('Pistas que ya abrí: 1 de 2')
  expect(copied).toContain('PISTA_UNO')
  expect(copied).not.toContain('PISTA_DOS')
  expect(copied).not.toContain('SOLUCION_SECRETA')
  expect(copied).toContain('No escribí una duda concreta')
})
