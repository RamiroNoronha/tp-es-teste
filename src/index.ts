import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import pollRoutes from './routes/pollRoutes';
import userRoutes from './routes/userRoutes';

const app = express();
const port = 3000;

app.use(cors());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // Permite acesso de qualquer origem
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS'); // Métodos permitidos
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); // Headers permitidos
  res.header('Content-Type', 'application/json'); // Define o Content-Type como application/json
  next();
});

app.use(bodyParser.json());

app.use('/api', pollRoutes);

app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});