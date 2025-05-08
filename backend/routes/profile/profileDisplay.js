import express from 'express';
import { execute } from "../../config/db.js"; // this connects to Oracle DB

const router = express.Router();

router.post('/profile', async (req, res) => {
  const { citizenID } = req.body;

  try {
    // Retrieve user profile
    const result = await execute(
      `SELECT full_name as "fullname", 
              date_of_birth AS "dob",
              gender as "gender", 
              race as "race", 
              religion as "religion", 
              get_age(date_of_birth) AS "age", 
              address as "address", 
              get_marital_status(citizenid) AS "status"
       FROM citizen
       WHERE citizenID = :citizenID`,
      [citizenID]  // params for the query
    );
  
    if (!result.rows || result.rows.length === 0) {
      // Changed to 404 for "not found" error
      return res.status(404).json({ success: false, message: 'Citizen not found' });
    }
  
    const user = result.rows[0];
  
    // Format the date of birth (dob)
    const formattedDob = new Date(user.dob).toISOString().split('T')[0]; // Formats as YYYY-MM-DD
  
    res.json({
      success: true,
      message: 'Success',
      user: {
        fullname: user.fullname,
        dob: formattedDob,  // Send the formatted date
        gender: user.gender,
        race: user.race,
        religion: user.religion,
        age: user.age,
        address : user.address,
        status: user.status,
      }
    });
  
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve data' });
  }
  
});

export default router;
