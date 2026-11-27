import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AskClaude from '../../src/components/AskClaude.jsx'

const buildText = (duda) => `TEXTO[${duda}]`

function setClipboard(impl) {
  Object.defineProperty(navigator, 'clipboard', { value: impl, configurable: true })
}

afterEach(() => {
  setClipboard(undefined)
  delete document.execCommand
})

async function openPanel(user) {
  await user.click(screen.getByRole('button', { name: 'Pregúntale a Claude' }))
}

describe('AskClaude', () => {
  it('el panel está cerrado hasta pulsar el botón', async () => {
    const user = userEvent.setup()
    render(<AskClaude buildText={buildText} />)
    expect(screen.queryByLabelText('¿Qué no entiendes? (opcional)')).toBeNull()
    await openPanel(user)
    expect(screen.getByLabelText('¿Qué no entiendes? (opcional)')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pregúntale a Claude' })).toHaveAttribute('aria-expanded', 'true')
  })

  it('copia con el portapapeles y avisa', async () => {
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue()
    render(<AskClaude buildText={buildText} />)
    setClipboard({ writeText })
    await openPanel(user)
    await user.type(screen.getByLabelText('¿Qué no entiendes? (opcional)'), 'hola')
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    expect(writeText).toHaveBeenCalledWith('TEXTO[hola]')
    expect(await screen.findByText('¡Copiado! Ahora pégalo en Claude (Ctrl+V)')).toBeInTheDocument()
  })

  it('el enlace a Claude no lleva contenido en la URL', async () => {
    const user = userEvent.setup()
    render(<AskClaude buildText={buildText} />)
    await openPanel(user)
    const link = screen.getByRole('link', { name: /Abrir Claude/ })
    expect(link).toHaveAttribute('href', 'https://claude.ai/new')
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('si falla el portapapeles usa execCommand', async () => {
    const user = userEvent.setup()
    render(<AskClaude buildText={buildText} />)
    setClipboard({ writeText: vi.fn().mockRejectedValue(new Error('no')) })
    document.execCommand = vi.fn().mockReturnValue(true)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    expect(await screen.findByText('¡Copiado! Ahora pégalo en Claude (Ctrl+V)')).toBeInTheDocument()
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })

  it('si todo falla muestra el texto para copiarlo a mano', async () => {
    const user = userEvent.setup()
    render(<AskClaude buildText={buildText} />)
    setClipboard(undefined)
    document.execCommand = vi.fn().mockReturnValue(false)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    const manual = await screen.findByLabelText('Texto para copiar a mano')
    expect(manual).toHaveAttribute('readonly')
    expect(manual).toHaveValue('TEXTO[]')
    expect(screen.getByText(/No pude copiarlo solo/)).toBeInTheDocument()
    await waitFor(() => expect(manual).toHaveFocus())
    expect(screen.queryByText('¡Copiado! Ahora pégalo en Claude (Ctrl+V)')).toBeNull()
    // el cuadro grande va fuera de la zona de avisos (role="status")
    expect(screen.getByRole('status')).not.toContainElement(manual)
  })

  it('al cambiar la duda se borra el aviso de copiado', async () => {
    const user = userEvent.setup()
    setClipboard({ writeText: vi.fn().mockResolvedValue() })
    render(<AskClaude buildText={buildText} />)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    await screen.findByText(/¡Copiado!/)
    await user.type(screen.getByLabelText('¿Qué no entiendes? (opcional)'), 'a')
    expect(screen.queryByText(/¡Copiado!/)).toBeNull()
  })

  it('cada intento fallido vuelve a enfocar el texto a mano', async () => {
    const user = userEvent.setup()
    render(<AskClaude buildText={buildText} />)
    setClipboard(undefined)
    document.execCommand = vi.fn().mockReturnValue(false)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    const manual = await screen.findByLabelText('Texto para copiar a mano')
    await waitFor(() => expect(manual).toHaveFocus())
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    await waitFor(() => expect(screen.getByLabelText('Texto para copiar a mano')).toHaveFocus())
  })

  it('el botón apunta al panel con aria-controls', async () => {
    const user = userEvent.setup()
    render(<AskClaude buildText={buildText} />)
    await openPanel(user)
    const id = screen.getByRole('button', { name: 'Pregúntale a Claude' }).getAttribute('aria-controls')
    expect(document.getElementById(id)).toContainElement(screen.getByLabelText('¿Qué no entiendes? (opcional)'))
  })

  it('avisa si el texto es muy largo', async () => {
    const user = userEvent.setup()
    setClipboard({ writeText: vi.fn().mockResolvedValue() })
    render(<AskClaude buildText={() => 'x'.repeat(60001)} />)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    expect(await screen.findByText(/muy largo/)).toBeInTheDocument()
  })

  it('no avisa si el texto es corto', async () => {
    const user = userEvent.setup()
    setClipboard({ writeText: vi.fn().mockResolvedValue() })
    render(<AskClaude buildText={buildText} />)
    await openPanel(user)
    await user.click(screen.getByRole('button', { name: 'Copiar pregunta' }))
    await screen.findByText(/¡Copiado!/)
    expect(screen.queryByText(/muy largo/)).toBeNull()
  })
})
