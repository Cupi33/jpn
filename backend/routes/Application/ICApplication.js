import express from 'express';
import { execute, callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';

const router = express.Router();

router.post('/1', async (req, res) => {
  const { citizenID, reasons } = req.body;

  try {
    // Call the stored procedure
    const result = await callProcedure(
      `BEGIN insert_ic_application(:citizenID, :reason, :newaddress, :appID, :icAppID); END;`,
      {
        citizenID,
        reason: reasons,
        newaddress: null, // No address for this endpoint
        appID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER },
        icAppID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER }
      }
    );

    // Send success response
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

    // Check for Oracle custom trigger error
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
    // Call the stored procedure
    const result = await callProcedure(
      `BEGIN insert_ic_application(:citizenID, :reason, :newaddress, :appID, :icAppID); END;`,
      {
        citizenID,
        reason: 'ta', // Hardcoded reason for address change
        newaddress: address,
        appID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER },
        icAppID: { dir: oracleDB.BIND_OUT, type: oracleDB.NUMBER }
      }
    );

    // Update address in citizen table
    await execute(
      `UPDATE CITIZEN
       SET address = :1
       WHERE citizenID = :2`,
      [address, citizenID]
    );

    await execute('COMMIT');

    // Send success response
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

    // Check for Oracle custom trigger error
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
    ('BEGIN display_ic_reason(:appID, :full_name, :icno, :reason_desc); END;',
      {
        appID,
        full_name: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 100 },
        icno: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 },
        reason_desc: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 100 }
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


export default router;
