// --- START OF FILE Register.js (Final Corrected Version) ---

import {
  Button,
  Card,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Row,
  Col,
  Progress,
} from "reactstrap";
import { useState } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';

pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL}/pdf.worker.min.mjs`;

const escapeRegex = (string) => {
  if (typeof string !== 'string') return '';
  return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const Register = () => {
  const [fullName, setFullName] = useState('');
  const [icno, setIcno] = useState('');
  const [address, setAddress] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const [isValidated, setIsValidated] = useState(false);
  const [citizenID, setCitizenID] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const handleValidateMyKad = async () => {
    if (!fullName || !icno || !address || !selectedFile) {
      return Swal.fire("Ralat", "Sila lengkapkan semua medan dan muat naik fail Kad Pengenalan.", "error");
    }
    
    setIsLoading(true);
    setOcrProgress(0);

    try {
      let worker = await Tesseract.createWorker('eng', 1, {
        logger: m => {
          if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100));
        },
      });

      const fileReader = new FileReader();
      const imageFromPdf = await new Promise((resolve, reject) => {
        fileReader.onload = async function() {
          const typedarray = new Uint8Array(this.result);
          const pdf = await pdfjsLib.getDocument(typedarray).promise;
          const page = await pdf.getPage(1);
          const canvas = document.createElement('canvas');
          const viewport = page.getViewport({ scale: 2.0 });
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
          resolve(canvas.toDataURL('image/png'));
        };
        fileReader.onerror = reject;
        fileReader.readAsArrayBuffer(selectedFile);
      });

      const { data: { text } } = await worker.recognize(imageFromPdf);
      await worker.terminate();

      const icRegex = /(\d{12})/;
      const ocrIcMatch = text.match(icRegex);
      const ocrIcNo = ocrIcMatch ? ocrIcMatch[0] : '';
      
      let ocrName = '';
      if (ocrIcNo) {
        const nameRegex = new RegExp(`${ocrIcNo}\\s*\\n([^\n]+)`, 'i');
        const nameMatch = text.match(nameRegex);
        ocrName = nameMatch ? nameMatch[1].trim() : '';
      }
      
      let ocrAddress = '';
      if (ocrName) {
        // --- THIS IS THE CORRECTED LINE ---
        // We now use the raw `ocrName` (without cleaning it here) to find the starting point.
        // This ensures it matches the raw text from the OCR, imperfections and all.
        const addressRegex = new RegExp(`${escapeRegex(ocrName)}\\s*\\n([\\s\\S]+?)(?=WARGANEGARA|Agama|ISLAM|LELAKI|PEREMPUAN)`, 'i');
        const addressMatch = text.match(addressRegex);
        ocrAddress = addressMatch ? addressMatch[1].trim().replace(/\s+/g, ' ') : '';
      }

      const genderRegex = /(LELAKI|PEREMPUAN)/i;
      const religionRegex = /(ISLAM|KRISTIAN|BUDDHA|HINDU)/i;
      const ocrGender = text.match(genderRegex)?.[0].trim() || '';
      const ocrReligion = text.match(religionRegex)?.[0].trim() || '';
      
      const userIcNo = icno.replace(/-/g, '');
      
      // We still clean the name for the final comparison, which is correct.
      const cleanedOcrName = ocrName.replace(/[^a-zA-Z\s@/]/g, "").trim();

      if (cleanedOcrName.toUpperCase() !== fullName.toUpperCase() || ocrIcNo !== userIcNo) {
         setIsLoading(false);
         console.log("COMPARISON FAILED:");
         console.log(`Typed Name: "${fullName.toUpperCase()}" | Cleaned OCR Name: "${cleanedOcrName.toUpperCase()}"`);
         console.log(`Typed IC: "${userIcNo}" | OCR IC: "${ocrIcNo}"`);
         console.log(`Typed Address: "${address.toUpperCase().replace(/\s+/g, ' ')}" | OCR Address: "${ocrAddress.toUpperCase()}"`);
         console.log(`OCR Gender: "${ocrGender.toUpperCase()}"`);
         console.log(`OCR Religion: "${ocrReligion.toUpperCase()}"`);
         
         let failReason = [];
         if (cleanedOcrName.toUpperCase() !== fullName.toUpperCase()) {
           failReason.push("nama");
         }
         if (ocrIcNo !== userIcNo) {
           failReason.push("No. Kad Pengenalan");
         }
         const reasonText = failReason.join(' dan ');
         
         return Swal.fire("Pengesahan Gagal", `Maklumat ${reasonText} yang ditaip tidak sepadan dengan dokumen yang dimuat naik. Sila periksa semula.`, "error");
      }

      const dataToSend = {
        fullName: cleanedOcrName, 
        icno: ocrIcNo,
        address: ocrAddress,
        gender: ocrGender,
        religion: ocrReligion,
      };

      console.log("----------------------------------------");
      console.log("DATA BEING SENT TO BACKEND (/validate-mykad):");
      console.log(dataToSend);
      console.log("----------------------------------------");

      const validationResponse = await axios.post('http://localhost:5000/validate-mykad', dataToSend);

      if (validationResponse.data.success) {
        console.log("✅ Validation Successful! Citizen ID from backend:", validationResponse.data.citizenID);
        Swal.fire("Disahkan!", "Maklumat Kad Pengenalan anda sah. Sila teruskan untuk mencipta akaun.", "success");
        setCitizenID(validationResponse.data.citizenID);
        setIsValidated(true);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ralat tidak dijangka. Sila cuba lagi.";
      Swal.fire("Pengesahan Gagal", errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    // --- Validation Block ---
    if (!termsAccepted) {
      return Swal.fire("Perhatian", "Anda mesti bersetuju dengan terma dan syarat.", "warning");
    }
    if (!username || !password || !confirmPassword) {
      return Swal.fire("Ralat", "Sila lengkapkan nama pengguna dan kata laluan.", "error");
    }
    if (username.length < 5) {
      return Swal.fire("Ralat Nama Pengguna", "Nama pengguna mesti sekurang-kurangnya 5 aksara.", "error");
    }
    if (password.length < 6) {
      return Swal.fire("Ralat Kata Laluan", "Kata laluan mesti sekurang-kurangnya 6 aksara.", "error");
    }
    const numbersInPassword = password.match(/\d/g) || [];
    if (numbersInPassword.length < 2) {
      return Swal.fire("Ralat Kata Laluan", "Kata laluan mesti mengandungi sekurang-kurangnya dua nombor.", "error");
    }
    if (password !== confirmPassword) {
      return Swal.fire("Ralat", "Kata laluan dan konfirmasi kata laluan tidak sepadan.", "error");
    }
    // --- End of Validation Block ---
    
    try {
      const response = await axios.post('http://localhost:5000/register', {
        citizenID,
        username,
        password,
      });
      if (response.data.success) {
        Swal.fire('Pendaftaran Berjaya!', `Akaun untuk ${username} telah dicipta.`, 'success');
        setFullName(''); setIcno(''); setAddress(''); setSelectedFile(null);
        setUsername(''); setPassword(''); setConfirmPassword('');
        setTermsAccepted(false); setIsValidated(false); setCitizenID(null);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Ralat pelayan: Tidak dapat mendaftar.";
      Swal.fire("Pendaftaran Gagal", errorMessage, "error");
    }
  };

  return (
    <Col lg="6" md="8">
      <Card className="bg-secondary shadow border-0 p-4">
        {!isValidated ? (
          // STEP 1 FORM
          <>
            <div className="text-center text-muted mb-4">
              <b>Langkah 1: Pengesahan Identiti</b>
            </div>
            <Form role="form">
              <FormGroup><InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-hat-3" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Nama Penuh (seperti di Kad Pengenalan)" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </InputGroup></FormGroup>
              <FormGroup><InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-badge" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Nombor Kad Pengenalan" type="text" value={icno} onChange={(e) => setIcno(e.target.value)} />
              </InputGroup></FormGroup>
              <FormGroup><InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-square-pin" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Alamat (seperti di Kad Pengenalan)" type="textarea" value={address} onChange={(e) => setAddress(e.target.value)} />
              </InputGroup></FormGroup>
              <FormGroup>
                <label className="text-muted">Muat Naik Salinan Kad Pengenalan (PDF)</label>
                <Input type="file" accept="application/pdf" onChange={(e) => setSelectedFile(e.target.files[0])} />
              </FormGroup>
              {isLoading && (
                <div className="text-center mt-3">
                  <p>Memproses Kad Pengenalan... {ocrProgress > 0 && `${ocrProgress}%`}</p>
                  <Progress animated value={ocrProgress} className="my-2" style={{height: '10px'}}/>
                </div>
              )}
              <div className="text-center">
                <Button className="mt-4" color="primary" type="button" onClick={handleValidateMyKad} disabled={isLoading}>
                  {isLoading ? 'Memproses...' : 'Sahkan Kad Pengenalan'}
                </Button>
              </div>
            </Form>
          </>
        ) : (
          // STEP 2 FORM
          <>
            <div className="text-center text-muted mb-4">
              <b>Langkah 2: Cipta Akaun</b>
            </div>
            <Form role="form">
              <FormGroup><InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-circle-08" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Nama Pengguna" type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
              </InputGroup></FormGroup>
              <FormGroup><InputGroup className="input-group-alternative mb-3">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Kata Laluan" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </InputGroup></FormGroup>
              <FormGroup><InputGroup className="input-group-alternative">
                <InputGroupAddon addonType="prepend"><InputGroupText><i className="ni ni-lock-circle-open" /></InputGroupText></InputGroupAddon>
                <Input placeholder="Konfirmasi Kata Laluan" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </InputGroup></FormGroup>
              <Row className="my-4"><Col xs="12"><div className="custom-control custom-control-alternative custom-checkbox">
                <input className="custom-control-input" id="customCheckRegister" type="checkbox" checked={termsAccepted} onChange={(e) => setTermsAccepted(e.target.checked)} />
                <label className="custom-control-label" htmlFor="customCheckRegister">
                  <span className="text-muted">Saya bersetuju dengan <a href="#pablo" onClick={(e) => e.preventDefault()}>terma & syarat</a></span>
                </label>
              </div></Col></Row>
              <div className="text-center">
                <Button className="mt-4" color="primary" type="button" onClick={handleRegister}>
                  Daftar Akaun
                </Button>
              </div>
            </Form>
          </>
        )}
      </Card>
    </Col>
  );
};

export default Register;