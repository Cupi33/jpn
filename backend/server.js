import express from 'express';
import cors from 'cors';
import fs from 'fs';
import http from 'http';
import https from 'https';

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
import boardstat from './routes/stats/boardstat.js'

const app = express();

// Enable CORS
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Enable JSON parsing
app.use(express.json());

// Register routes
app.use('/profile', profileRoutes);
app.use('/', authRoutes);
app.use('/adminstat', adminStat);
app.use('/stat', generalStat);
app.use('/icapply', ICApplication);https://localhost:5443/stat/general
app.use('/newbornapply', NewbornApplication);
app.use('/deathapply', DeathApplication);
app.use('/lhdnApi', LHDNApi);
app.use('/thApi', THApi);
app.use('/inbox', InboxApi);
app.use('/newbornStat', newbornstat);
app.use('/deathstat', deathstat);
app.use('/apiLZ', apiLZ);
app.use('/board', boardstat);

// HTTPS options
const httpsOptions = {
  key: fs.readFileSync('./cert/server.key'),
  cert: fs.readFileSync('./cert/server.cert'),
};

// Start both HTTP and HTTPS servers
const HTTP_PORT = 5000;
const HTTPS_PORT = 5443;

http.createServer(app).listen(HTTP_PORT, () => {
  console.log(`🚀 HTTP server running at http://localhost:${HTTP_PORT}`);
});

https.createServer(httpsOptions, app).listen(HTTPS_PORT, () => {
  console.log(`🔒 HTTPS server running at https://localhost:${HTTPS_PORT}`);
});
