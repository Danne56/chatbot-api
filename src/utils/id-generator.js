const { customAlphabet } = require('nanoid');

// Alphabet hanya huruf dan angka (tanpa simbol)
const alphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

// Generator ID dengan panjang 12 karakter
function generateId(length = 12) {
  if (length < 1) {
    throw new Error('Length must be at least 1');
  }

  const generator = customAlphabet(alphabet, length);
  return generator();
}

module.exports = { generateId };
