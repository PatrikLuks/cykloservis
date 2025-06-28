import express from 'express';

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/hello', (req, res) => {
  res.json({ message: 'Vítejte v API cykloservisu!' });
});

app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
