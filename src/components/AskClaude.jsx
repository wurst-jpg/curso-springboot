import { useEffect, useRef, useState } from 'react'
import { copyText } from '../ask/copyText.js'
import { LONG_TEXT_LIMIT } from '../ask/buildQuestion.js'

const CLAUDE_URL = 'https://claude.ai/new'
const focusRing = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400'
const button = `rounded-lg px-4 py-2 font-semibold ${focusRing}`

// Botón + panel para preguntarle a Claude: arma el texto, lo copia y el alumno lo pega en claude.ai.
// `buildText(duda)` devuelve el texto completo. No hay red ni claves; el enlace va sin contenido.
export default function AskClaude({ buildText }) {
  const [open, setOpen] = useState(false)
  const [doubt, setDoubt] = useState('')
  const [state, setState] = useState(null) // { copied, text }
  const manualRef = useRef(null)

  const manual = state && !state.copied
  useEffect(() => {
    if (manual) {
      manualRef.current?.focus()
      manualRef.current?.select()
    }
  }, [manual])

  async function copy() {
    const text = buildText(doubt)
    const copied = await copyText(text)
    setState({ copied, text })
  }

  return (
    <section aria-label="Preguntar a Claude" className="flex flex-col gap-3">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`${button} self-start bg-violet-700 text-white hover:bg-violet-600`}
      >
        Pregúntale a Claude
      </button>
      {open && (
        <div className="flex flex-col gap-3 rounded-lg border border-violet-500/60 bg-slate-800 p-4">
          <label htmlFor="ask-doubt" className="font-semibold text-slate-100">
            ¿Qué no entiendes? (opcional)
          </label>
          <textarea
            id="ask-doubt"
            rows={3}
            value={doubt}
            onChange={(e) => setDoubt(e.target.value)}
            className="rounded-md border border-slate-600 bg-slate-900 p-2 text-slate-100"
          />
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" onClick={copy} className={`${button} bg-sky-500 text-slate-950 hover:bg-sky-400`}>
              Copiar pregunta
            </button>
            <a
              href={CLAUDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className={`text-sky-300 underline hover:text-sky-200 ${focusRing}`}
            >
              Abrir Claude (se abre en otra pestaña)
            </a>
          </div>
          <div role="status" className="flex flex-col gap-2">
            {state?.copied && <p className="text-emerald-300">¡Copiado! Ahora pégalo en Claude (Ctrl+V)</p>}
            {state && !state.copied && (
              <>
                <p className="text-orange-200">
                  No pude copiarlo solo. El texto está aquí abajo, ya seleccionado: cópialo con Ctrl+C y pégalo en Claude.
                </p>
                <textarea
                  ref={manualRef}
                  readOnly
                  aria-label="Texto para copiar a mano"
                  rows={8}
                  value={state.text}
                  className="rounded-md border border-slate-600 bg-slate-900 p-2 font-mono text-sm text-slate-100"
                />
              </>
            )}
            {state && state.text.length > LONG_TEXT_LIMIT && (
              <p className="text-orange-200">
                El texto es muy largo. Si Claude no lo acepta completo, pégalo en partes.
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
