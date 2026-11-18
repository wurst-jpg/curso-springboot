import courseConfig from './courseConfig.js'

export const COURSE_MODES = ['sandbox', 'code']

/** 'code' si el curso es de solo código; cualquier otro valor cuenta como 'sandbox'. */
export function courseMode(config = courseConfig) {
  return config?.mode === 'code' ? 'code' : 'sandbox'
}

/** ¿Este reto va sin vista previa? Sí si el curso es de solo código o el reto pone `preview: false`. */
export function isCodeOnly(challenge, config = courseConfig) {
  return courseMode(config) === 'code' || challenge?.preview === false
}
