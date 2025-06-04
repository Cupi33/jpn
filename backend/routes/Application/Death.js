import express from 'express';
import { execute,callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';
import multer from 'multer';

const router = express.Router();

// Setup multer for memory storage (no file system saving)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/1', upload.single('document'), async (req, res) => {
  const { citizenID, deceasedID, relationship, deathDate } = req.body;
  const documentBuffer = req.file?.buffer || null; // Get the uploaded file buffer

  // Debugging: Log the file information
  console.log('Uploaded file:', req.file);
  console.log('Document buffer exists:', !!documentBuffer);

  try {
    // Step 1: Get next appID from application sequence
    const appIDResult = await execute(`SELECT application_seq.NEXTVAL AS appID FROM dual`);
    const appID = appIDResult.rows[0].APPID;

    // Step 2: Insert into application table
    await execute(
      `INSERT INTO application (appID, citizenID, appType, appDate)
       VALUES (:1, :2, 'DEATH', SYSDATE)`,
      [appID, citizenID]
    );

    // Step 3: Get next deathAppID from death_application sequence
    const deathIDResult = await execute(`SELECT death_application_seq.NEXTVAL AS deathAppID FROM dual`);
    const deathAppID = deathIDResult.rows[0].DEATHAPPID;

    // Step 4: Insert into DEATH_APPLICATION including the document
    await execute(
      `INSERT INTO DEATH_APPLICATION
        (deathAppID, appID, deceasedID, relationship, deathDate, DOCUMENT_DETAIL)
       VALUES (:1, :2, :3, :4, TO_DATE(:5, 'yyyy-mm-dd'), :6)`,
      [deathAppID, appID, deceasedID, relationship, deathDate, documentBuffer]
    );

    // Step 5: Commit
    await execute('COMMIT');

    // Step 6: Send success response
    res.status(201).json({
      success: true,
      message: 'Death Application sent successfully',
      application: {
        appID,
        deathAppID
      }
    });

  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/checkICName', async (req, res) => {
  const { fullname, icno, registrantID } = req.body;

  // Sanitize inputs
  const cleanedFullname = fullname.replace(/_/g, ' ').trim().toUpperCase();
  const cleanedICNo = icno.replace(/[^0-9]/g, '');

  console.log('registrantid: ', registrantID);

  try {
    const result = await execute(
      `SELECT citizenID AS "citizenID", is_alive(citizenID) AS status
       FROM citizen 
       WHERE icno = :1
       AND UPPER(full_name) = :2`,
      [cleanedICNo, cleanedFullname]
    );

    if (result.rows.length === 0) {
      return res.status(200).json({  // Changed from 404 to 200
        success: false,
        match: false,
        message: 'Unmatch icno and full name',
      });
    }

    const user = result.rows[0];

    if (user.STATUS === 'MATI') {
      return res.status(200).json({  // Changed from 400 to 200
        success: false,
        match: false,
        message: 'Nama sudah didaftar Mati',
      });
    }

    console.log('citizenid: ', user.citizenID);

    if (String(user.citizenID) === String(registrantID)) {
    return res.status(200).json({
      success: false,
      match: false,
      message: 'Diri Sendiri',
  });
}


    res.json({
      success: true,
      match: true,
      message: 'Match icno and full name',
      user: {
        citizenID: user.citizenID,
      },
    });

  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
});


router.get('/tableDeath', async (req, res) => {
  try {
    const query = `
      select ap.appID AS "appID", ct.icno as "icno",
      ap.appDate as "appDate",ap.status as "status"
      from application ap
      join citizen ct
      on ap.citizenID = ct.citizenID
      where ap.apptype = 'DEATH'
      and ap.status = 'PENDING'
      order by ap.appdate desc
      
    `;

    const result = await execute(query);

    res.status(200).json({
      success: true,
      data: result.rows // ⬅️ This returns an array of rows
    });

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.get('/deathDetails/:appID', async (req, res) => {
  
  try {
    const appID = parseInt(req.params.appID);
    

    const result = await callProcedure
    ('BEGIN display_death_detail(:appID, :full_name, :icno, :registrant_id, :deceased_name, :deceased_icno, :deceased_id, :relationship, :relationship_system); END;',
      {
        appID,
        full_name: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        icno: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 },
        registrant_id: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER},
        deceased_name: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        deceased_icno: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 },
        deceased_id: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER},
        relationship: {dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 30},
        relationship_system: {dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 30}

      }
    );

    res.status(200).json({
      success: true,
      data: result.outBinds
    });
    

  } catch (err) {
    console.error("Error calling procedure:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post('/checkDeathApp', async (req, res) => {
  const { icno } = req.body;

  if (!icno) {
    return res.status(400).json({ 
      success: false, 
      message: 'IC number is required' 
    });
  }

  const cleanedICNo = icno.replace(/[^0-9]/g, '');
  try {
    const result = await callProcedure(
      `BEGIN CHECK_DEATH_APP(:cleanedICNo, :message); END;`,
      {
        cleanedICNo,
        message: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 100 }
      }
    );

    const message = result.outBinds.message;

    if (message) {
      // If there's a message (not null), it means there's an error
      return res.status(200).json({ 
        success: false, 
        message: message 
      });
    } else {
      // If message is null, the checks passed
      return res.status(200).json({ 
        success: true, 
        message: 'Permohonan Layak Dihantar' 
      });
    }

  } catch (err) {
    console.error("Check death application error:", err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.post('/reviewDeath', async (req, res) => {
  const {
    appID,
    staffID,
    decision,
    comments,
    deceasedID,
    registrantID,
  } = req.body;

  try {
    const result = await callProcedure(
      `BEGIN REVIEW_DEATH(:appID, :staffID, :decision, :comments, :deceasedID, 
      :registrantID,  :message); END;`,
      {
        appID,
        staffID,
        decision,
        comments: comments || null,
        deceasedID,
        registrantID,
        message: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 }
      }
    );

    res.status(200).json({
      success: true,
      message: result.outBinds.message
    });

  } catch (err) {
    console.error("Review error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;