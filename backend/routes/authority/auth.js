import express from 'express';
import bcrypt from 'bcrypt';
import { execute } from "../../config/db.js" 

const router = express.Router();
const saltRounds = 10; // Standard cost factor for bcrypt

router.post('/validate-mykad', async (req, res) => {
  const { fullName, icno, address, gender, religion } = req.body;

  if (!fullName || !icno || !address || !gender || !religion) {
    return res.status(400).json({ success: false, message: 'Maklumat tidak lengkap.' });
  }

  const sanitizedIcno = icno.replace(/-/g, '');

  try {
    const result = await execute(
      `SELECT citizenID, full_name, icno
       FROM citizen
       WHERE UPPER(full_name) = UPPER(:1)
         AND icno = :2
         AND UPPER(address) = UPPER(:3)
         AND UPPER(gender) = UPPER(:4)
         AND UPPER(religion) = UPPER(:5)`,
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

// POST /login (*** CORRECTED LOGIC FLOW ***)
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  console.log(`Extracted username: [${username}] | Extracted password: [${password}]`);

  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Username atau kata laluan tidak diberikan.' });
  }

  try {
    // --- STEP 1: TRY LEGACY LOGIN ---
    const legacyResult = await execute(
      `SELECT citizenID AS "citizenID", username AS "username"
       FROM account
       WHERE UPPER(username) = UPPER(:1) AND password = hash_password(:2)`,
      [username, password]
    );

    console.log('[RESULT-LEGACY] Rows returned:', legacyResult.rows.length);

    if (legacyResult.rows.length > 0) {
      const user = legacyResult.rows[0];

      // Check account status BEFORE upgrading password
      const statusResult = await execute(`SELECT statusaccount FROM account WHERE citizenID = :1`, [user.citizenID]);
      if (statusResult.rows.length > 0 && statusResult.rows[0].STATUSACCOUNT === 'INACTIVE') {
        console.log(`[FAILURE-LEGACY] Account for user ID ${user.citizenID} is INACTIVE.`);
        return res.status(401).json({ success: false, message: 'Akaun Tidak Aktif' });
      }

      // Upgrade password to bcrypt in the background (no need to await if not critical for this response)
      console.log(`[UPGRADE-LEGACY] Upgrading password for user ID: ${user.citizenID}...`);
      bcrypt.hash(password, saltRounds).then(newHashedPassword => {
        execute(
          `UPDATE account SET password = :1 WHERE citizenID = :2`,
          [newHashedPassword, user.citizenID]
        ).then(() => execute('COMMIT')).then(() => {
            console.log(`[UPGRADE-LEGACY] Password for user ID ${user.citizenID} upgraded successfully.`);
        }).catch(err => console.error("Password upgrade failed:", err));
      });
      
      // *** THE FIX IS HERE: Immediately return success response ***
      return res.json({
        success: true,
        message: 'Login successful',
        user: { id: user.citizenID, username: user.username }
      });
    }


    // --- STEP 2: TRY MODERN BCRYPT LOGIN ---
    const modernResult = await execute(
      `SELECT citizenID AS "citizenID", username AS "username", password AS "password"
       FROM account
       WHERE UPPER(username) = UPPER(:1)`,
      [username]
    );

    if (modernResult.rows.length > 0) {
      const user = modernResult.rows[0];
      if (user.password && user.password.startsWith('$2b$')) {
        const isMatch = await bcrypt.compare(password, user.password);
        if (isMatch) {
          console.log(`[SUCCESS-MODERN] Login successful for user ID: ${user.citizenID}.`);
          // Check account status
           const statusResult = await execute(`SELECT statusaccount FROM account WHERE citizenID = :1`, [user.citizenID]);
          if (statusResult.rows.length > 0 && statusResult.rows[0].STATUSACCOUNT === 'INACTIVE') {
            return res.status(401).json({ success: false, message: 'Akaun Tidak Aktif' });
          }

          return res.json({
            success: true,
            message: 'Login successful',
            user: { id: user.citizenID, username: user.username }
          });
        }
      }
    }

    // --- STEP 3: BOTH FAILED ---
    console.log('[FAILURE] Both legacy and modern login checks failed.');
    return res.status(401).json({ success: false, message: 'Salah username atau kata laluan' });

  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error during login process.' });
  }
});

// POST /register
router.post('/register', async (req, res) => {
  const { citizenID, username, password } = req.body;

  try {
    const checkAlreadRegistered = await execute(
      `SELECT * FROM account WHERE  citizenID = :1`, [citizenID]
    );
    if (checkAlreadRegistered.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Nama pengguna telah berdaftar di dalam sistem' });
    }
    const checkAlive = await execute(
      `SELECT * FROM citizen WHERE citizenID = :1 and death_registered_by is not null`, [citizenID]
    );
    if (checkAlive.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Nama pengguna telah didaftarkan mati' });
    }
    const checkUsernameTaken = await execute(
      `SELECT * FROM account WHERE username = :1 `, [username]
    );
    if (checkUsernameTaken.rows.length > 0) {
      return res.status(409).json({ success: false, message: 'Nama username telah diambil' });
    }
    const checkAge = await execute(
      `SELECT get_age(date_of_birth) as "age" FROM citizen WHERE citizenid = :1 `, [citizenID]
    );
    if (checkAge.rows[0].age < 12) {
      return res.status(409).json({ success: false, message: 'Anda mesti berusia sekurang-kurangnya 12 tahun untuk mendaftar akaun' });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await execute(
      `INSERT INTO account (citizenID, username, password, statusaccount)
       VALUES (:1, :2, :3, 'ACTIVE')`,
      [citizenID, username, hashedPassword]
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
      `SELECT staffID AS "staffID", username AS "username", role AS "role" 
        FROM STAFF 
        WHERE username = :1 AND password = :2`,
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.staffID,
        username: user.username,
        role: user.role
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
        const result = await execute(`SELECT * FROM account WHERE username = :1`, [username]);
        if (result.rows.length > 0) {
            return res.status(401).json({ success: false, message: 'Username sudah diguna penggua lain' });
        }
        const result2 = await execute(`UPDATE ACCOUNT SET username = :1 WHERE CITIZENID = :2`, [username, citizenID]);
        if (result2.rowsAffected === 0) {
            return res.status(404).json({ success: false, message: 'Citizen ID tidak dijumpai atau tiada perubahan berlaku' });
        }
        res.json({ success: true, message: 'Username berjaya diubah' });
    } catch (err) {
        console.error('Change username error:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

router.post('/changePassword', async (req, res) => {
  const { oldpassword, newpassword, username } = req.body;

  try {
    let passwordIsValid = false;
    let userAccount = null;

    // First, check if the old password is a legacy hash
    const legacyCheck = await execute(
      `SELECT * FROM account WHERE UPPER(username) = UPPER(:1) AND password = hash_password(:2)`,
      [username, oldpassword]
    );

    if (legacyCheck.rows.length > 0) {
      passwordIsValid = true;
      userAccount = legacyCheck.rows[0];
    } else {
      // If not, check if it's a modern bcrypt hash
      const modernCheck = await execute(
        `SELECT * FROM account WHERE UPPER(username) = UPPER(:1)`,
        [username]
      );
      if (modernCheck.rows.length > 0) {
        userAccount = modernCheck.rows[0];
        if (userAccount.PASSWORD && userAccount.PASSWORD.startsWith('$2b$')) {
          const isMatch = await bcrypt.compare(oldpassword, userAccount.PASSWORD);
          if (isMatch) {
            passwordIsValid = true;
          }
        }
      }
    }
    
    // If neither method validated the old password, fail.
    if (!passwordIsValid) {
      return res.status(401).json({ success: false, message: 'Salah kata laluan lama' });
    }

    // Now, proceed with the password change
    if (oldpassword === newpassword) {
      return res.status(400).json({ success: false, message: 'Sila gunakan kata laluan yang berbeza daripada kata laluan sebelumnya' });
    }

    const hashedNewPassword = await bcrypt.hash(newpassword, saltRounds);
    
    await execute(
      `UPDATE account SET password = :1 WHERE UPPER(username) = UPPER(:2)`,
      [hashedNewPassword, username]
    );
    
    await execute('COMMIT');

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
        const result = await execute(`SELECT valid_mykad(:1) from dual`, [citizenID]);
        res.json({ success: true, message: 'Query Successful', stat: result.rows });
    } catch (err) {
        console.error('Retrieval error for /validMykad:', err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

// POST /forgetPasswordCheck
router.post('/forgetPasswordCheck', async (req, res) => {
  const { icno, username, password } = req.body;

  try {
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
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    await execute(
      `UPDATE ACCOUNT
      SET PASSWORD = :1
      WHERE CITIZENID = :2`,
      [hashedPassword, citizenID]
    );

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