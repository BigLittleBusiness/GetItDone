const express = require('express');
const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  console.log('Health check received');
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/test', (req, res) => {
  console.log('Test endpoint hit');
  res.json({ message: 'Server is working!' });
});

const PORT = 3002;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});

