import express from 'express';
import { execute,callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';

const router = express.Router();

router.post('/1', async (req, res) => {
  const { citizenID, deceasedID, relationship,deathDate } = req.body;

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

    // Step 4: Insert into ic_application with its own icAppID, and link to appID
    await execute(
      `INSERT INTO DEATH_APPLICATION
      (deathAppID, appID, deceasedID , relationship,deathDate)
      values (:1,:2,:3,:4,TO_DATE(:5,'yyyy-mm-dd'))`,
      [deathAppID, appID, deceasedID, relationship, deathDate]
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
    ('BEGIN display_death_detail(:appID, :full_name, :icno, :deceased_name, :deceased_icno, :relationship, :relationship_system); END;',
      {
        appID,
        full_name: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        icno: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 },
        deceased_name: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 50 },
        deceased_icno: { dir: oracleDB.BIND_OUT, type: oracleDB.STRING, maxSize: 20 },
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

export default router;