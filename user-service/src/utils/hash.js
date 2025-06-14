const bcrypt = require('bcrypt');

const hashPassword = async (plainText) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainText, salt);
};

const comparePassword = async (plainText, hash) => {
  return await bcrypt.compare(plainText, hash);
};

module.exports = { hashPassword, comparePassword };
