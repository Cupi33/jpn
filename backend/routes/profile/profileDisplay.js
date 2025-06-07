import express from 'express';
import { execute } from "../../config/db.js";
import multer from 'multer';
import oracledb from 'oracledb';

const dbConfig = {
  user: "cupi",
  password: "password",
  connectString: "127.0.0.1:10521/jpn"
};

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- NO CHANGES TO THIS ROUTE ---
router.post('/profile', async (req, res) => {
  const { citizenID } = req.body;
  try {
    const result = await execute(
      `SELECT full_name as "fullname", date_of_birth AS "dob", gender as "gender", race as "race", religion as "religion", get_age(date_of_birth) AS "age", address as "address", get_marital_status(citizenid) AS "status"
       FROM citizen
       WHERE citizenID = :citizenID`,
      [citizenID]
    );
    if (!result.rows || result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }
    const user = result.rows[0];
    const formattedDob = new Date(user.dob).toISOString().split('T')[0];
    res.json({ success: true, message: 'Success', user: { ...user, dob: formattedDob } });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve data' });
  }
});

// --- NO CHANGES TO THIS ROUTE ---
router.put('/upload-picture', upload.single('profilePic'), async (req, res) => {
  const { citizenID } = req.body;
  const imageBuffer = req.file?.buffer;
  if (!citizenID) {
    return res.status(400).json({ success: false, message: 'citizenID is required.' });
  }
  if (!imageBuffer) {
    return res.status(400).json({ success: false, message: 'Tiada gambar yang dipilih' });
  }
  try {
    const sql = `UPDATE ACCOUNT SET PROFILE_PIC = :pic WHERE CITIZENID = :id`;
    const params = { pic: imageBuffer, id: citizenID };
    const result = await execute(sql, params);
    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Account not found for the given citizenID.' });
    }
    res.json({ success: true, message: 'Proses mengubah gambar profil berjaya' });
  } catch (err) {
    console.error('Error updating profile picture:', err);
    res.status(500).json({ success: false, message: 'Proses mengubah gambar profil gagal' });
  }
});


// --- 👇 THE FIX IS A SINGLE LINE ADDED TO THIS ROUTE 👇 ---
router.get('/get-picture/:citizenID', async (req, res) => {
  const { citizenID } = req.params;
  
  if (!citizenID) {
    return res.status(400).json({ success: false, message: 'citizenID is required.' });
  }

  let connection;
  try {
    connection = await oracledb.getConnection(dbConfig);
    
    const sql = `SELECT PROFILE_PIC FROM ACCOUNT WHERE CITIZENID = :citizenID`;
    
    // Execute the query, but now with the essential outFormat option
    const result = await connection.execute(
      sql, 
      [citizenID], 
      { outFormat: oracledb.OUT_FORMAT_OBJECT } // 👈 THE FIX IS HERE!
    );

    // This check will now work correctly because result.rows[0] is an object.
    if (!result.rows || result.rows.length === 0 || !result.rows[0].PROFILE_PIC) {
      return res.status(404).send('Gambar Profil Tidak Dijumpai');
    }

    const lob = result.rows[0].PROFILE_PIC;

    const imageBuffer = await new Promise((resolve, reject) => {
      const chunks = [];
      lob.on('data', (chunk) => chunks.push(chunk));
      lob.on('error', (err) => reject(err));
      lob.on('end', () => resolve(Buffer.concat(chunks)));
    });

    res.setHeader('Content-Type', 'image/jpeg'); 
    res.send(imageBuffer);

  } catch (err) {
    console.error('Error fetching profile picture:', err);
    res.status(500).send('Failed to retrieve image.');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});


export default router;