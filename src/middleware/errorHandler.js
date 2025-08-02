const errorHandler = (err, res) => {
  console.error('API Error:', err.stack || err.message);
  res.status(500).json({ error: 'Internal server error' });
};

module.exports = errorHandler;
