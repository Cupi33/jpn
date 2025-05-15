import express from 'express';
import { execute } from "../../config/db.js";

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

export default router;