import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authority/auth.js'
import profileRoutes from './routes/profile/profileDisplay.js'
import generalStat from './routes/stats/generalStat.js'
import ICApplication from './routes/Application/ICApplication.js'
import NewbornApplication from './routes/Application/Newborn.js'

const app = express();
app.use(cors());
app.use(express.json());

app.use('/profile', profileRoutes);
app.use('/',authRoutes);
app.use('/stat',generalStat);
app.use('/icapply',ICApplication);
app.use('/newbornapply',NewbornApplication);

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
