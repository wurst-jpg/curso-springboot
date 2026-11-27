// Copia texto al portapapeles sin red. Devuelve true si lo logró.
// 1) navigator.clipboard  2) textarea oculto + execCommand('copy').
export async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // se prueba el plan B
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  area.setAttribute('aria-hidden', 'true')
  area.style.position = 'fixed'
  area.style.opacity = '0'
  area.style.pointerEvents = 'none'
  document.body.appendChild(area)
  try {
    area.select()
    return typeof document.execCommand === 'function' && document.execCommand('copy') === true
  } catch {
    return false
  } finally {
    area.remove()
  }
}
