import { render, screen, within } from '@testing-library/react'
import FileTabsBar from '../../src/components/FileTabsBar.jsx'

const noop = () => {}

describe('FileTabsBar', () => {
  it('muestra solo el nombre del archivo y la ruta completa al pasar el ratón', () => {
    const paths = [
      '/pom.xml',
      '/src/main/java/com/biblioteca/models/Libro.java',
      '/src/main/java/com/biblioteca/App.java',
    ]
    render(<FileTabsBar paths={paths} activeFile={paths[1]} onSelect={noop} onCreate={noop} onDelete={noop} codeOnly />)
    const tabs = screen.getByRole('navigation', { name: /archivos/i })
    const libro = within(tabs).getByRole('button', { name: 'Libro.java' })
    expect(libro).toHaveAttribute('title', '/src/main/java/com/biblioteca/models/Libro.java')
    expect(libro).toHaveAttribute('aria-current', 'page')
    expect(within(tabs).getByRole('button', { name: 'pom.xml' })).toHaveAttribute('title', '/pom.xml')
    expect(within(tabs).getByRole('button', { name: 'Borrar Libro.java' })).toBeInTheDocument()
  })

  it('si dos archivos se llaman igual, muestra también su carpeta para distinguirlos', () => {
    const paths = ['/src/main/java/a/models/Libro.java', '/src/main/java/a/dto/Libro.java']
    render(<FileTabsBar paths={paths} activeFile={paths[0]} onSelect={noop} onCreate={noop} onDelete={noop} codeOnly />)
    const tabs = screen.getByRole('navigation', { name: /archivos/i })
    expect(within(tabs).getByRole('button', { name: 'models/Libro.java' })).toBeInTheDocument()
    expect(within(tabs).getByRole('button', { name: 'dto/Libro.java' })).toBeInTheDocument()
  })

  it('en el curso de React main.jsx sigue sin botón de borrar', () => {
    const paths = ['/src/main.jsx', '/src/components/Saludo.jsx']
    render(<FileTabsBar paths={paths} activeFile={paths[0]} onSelect={noop} onCreate={noop} onDelete={noop} />)
    const tabs = screen.getByRole('navigation', { name: /archivos/i })
    expect(within(tabs).queryByRole('button', { name: /borrar main\.jsx/i })).not.toBeInTheDocument()
    expect(within(tabs).getByRole('button', { name: 'Saludo.jsx' })).toHaveAttribute('title', '/src/components/Saludo.jsx')
  })

  it('una lista larga de pestañas puede bajar de línea (no se sale del ancho)', () => {
    const paths = Array.from({ length: 20 }, (_, i) => `/src/main/java/com/biblioteca/Clase${i}.java`)
    render(<FileTabsBar paths={paths} activeFile={paths[0]} onSelect={noop} onCreate={noop} onDelete={noop} codeOnly />)
    expect(screen.getByRole('navigation', { name: /archivos/i }).className).toMatch(/flex-wrap/)
  })
})
