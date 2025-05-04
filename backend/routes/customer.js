import express from 'express';
import { getConnection } from '../config/db.js';

const router = express.Router();

router.get('/customers', async (req, res) => {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(`SELECT * FROM customer`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch customers' });
  } finally {
    if (connection) await connection.close();
  }
});

export default router;
