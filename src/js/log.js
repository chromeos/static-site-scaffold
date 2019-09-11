/**
 * Decides to log as a table or not
 *
 * @param {*} item - An item to log out
 */
export function log(item) {
  if (Array.isArray(item) || typeof item === 'object') {
    console.table(item);
  } else {
    console.log(item);
  }
}
