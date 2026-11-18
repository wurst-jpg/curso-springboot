import { useState } from 'react'
import { newFileExample, normalizeNewPath } from '../sandbox/editorFiles.js'

const PROTECTED = '/src/main.jsx'
const baseName = (path) => path.slice(path.lastIndexOf('/') + 1)
const parentAndName = (path) => path.split('/').slice(-2).join('/')

// En la pestaña va solo el nombre (Libro.java); la ruta completa sale al pasar el ratón.
// Si dos archivos se llaman igual, se añade su carpeta (models/Libro.java, dto/Libro.java).
function tabNames(paths) {
  const count = new Map()
  for (const p of paths) count.set(baseName(p), (count.get(baseName(p)) ?? 0) + 1)
  return new Map(paths.map((p) => [p, count.get(baseName(p)) > 1 ? parentAndName(p) : baseName(p)]))
}

const smallButton =
  'rounded-md px-3 py-1 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-sky-400'

export default function FileTabsBar({ paths, activeFile, onSelect, onCreate, onDelete, codeOnly = false }) {
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  function closeForm() {
    setCreating(false)
    setName('')
    setError(null)
  }

  function submit(event) {
    event.preventDefault()
    const result = normalizeNewPath(name, paths, { codeOnly })
    if (result.error) {
      setError(result.error)
      return
    }
    onCreate(result.path)
    closeForm()
  }

  const names = tabNames(paths)
  const nameOf = (path) => names.get(path) ?? baseName(path)

  return (
    <div className="flex flex-col gap-2">
      <nav aria-label="Archivos" className="flex flex-wrap items-center gap-1">
        {paths.map((path) => {
          const active = path === activeFile
          const name = nameOf(path)
          return (
            <span
              key={path}
              className={`flex items-center rounded-t-md border-b-2 ${
                active ? 'border-sky-400 bg-slate-800 text-white' : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <button
                type="button"
                aria-current={active ? 'page' : undefined}
                onClick={() => onSelect(path)}
                title={path}
                className="px-3 py-1.5 font-mono text-sm"
              >
                {name}
              </button>
              {(codeOnly || path !== PROTECTED) && (
                <button
                  type="button"
                  aria-label={`Borrar ${name}`}
                  title={`Borrar ${path}`}
                  onClick={() => setToDelete(path)}
                  className="mr-1 rounded px-1.5 text-slate-500 hover:bg-rose-900/60 hover:text-rose-100"
                >
                  ×
                </button>
              )}
            </span>
          )
        })}
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className={`${smallButton} ml-1 border border-dashed border-slate-500 text-slate-300 hover:border-sky-400 hover:text-sky-200`}
          >
            Nuevo archivo
          </button>
        )}
      </nav>

      {creating && (
        <form onSubmit={submit} className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-800 p-3">
          <label htmlFor="nuevo-archivo" className="text-sm text-slate-300">
            Nombre del archivo
          </label>
          <input
            id="nuevo-archivo"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={newFileExample(codeOnly)}
            className="rounded-md border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-sm text-slate-100"
          />
          <button type="submit" className={`${smallButton} bg-sky-600 text-white hover:bg-sky-500`}>
            Crear
          </button>
          <button type="button" onClick={closeForm} className={`${smallButton} text-slate-300 hover:bg-slate-700`}>
            Cancelar
          </button>
          {error && (
            <p role="alert" className="w-full text-sm text-rose-300">
              {error}
            </p>
          )}
        </form>
      )}

      {toDelete && (
        <div role="alertdialog" aria-label="Confirmar borrado" className="flex flex-wrap items-center gap-2 rounded-lg bg-rose-950/60 p-3">
          <p className="text-sm text-rose-100">
            ¿Borrar <span className="font-mono">{toDelete}</span>? Lo que escribiste en él se perderá.
          </p>
          <button
            type="button"
            onClick={() => {
              onDelete(toDelete)
              setToDelete(null)
            }}
            className={`${smallButton} bg-rose-600 text-white hover:bg-rose-500`}
          >
            Sí, borrar
          </button>
          <button type="button" onClick={() => setToDelete(null)} className={`${smallButton} text-slate-300 hover:bg-slate-700`}>
            Cancelar
          </button>
        </div>
      )}
    </div>
  )
}
