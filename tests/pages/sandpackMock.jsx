// Sandpack falso para pruebas de página: guarda los archivos en estado y ofrece la misma API
// que usa la plataforma. `record` (opcional) recibe las props del proveedor y del editor.
export async function createSandpackMock(record = { provider: [], editor: [] }) {
  const React = await import('react')
  const Ctx = React.createContext(null)
  const toEntry = (v) => (typeof v === 'string' ? { code: v } : v)
  function SandpackProvider(props) {
    const { files, template, options = {}, children } = props
    record.provider.push(props)
    const [state, setState] = React.useState(() => ({
      files: {
        // La plantilla "react" añade sus propios archivos; sin plantilla no hay ninguno.
        ...(template ? { '/App.js': { code: 'plantilla' }, '/package.json': { code: '{}' } } : {}),
        ...Object.fromEntries(Object.entries(files).map(([p, v]) => [p, toEntry(v)])),
      },
      activeFile: options.activeFile ?? Object.keys(files)[0],
    }))
    const sandpack = {
      ...state,
      updateFile: (path, code) => setState((s) => ({ ...s, files: { ...s.files, [path]: { code } } })),
      addFile: (path, code = '') => setState((s) => ({ ...s, files: { ...s.files, [path]: { code } }, activeFile: path })),
      deleteFile: (path) =>
        setState((s) => {
          const next = { ...s.files }
          delete next[path]
          return { ...s, files: next }
        }),
      setActiveFile: (path) => setState((s) => ({ ...s, activeFile: path })),
      openFile: (path) => setState((s) => ({ ...s, activeFile: path })),
    }
    return <Ctx.Provider value={{ sandpack, listen: () => () => {}, dispatch: () => {} }}>{children}</Ctx.Provider>
  }
  const useSandpack = () => React.useContext(Ctx)
  function SandpackCodeEditor(props) {
    record.editor.push(props)
    const { sandpack } = useSandpack()
    return (
      <textarea
        aria-label="Editor de código"
        value={sandpack.files[sandpack.activeFile]?.code ?? ''}
        onChange={(e) => sandpack.updateFile(sandpack.activeFile, e.target.value)}
      />
    )
  }
  const SandpackPreview = React.forwardRef(function SandpackPreview(_props, ref) {
    React.useImperativeHandle(ref, () => ({ getClient: () => null, clientId: 'x' }))
    return <div data-testid="preview" />
  })
  return { SandpackProvider, useSandpack, SandpackCodeEditor, SandpackPreview }
}
