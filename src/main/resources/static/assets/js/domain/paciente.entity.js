// assets/js/domain/paciente.entity.js
/**
 * @typedef {Object} RxEye
 * @property {number|null} [esf]
 * @property {number|null} [cil]
 * @property {number|null} [eje]
 * @property {number|null} [add]
 * @property {number|null} [dp]
 * @property {number|null} [alt]
 *
 * @typedef {Object} Receta
 * @property {RxEye} od
 * @property {RxEye} oi
 * @property {number|null} [dpCerca]
 *
 * @typedef {Object} Paciente
 * @property {string} rut
 * @property {string} nombre
 * @property {string} direccion
 * @property {string} fechaNac
 * @property {string} operativo
 * @property {Receta} receta
 * @property {string} [obs]
 * @property {string} actualizadoEn ISO8601
 */
export const PacienteEntity = {};
// helpers de normalización/transformación se pueden agregar aquí en fases siguientes.
