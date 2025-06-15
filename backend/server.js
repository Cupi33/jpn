import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authority/auth.js'
import profileRoutes from './routes/profile/profileDisplay.js'
import generalStat from './routes/stats/generalStat.js'
import ICApplication from './routes/Application/ICApplication.js'
import NewbornApplication from './routes/Application/Newborn.js'
import DeathApplication from './routes/Application/Death.js'
import LHDNApi from './routes/govApi/apiLHDN.js'
import THApi from './routes/govApi/apiTH.js'
import InboxApi from './routes/Inbox/inbox.js'
import adminStat from './routes/stats/adminStat.js'
import newbornstat from './routes/stats/newbornStat.js'
import deathstat from './routes/stats/deathStat.js'
import apiLZ from './routes/govApi/apiLZ.js'

const app = express();
app.use(cors(
  {
    origin: '*', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
  }
));
app.use(express.json());

app.use('/profile', profileRoutes);
app.use('/',authRoutes);
app.use('/adminstat',adminStat);
app.use('/stat',generalStat);
app.use('/icapply',ICApplication);
app.use('/newbornapply',NewbornApplication);
app.use('/deathapply',DeathApplication);
app.use('/lhdnApi',LHDNApi);
app.use('/thApi',THApi);
app.use('/inbox',InboxApi);
app.use('/newbornStat',newbornstat);
app.use('/deathstat',deathstat);
app.use('/apiLZ',apiLZ);

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running at http://0.0.0.0:${PORT}`);
});

