import express from 'express';
import { execute, callProcedure } from "../../config/db.js";
import oracleDB from 'oracledb';
import multer from 'multer';


const router = express.Router();

// Setup multer for memory storage (no file system saving)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/1', upload.single('document'), async (req, res) => {
  const {
    citizenID, fatherID, motherID, babyName, gender,
    dob, religion, race, address
  } = req.body;

  const documentBuffer = req.file ? req.file.buffer : null;

  try {
    // Step 1: Get next appID from application sequence
    const appIDResult = await execute(`SELECT application_seq.NEXTVAL AS appID FROM dual`);
    const appID = appIDResult.rows[0].APPID;

    // Step 2: Insert into application table
    await execute(
      `INSERT INTO application (appID, citizenID, appType, appDate)
       VALUES (:1, :2, 'NEWBORN', SYSDATE)`,
      [appID, citizenID]
    );

    // Step 3: Get next nbAppID from newborn_application sequence
    const nbAppIDResult = await execute(`SELECT newborn_application_seq.NEXTVAL AS nbAppID FROM dual`);
    const nbAppID = nbAppIDResult.rows[0].NBAPPID;

    // Step 4: Insert into newborn_application with document
    await execute(
      `INSERT INTO NEWBORN_APPLICATION
        (nbAppID, APPID, fatherID, motherID, babyName, gender, date_of_birth, religion, race, address, document_detail)
       VALUES
        (:1, :2, :3, :4, :5, :6, TO_DATE(:7, 'YYYY-MM-DD'), :8, :9, :10, :11)`,
      [
        nbAppID, appID, fatherID, motherID,
        babyName, gender, dob, religion,
        race, address, documentBuffer
      ],
      { autoCommit: true }
    );

    // Step 5: Send success response
    res.status(201).json({
      success: true,
      message: 'PERMOHONAN PENDAFTARAN BAYI BERJAYA DIHANTAR',
      application: {
        appID,
        nbAppID
      }
    });

  } catch (err) {
    console.error('Application error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

router.post('/checkICName', async (req, res) => {
  const { fullname, icno } = req.body;

const cleanedFullname = fullname.replace(/_/g, ' ').trim().toUpperCase();
const cleanedICNo = icno.replace(/[^0-9]/g, '');

console.log('Cleaned IC:', cleanedICNo); // Should be '890112031453'
console.log('Cleaned Name:', cleanedFullname); // Should be 'LEE CHONG WEI'

  try {
    const result = await execute(
      `SELECT citizenID as "citizenID" FROM citizen 
        WHERE icno = (:1)
        AND UPPER(full_name) = upper(:2)`,
      [ cleanedICNo , cleanedFullname]  // this is NOT safe for real apps, but okay for learning
    );


    const user = result.rows[0];

     res.json({
      success: result.rows.length > 0,
      match: result.rows.length > 0,
      message: result.rows.length > 0 
        ? 'Match icno and full name' 
        : 'Unmatch icno and full name',
        user:
        {
          citizenID:user.citizenID,
        }
    });

  } catch (err) {
    console.error('Query error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
});

router.get('/tableNewborn', async (req, res) => {
  try {
    const query = `
      select ap.appID AS "appID", ct.icno as "icno",
      ap.appDate as "appDate",ap.status as "status"
      from application ap
      join citizen ct
      on ap.citizenID = ct.citizenID
      where ap.apptype = 'NEWBORN'
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

router.get('/newbornDetail/:appID', async (req, res) => {

  try {
    const appID = parseInt(req.params.appID);
    const query = `
     SELECT 
    r.full_name AS registrant_name,
    r.icno AS registrant_icno,
    r.citizenID AS registrantID,
    f.full_name AS father_name,
    m.full_name AS mother_name,
    f.icno AS father_icno,
    m.icno AS mother_icno,
    f.citizenID AS fatherID,
    m.citizenID AS motherID,
    f.religion AS father_religion,
    m.religion AS mother_religion,
    f.race AS father_race,
    m.race AS mother_race,
    f.address AS father_address,
    m.address AS mother_address,
    status_marriage(nb.fatherID,nb.motherID) AS status_marriage,
    nb.babyName as baby_name,
    nb.gender as gender,
    TO_CHAR(nb.date_of_birth, 'DD/MM/YYYY') AS  dob,
    nb.religion as religion,
    nb.race as race,
    nb.address as address
    FROM 
        NEWBORN_APPLICATION nb
    JOIN 
        CITIZEN f ON nb.fatherID = f.citizenID
    JOIN 
        CITIZEN m ON nb.motherID = m.citizenID 
    JOIN 
        APPLICATION ap ON nb.appID  = ap.appID
    JOIN 
        Citizen r ON ap.citizenID = r.citizenID
    WHERE 
        nb.appID = :appID
    `;

    const result = await execute(query,[appID]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No newborn application found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0] // ⬅️ This returns an array of rows
    });

  } catch (err) {
    console.error("Fetch error:", err);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
});

router.post('/reviewNewborn', async (req, res) => {
  const {
    appID,
    staffID,
    decision,
    comments,
    fullname,
    dob,
    registrantID,
    gender,
    race,
    religion,
    address,
    status_marriage,
    fatherID,
    motherID
  } = req.body;

  try {
    const result = await callProcedure(
      `BEGIN REVIEW_NEWBORN(:appID, :staffID, :decision, :comments, :fullname, :dob, 
      :registrantID, :gender, :race, :religion , :address, :status_marriage,
      :fatherID, :motherID, :message); END;`,
      {
        appID,
        staffID,
        decision,
        comments: comments || null,
         fullname,
        dob: new Date(dob),
        registrantID,
        gender,
        race,
        religion,
        address: address || null, // ensure null is passed when no address is needed
        status_marriage,
        fatherID,
        motherID,
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

router.get('/document/:appid', async (req, res) => {
  const { appid } = req.params;
  const { appType } = req.query; // NEWBORN, IC, DEATH
  let connection;

  // Determine table name based on appType
  let tableName;
  switch ((appType || '').toUpperCase()) {
    case 'IC':
      tableName = 'ic_application';
      break;
    case 'DEATH':
      tableName = 'death_application';
      break;
    case 'NEWBORN':
    default:
      tableName = 'newborn_application';
      break;
  }

  try {
    connection = await oracleDB.getConnection({
      user: "cupi",
      password: "password",
      connectString: "127.0.0.1:10521/jpn"
    });

    const result = await connection.execute(
      `SELECT document_detail FROM ${tableName} WHERE appid = :1`,
      [appid],
      { outFormat: oracleDB.OUT_FORMAT_OBJECT }
    );

    if (!result.rows.length || !result.rows[0].DOCUMENT_DETAIL) {
      return res.status(404).send('No document found');
    }

    const blob = result.rows[0].DOCUMENT_DETAIL;

    // Try getData() method
    if (typeof blob.getData === 'function') {
      try {
        const data = await blob.getData();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=document_${appid}.pdf`);
        return res.send(data);
      } catch (err) {
        console.log('getData() failed, falling back to stream:', err.message);
      }
    }

    // Stream fallback
    return new Promise((resolve) => {
      let chunks = [];
      blob.setEncoding('binary');

      blob.on('data', (chunk) => chunks.push(Buffer.from(chunk, 'binary')));
      blob.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=document_${appid}.pdf`);
        res.send(pdfBuffer);
        connection.close().catch(console.error);
        resolve();
      });
      blob.on('error', (err) => {
        console.error('BLOB stream error:', err);
        res.status(500).send('Error streaming document');
        connection.close().catch(console.error);
        resolve();
      });
    });

  } catch (err) {
    console.error('Document retrieval error:', err);
    res.status(500).send('Error fetching document');
    if (connection) connection.close().catch(console.error);
  }
});

export default router;