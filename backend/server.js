import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customer.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', customerRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
