import express from 'express';
import cors from 'cors';
import customerRoutes from './routes/customer.js';
import authRoutes from './routes/authority/auth.js'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', customerRoutes);
app.use('/',authRoutes);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
