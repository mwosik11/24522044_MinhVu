/**
 * @typedef {Object} Person
 * @property {string} id    - Stable entity ID, dùng làm key & URL param
 * @property {string} name
 * @property {string} role
 * @property {number} age
 * @property {number} iq
 */

/** @type {ReadonlyArray<Person>} */
export const SMART_PEOPLE = Object.freeze([
  { id: 'sp-1', name: 'Johann Goethe', role: 'Poet & Polymath', age: 82, iq: 210 },
  { id: 'sp-2', name: 'Albert Einstein', role: 'Theoretical Physicist', age: 76, iq: 205 },
  { id: 'sp-3', name: 'Leonardo da Vinci', role: 'Artist & Engineer', age: 67, iq: 180 },
  { id: 'sp-4', name: 'Isaac Newton', role: 'Mathematician', age: 84, iq: 190 },
  { id: 'sp-5', name: 'James Maxwell', role: 'Physicist', age: 48, iq: 190 },
  { id: 'sp-6', name: 'William Sidis', role: 'Child Prodigy', age: 46, iq: 200 },
]);
