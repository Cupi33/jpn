import express from 'express';
import { execute, callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';
import multer from 'multer';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// POST /1 - handles 'ha' and 'mykid'
router.post('/1', upload.single('document'), async (req, res) => {
  const { citizenID, reasons } = req.body;
  const documentBuffer = req.file?.buffer || null;

  try {
    // ✅ Step 1: Validation for 'mykid'
    if (reasons.toLowerCase() === 'mykid') {
      const resultMykad = await execute(
        `SELECT 1 FROM IC_CARD WHERE CARDTYPE = 'MYKAD' AND citizenID = :citizenID`,
        [citizenID]
      );

      if (resultMykad.rows.length > 0) {
        return res.status(401).json({
          success: false,
          message: 'Pengguna sudah pernah mendaftar MyKad'
        });
      }

      const resultAge = await execute(
        `SELECT get_Age(date_of_birth) AS "age" FROM CITIZEN WHERE citizenID = :citizenID`,
        [citizenID]
      );

      const age = resultAge.rows[0].age;
      if (age < 12) {
        return res.status(401).json({
          success: false,
          message: 'Pengguna belum berusia 12 tahun'
        });
      }
    }

    // ✅ Step 2: Call stored procedure
    const result = await callProcedure(
      `BEGIN insert_ic_application(:citizenID, :reason, :newaddress, :document, :appID, :icAppID); END;`,
      {
        citizenID,
        reason: reasons,
        newaddress: null,
        document: documentBuffer, // only used if 'ha'
        appID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER },
        icAppID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER }
      }
    );

    res.status(201).json({
      success: true,
      message: 'IC Application sent successfully',
      application: {
        appID: result.outBinds.appID,
        icAppID: result.outBinds.icAppID
      }
    });

  } catch (err) {
    console.error('Application error:', err);

    if (err && err.errorNum === 20001) {
      return res.status(400).json({
        success: false,
        message: 'Permohonan Kad Pengenalan dengan sebab yang sama sudah dihantar dan sedang diproses.'
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.post('/2', async (req, res) => {
  const { citizenID, address } = req.body;

  try {
    const result = await callProcedure(
      `BEGIN insert_ic_application(:citizenID, :reason, :newaddress, :document, :appID, :icAppID); END;`,
      {
        citizenID,
        reason: 'ta',
        newaddress: address,
        document: null, // no document for 'ta'
        appID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER },
        icAppID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER }
      }
    );

    await execute(
      `UPDATE CITIZEN
       SET address = :1
       WHERE citizenID = :2`,
      [address, citizenID]
    );

    await execute('COMMIT');

    res.status(201).json({
      success: true,
      message: 'IC Application sent successfully',
      application: {
        appID: result.outBinds.appID,
        icAppID: result.outBinds.icAppID
      }
    });

  } catch (err) {
    console.error('Application error:', err);

    if (err && err.errorNum === 20001) {
      return res.status(400).json({
        success: false,
        message: 'Permohonan Kad Pengenalan dengan sebab yang sama sudah dihantar dan sedang diproses.'
      });
    }

    res.status(500).json({ success: false, message: 'Server error' });
  }
});


router.get('/tableIC', async (req, res) => {
  try {
    const query = `
      SELECT ap.appID AS "appID", 
             ct.icno AS "icno", 
             ap.appDate AS "appDate", 
             ap.status AS "status"
      FROM application ap
      JOIN citizen ct ON ap.citizenID = ct.citizenID
      WHERE ap.apptype = 'IC'
      and ap.status = 'PENDING'
      ORDER BY ap.appDate DESC
      
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

router.get('/getICDetails/:appID', async (req, res) => {
  
  try {
    const appID = parseInt(req.params.appID);
    

    const result = await callProcedure
    ('BEGIN display_ic_reason(:appID, :full_name, :icno, :reason_desc, :reason, :address, :age); END;',
      {
        appID,
        full_name: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        icno: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 },
        reason_desc: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        reason: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 5 },
        address: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        age:  { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER }
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

router.post('/reviewIC', async (req, res) => {
  const {
    appID,
    staffID,
    decision,
    comments,
    address, // can be null for 'ha' or 'mykid'
  } = req.body;

  try {
    const result = await callProcedure(
      `BEGIN REVIEW_IC(:appID, :staffID, :decision, :comments, :address, :message); END;`,
      {
        appID,
        staffID,
        decision,
        comments,
        address: address || null, // ensure null is passed when no address is needed
        message: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 }
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
