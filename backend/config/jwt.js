// JWT Configuration
module.exports = {
  secret: process.env.JWT_SECRET || 'default-secret-key',
  expiresIn: process.env.JWT_EXPIRE || '7d',
  algorithm: 'HS256',
};
