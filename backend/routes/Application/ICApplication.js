import express from 'express';
import { execute } from "../../config/db.js";

const router = express.Router();

router.post('/1', async (req, res) => {
  const { citizenID, reasons } = req.body;

  try {
    // Step 1: Get next appID from application sequence
    const appIDResult = await execute(`SELECT application_seq.NEXTVAL AS appID FROM dual`);
    const appID = appIDResult.rows[0].APPID;

    // Step 2: Insert into application table
    await execute(
      `INSERT INTO application (appID, citizenID, appType, appDate)
       VALUES (:1, :2, 'IC', SYSDATE)`,
      [appID, citizenID]
    );

    // Step 3: Get next icAppID from ic_application sequence
    const icAppIDResult = await execute(`SELECT ic_application_seq.NEXTVAL AS icAppID FROM dual`);
    const icAppID = icAppIDResult.rows[0].ICAPPID;

    // Step 4: Insert into ic_application with its own icAppID, and link to appID
    await execute(
      `INSERT INTO ic_application (icAppID, appID, reason)
       VALUES (:1, :2, :3)`,
      [icAppID, appID, reasons]
    );

    // Step 5: Commit
    await execute('COMMIT');

    // Step 6: Send success response
    res.status(201).json({
      success: true,
      message: 'IC Application sent successfully',
      application: {
        appID,
        icAppID
      }
    });

  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/2', async (req, res) => {
  const { citizenID, address } = req.body;

  try {
    // Step 1: Get next appID from application sequence
    const appIDResult = await execute(`SELECT application_seq.NEXTVAL AS appID FROM dual`);
    const appID = appIDResult.rows[0].APPID;

    // Step 2: Insert into application table
    await execute(
      `INSERT INTO application (appID, citizenID, appType, appDate)
       VALUES (:1, :2, 'IC', SYSDATE)`,
      [appID, citizenID]
    );

    // Step 3: Get next icAppID from ic_application sequence
    const icAppIDResult = await execute(`SELECT ic_application_seq.NEXTVAL AS icAppID FROM dual`);
    const icAppID = icAppIDResult.rows[0].ICAPPID;

    // Step 4: Insert into ic_application with its own icAppID, and link to appID
    await execute(
      `INSERT INTO ic_application (icAppID, appID, reason, newaddress)
       VALUES (:1, :2, 'ta',:3)`,
      [icAppID, appID, address]
    );

    // Step 5: Commit
    // await execute('COMMIT');

    //Step 6:Update address in citizen table
    await execute(
  `UPDATE CITIZEN
   SET address = :1
   WHERE citizenID = :2`,
  [address, citizenID]
);


    // Step 5: Commit
    await execute('COMMIT');

    // Step 6: Send success response
    res.status(201).json({
      success: true,
      message: 'IC Application sent successfully',
      application: {
        appID,
        icAppID
      }
    });

  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});
export default router;
