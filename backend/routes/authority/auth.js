import express from 'express';
import { execute } from "../../config/db.js" // this connects to Oracle DB

const router = express.Router();

router.post('/validate-mykad', async (req, res) => {
  const { fullName, icno, address, gender, religion } = req.body;

  if (!fullName || !icno || !address || !gender || !religion) {
    return res.status(400).json({ success: false, message: 'Maklumat tidak lengkap.' });
  }

  const sanitizedIcno = icno.replace(/-/g, '');

  try {
    // --- THE FIX IS HERE ---
    // The `AND account_status IS NULL` condition has been REMOVED as you requested.
    // This endpoint now only validates the citizen's identity.
    const result = await execute(
      `SELECT citizenID, full_name, icno
       FROM citizen
       WHERE UPPER(full_name) = UPPER(:1)
         AND icno = :2
         AND UPPER(address) = UPPER(:3)
         AND UPPER(gender) = UPPER(:4)
         AND UPPER(religion) = UPPER(:5)`, // <- Condition removed from this line
      [fullName, sanitizedIcno, address, gender, religion]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kad Pengenalan tidak sah atau maklumat tidak sepadan. Sila cuba lagi.'
      });
    }

    const citizenID = result.rows[0].CITIZENID;
    res.status(200).json({
      success: true,
      message: 'Kad Pengenalan disahkan.',
      citizenID: citizenID
    });

  } catch (err) {
    console.error('MyKad validation error:', err);
    res.status(500).json({ success: false, message: 'Ralat pelayan semasa pengesahan.' });
  }
});

// POST /login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await execute(
      `SELECT citizenID AS "citizenID", username AS "username" 
        FROM account 
        WHERE username = :1 AND password = :2`,
      [username, password]  // this is NOT safe for real apps, but okay for learning
    );

    if (result.rows.length === 0) 
      {
      return res.status(401).json({ success: false, message: 'Salah username atau kata laluan' });
      }

      const user = result.rows[0];
      const citizenID = user.citizenID;

      const result2 = await execute(
      `SELECT * 
        FROM CITIZEN CT
        JOIN ACCOUNT AC
        ON CT.CITIZENID = AC.CITIZENID
        WHERE CT.CITIZENID = :citizenID AND AC.STATUSACCOUNT = 'INACTIVE' 
        `,
      [citizenID] 
    );

    if (result2.rows.length > 0) 
      {
      return res.status(401).json({ success: false, message: 'Akaun Tidak Aktif' });
      }

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.citizenID,         // match your table columns
        username: user.username,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  const { citizenID, username, password } = req.body;

  try {
    // This query correctly checks for duplicate usernames OR if the citizenID already has an account.
    const checkAlreadRegistered = await execute(
      `SELECT * FROM account WHERE  citizenID = :1`,
      [citizenID]
    );

    if (checkAlreadRegistered.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nama pengguna telah berdaftar di dalam sistem'
      });
    }

    const checkAlive = await execute(
      `SELECT * FROM citizen
      WHERE  citizenID = :1
      and death_registered_by is not null`,
      [citizenID]
    );

    if (checkAlive.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nama pengguna telah didaftarkan mati'
      });
    }

    const checkUsernameTaken = await execute(
      `SELECT * FROM account
      WHERE username = :1 `,
      [username]
    );

    if (checkUsernameTaken.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Nama username telah diambil'
      });
    }

    const checkAge = await execute(
      `SELECT get_age(date_of_birth) as "age" FROM citizen
      WHERE citizenid = :1 `,
      [citizenID]
    );

    if (checkAge.rows[0].age < 12) {
      return res.status(409).json({
        success: false,
        message: 'Anda mesti berusia sekurang-kurangnya 12 tahun untuk mendaftar akaun'
      });
    }

    // Insert the new account
    await execute(
      `INSERT INTO account (citizenID, username, password, statusaccount)
       VALUES (:1, :2, :3, 'ACTIVE')`,
      [citizenID, username, password]
    );
    

    await execute('COMMIT');

    res.status(201).json({
      success: true,
      message: 'Akaun berjaya didaftarkan',
      user: { citizenID, username }
    });

  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ success: false, message: 'Ralat pelayan semasa pendaftaran.' });
  }
});

router.post('/loginStaff', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await execute(
      `SELECT staffID AS "staffID", username AS "username" 
        FROM STAFF 
        WHERE username = :1 AND password = :2`,
      [username, password]  // this is NOT safe for real apps, but okay for learning
    );

    if (result.rows.length === 0) 
      {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
      }

      const user = result.rows[0];

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.staffID,         // match your table columns
        username: user.username,
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/changeUsername', async (req, res) => {
  const { username, citizenID} = req.body;

  try {
    const result = await execute(
      `SELECT *
        FROM account 
        WHERE username = :1 `,
      [username]  
    );

    if (result.rows.length > 0) 
      {
      return res.status(401).json({ success: false, message: 'Username sudah diguna penggua lain' });
      }


      const result2 = await execute(
      `UPDATE ACCOUNT
      SET username = :1
      WHERE CITIZENID = :2
        `,
      [username, citizenID] 
    );

    if (result2.rowsAffected === 0) {
  return res.status(404).json({
    success: false,
    message: 'Citizen ID tidak dijumpai atau tiada perubahan berlaku',
  });
}

    res.json({
      success: true,
      message: 'Username berjaya diubah',
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/changePassword', async (req, res) => {
  const { oldpassword, newpassword, username } = req.body;

  try {
    // Step 1: Check if old password matches
    const result = await execute(
      `SELECT * FROM account WHERE username = :1 AND password = :2`,
      [username, oldpassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Salah kata laluan' });
    }

    if(oldpassword === newpassword)
    {
      return res.status(401).json({ success: false, message: 'Sila gunakan kata laluan yang berbeza daripada kata laluan sebelumnya' });
    }

    // Step 2: Update the password
    const result2 = await execute(
      `UPDATE account SET password = :1 WHERE username = :2`,
      [newpassword, username]
    );

    if (result2.rowsAffected === 0) {
      return res.status(404).json({
        success: false,
        message: 'USERNAME TIDAK DIJUMPAI',
      });
    }

    res.json({
      success: true,
      message: 'Kata laluan berjaya diubah',
    });

  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.get('/validMykad', async (req, res) => {

  const { citizenID } = req.query;
  try {
    const result = await execute(`
      SELECT valid_mykad(:1) from dual
    `,[citizenID]);

    
    
    res.json({ 
      success: true, 
      message: 'Query Successful', 
      stat: result.rows 
    });

  } catch (err) {
    console.error('Retrieval error for /validMykad:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/forgetPasswordCheck', async (req, res) => {
  const { icno, username, password } = req.body;

  try {
    // Step 1: Check if username or IC number exists
    const result = await execute(
      `SELECT ac.citizenID as CITIZENID
      FROM citizen ct
      join account ac
      on ct.citizenid = ac.citizenid
      WHERE UPPER(ac.username) = UPPER(:1) 
        AND ct.icno = :2
        AND ct.death_registered_by IS NULL`,
      [username, icno]
    );

    if (result.rows.length === 0) {
      return res.status(409).json({
        success: false,
        message: 'Maklumat tidak dijumpai'
      });
    }

    const citizenID = result.rows[0].CITIZENID;

    // Step 2: Update account password
    await execute(
      `UPDATE ACCOUNT
      SET PASSWORD = :1
      WHERE CITIZENID = :2`,
      [password, citizenID] // replace 'password' with 'hashedPassword' if hashing
    );

    // Optional: Commit depending on your DB setup
    await execute('COMMIT');

    res.status(200).json({
      success: true,
      message: 'Kata Laluan berjaya diubah',
    });

  } catch (err) {
    console.error('Forget password error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});


export default router;
