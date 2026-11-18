# Guía para escribir módulos del curso

## Archivos y ids

- Un módulo = un archivo `src/content/modules/mNN-slug.js` (por ejemplo `m03-estado.js`). Se descubre solo: no hay que registrarlo en ningún sitio.
- El orden del curso es el orden alfabético del nombre de archivo (`m00-…`, `m01-…`, … `m11-…`).
- Ids: módulo `mNN`, lección `mNN-lK`, reto `mNN-lK-cJ` (ej. `m03`, `m03-l2`, `m03-l2-c1`). El id del módulo DEBE coincidir con el prefijo del archivo (un test lo comprueba).
- Formato: copia la estructura de `src/content/modules/m00-bienvenida.js`.
- **Sin `import` dentro de los archivos de módulo.** Solo `export default`. Las cadenas compartidas (como `MAIN`, el `main.jsx` de arranque) se definen dentro del propio archivo. Motivo: `e2e/soluciones.spec.js` los carga con `import()` desde Node. Un test falla si encuentra un `import`.
  (Los `import` que van dentro de las cadenas de código de los retos están bien: son texto.)

## Estructura

```js
// Módulo
{ id: 'm00', title, summary, lessons: [Lesson] }
// Lección
{ id: 'm00-l1', title, explanation /* markdown */, challenges: [Challenge] }
// Reto
{
  id: 'm00-l1-c1', title, instructions /* markdown */,
  files: { '/src/main.jsx': '...', '/src/App.jsx': '...' },  // visibles y editables
  activeFile: '/src/App.jsx',
  hints: ['...'], solution: { '/src/App.jsx': '...' },        // solution = archivos que cambian
  checks: [Check], xp: 10,                                     // xp opcional, por defecto 10
  startFrom: 'previous',        // opcional: arranca con el código guardado del reto anterior (proyecto final)
  dependencies: { 'react-router-dom': '^7.0.0' },              // opcional
  preview: false,               // opcional: este reto va sin vista previa (ver "Modo solo código")
}
```

## Modo del curso: con vista previa o solo código

El modo se elige en `src/content/courseConfig.js` (objeto simple, sin `import`):

```js
export default {
  mode: 'sandbox', // por defecto (curso de React): vista previa en vivo en cada reto
  // mode: 'code',  // solo código: sin vista previa ni ejecución (Java, Spring Boot, Maven…)
}
```

Para un curso de otro lenguaje basta con cambiar esa línea a `mode: 'code'`. También se puede
quitar la vista previa a un solo reto de un curso normal con `preview: false` en el reto.
En un curso `mode: 'code'` todos los retos van sin vista previa (`preview: true` es un error).

Sin vista previa (modo solo código o `preview: false`):

- No se muestra la vista previa ni se crea ningún iframe: Sandpack solo hace de editor
  (sin plantilla, `autorun: false`), así que los archivos (p. ej. `.java`) nunca se mandan a
  empaquetar. El editor ocupa ese ancho y los resultados salen debajo del editor.
- "Comprobar" solo corre las comprobaciones de archivos, al instante (sin recargar nada).
- Solo valen los checks `file-exists`, `file-includes`, `file-excludes`, `file-count` y `manual`.
  `text`, `role`, `count`, `class`, `interaction` (necesitan la vista previa) y `lint-clean`
  (ESLint solo entiende JavaScript) los rechaza la validación (`npm test`).
- No hace falta `/src/main.jsx`. Las rutas pueden estar en cualquier carpeta, también en la raíz
  (`/pom.xml`, `/src/main/java/com/biblioteca/models/Libro.java`). Las pestañas muestran solo el
  nombre del archivo (`Libro.java`) y la ruta completa al pasar el ratón.
- "Nuevo archivo" pide la ruta desde la raíz del proyecto (`src/main/java/com/biblioteca/App.java`)
  y acepta `.java`, `.xml`, `.properties`, `.yml`, `.sql`, `.json`, `.md`, `.txt`, `.js(x)`, `.css`
  y `.html`. No se puede borrar el último archivo que queda.
- No uses un `/package.json` propio en estos retos: Sandpack lo necesita por dentro (la plataforma
  añade uno oculto).
- "Ver solución", "Reiniciar reto" y `startFrom: 'previous'` funcionan igual que siempre.

Colores en el editor (en cualquier modo): `.java` (Java) y `.xml` (p. ej. `pom.xml`) tienen
resaltado propio; `.properties` se ve casi como texto plano (comentarios y claves marcados).
El autocompletado de React, Tailwind e `import` y los avisos de ESLint solo aparecen en archivos
JavaScript (en Java solo se sugieren nombres del proyecto; en XML y `.properties`, nada).

## Tipos de `Check`

`label` siempre es obligatorio, en español: es lo que ve el alumno. `message` (opcional) es el texto
que se muestra si falla (en `file-exists`, `file-includes` y `file-excludes`). Los `pattern` son expresiones regulares en texto
(`'System\\.out'`).

| type | campos | dónde corre |
|------|--------|-------------|
| `text` | `match` | iframe |
| `role` | `role` (`button`,`heading`,`textbox`,`list`,`listitem`,`link`,`img`,`form`,`checkbox`), `name?`, `min?` (=1) | iframe |
| `count` | `selector`, `min?`, `max?` | iframe |
| `class` | `selector`, `pattern` (regex string): algún elemento que cumpla `selector` tiene una clase que cumple `pattern` | iframe |
| `interaction` | `steps: [{action:'click', role, name?} \| {action:'type', role, name?, value}]`, `expect: Check(text\|role\|count\|class)` | iframe |
| `file-exists` | `pattern` (regex sobre la ruta) | página |
| `file-includes` | `path?` (si falta: cualquier archivo), `pattern` | página |
| `file-excludes` | `path?` (si falta: cualquier archivo), `pattern`: pasa si el patrón NO aparece. Con `path` de un archivo que no existe, falla | página |
| `file-count` | `min`, `pattern?` (sin él cuenta archivos `.jsx`/`.js` visibles; con él, las rutas que cumplen el regex, p. ej. `'\\.java$'`) | página |
| `lint-clean` | sin campos (sin errores de severidad 2 en ningún archivo) | página |
| `manual` | sin campos (casilla que marca el alumno) | página |

## Cómo probar tu módulo

1. Pruebas unitarias (validan esquema, ids, que la solución cumpla los checks de archivos y lint):
   `npm test`
2. Comprobar que la solución de CADA reto pasa sus propios checks en la app real (en retos sin
   vista previa no hace falta internet ni esperar a la vista previa) (necesita internet; ~25-45 s por reto). Usa un puerto propio, distinto de 5173 y del de los demás autores:

   ```bash
   MODULOS=mNN E2E_PORT=<puerto> npx playwright test e2e/soluciones.spec.js
   ```

   `MODULOS` admite varios ids separados por comas (`MODULOS=m01,m02`); sin él se prueban todos. Si un reto falla, el mensaje lista los checks que no pasaron.
   Cada reto se prueba con todos los anteriores del curso marcados como completados.
3. `npm run lint`.
