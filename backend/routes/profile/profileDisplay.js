import express from 'express';
import { execute } from "../../config/db.js";
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// No changes to this route. The final path is still POST /profile/profile
router.post('/profile', async (req, res) => {
  const { citizenID } = req.body;
  try {
    const result = await execute(
      `SELECT full_name as "fullname", date_of_birth AS "dob", gender, race, religion, get_age(date_of_birth) AS "age", address, get_marital_status(citizenid) AS "status"
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


// --- 👇 RENAMED AND CORRECTED UPLOAD ROUTE 👇 ---
// The final path will now be: PUT /profile/upload-picture
router.put('/upload-picture', upload.single('profilePic'), async (req, res) => {
  const { citizenID } = req.body;
  const imageBuffer = req.file?.buffer;

  if (!citizenID) {
    return res.status(400).json({ success: false, message: 'citizenID is required.' });
  }
  if (!imageBuffer) {
    return res.status(400).json({ success: false, message: 'No image file was uploaded.' });
  }

  try {
    const sql = `UPDATE ACCOUNT SET PROFILE_PIC = :pic WHERE CITIZENID = :id`;
    const params = { pic: imageBuffer, id: citizenID };
    const result = await execute(sql, params);

    if (result.rowsAffected === 0) {
      return res.status(404).json({ success: false, message: 'Account not found for the given citizenID.' });
    }
    res.json({ success: true, message: 'Profile picture updated successfully.' });
  } catch (err) {
    console.error('Error updating profile picture:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile picture.' });
  }
});


// --- 👇 RENAMED AND CORRECTED DISPLAY ROUTE 👇 ---
// The final path will now be: GET /profile/get-picture/:citizenID
router.get('/get-picture/:citizenID', async (req, res) => {
  const { citizenID } = req.params;

  if (!citizenID) {
    return res.status(400).json({ success: false, message: 'citizenID is required.' });
  }

  try {
    const sql = `SELECT PROFILE_PIC FROM ACCOUNT WHERE CITIZENID = :citizenID`;
    const result = await execute(sql, [citizenID]);

    if (!result.rows || result.rows.length === 0 || !result.rows[0].PROFILE_PIC) {
      return res.status(404).json({ success: false, message: 'Gambar Profil tidak dijumpai' });
    }

    const imageBuffer = result.rows[0].PROFILE_PIC;
    res.setHeader('Content-Type', 'image/jpeg'); 
    res.send(imageBuffer);
  } catch (err) {
    console.error('Error fetching profile picture:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve image.' });
  }
});


export default router;