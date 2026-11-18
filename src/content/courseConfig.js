// Configuración del curso. Es lo único (junto con src/content/modules/) que cambia al copiar
// la plataforma para otro curso. Objeto simple, sin import.
//
// mode:
//   'sandbox' (por defecto): cada reto tiene vista previa en vivo (React en el navegador).
//   'code': solo código. No hay vista previa ni se ejecuta nada (sirve para Java, Spring Boot…);
//           "Comprobar" solo revisa el texto de los archivos.
export default {
  mode: 'sandbox',
}
