import { render, screen } from '@testing-library/react'
import { SandpackCodeEditor, SandpackProvider, useSandpack } from '@codesandbox/sandpack-react'
import { buildCodeOnlySetup } from '../../src/sandbox/buildSandbox.js'
import { ADDITIONAL_LANGUAGES } from '../../src/editor/languages.js'

// Sandpack REAL (sin simulación): en modo solo código no debe crear iframe ni empaquetador.
function Estado() {
  const { sandpack } = useSandpack()
  return (
    <p data-testid="estado">
      {sandpack.status}|{Object.keys(sandpack.clients).length}|{sandpack.activeFile}
    </p>
  )
}

test('con el setup de solo código, Sandpack no crea iframe ni cliente del empaquetador', async () => {
  const setup = buildCodeOnlySetup({
    '/pom.xml': '<project/>',
    '/src/main/java/App.java': 'public class App {}',
  })
  render(
    <SandpackProvider
      template={setup.template}
      files={setup.files}
      customSetup={setup.customSetup}
      options={{ ...setup.options, activeFile: '/src/main/java/App.java' }}
    >
      <SandpackCodeEditor showRunButton={false} additionalLanguages={ADDITIONAL_LANGUAGES} />
      <Estado />
    </SandpackProvider>,
  )
  await new Promise((r) => setTimeout(r, 100))
  expect(document.querySelector('iframe')).toBeNull()
  expect(screen.getByTestId('estado').textContent).toBe('idle|0|/src/main/java/App.java')
  expect(screen.queryByRole('button', { name: /run/i })).not.toBeInTheDocument()
})
