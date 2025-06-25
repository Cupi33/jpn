import React, { useRef, useState } from 'react';
import { CardBody, Container, Row, Col, Button } from 'reactstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- UPDATED DATA & ASSETS TO MATCH MYKAD SAMPLE ---
const cardHolderData = {
  name: 'Mohd Asri Bin Hashim',
  icNumber: '850315044251',
  address: 'No 12, Jalan Melati 5, Taman Seri Damai,\n 43000 Kajang, Selangor',
  gender: 'LELAKI',
  citizenship: 'WARGANEGARA',
  religion: 'ISLAM',
  photoUrl: process.env.PUBLIC_URL + '/user.png',
  flagUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Flag_of_Malaysia.svg/125px-Flag_of_Malaysia.svg.png',
};

// Image preloader remains the same, it's very reliable.
const preloadImages = (urls) => {
  const promises = urls.map(url => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous'; 
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image at ${url}`));
      img.src = url;
    });
  });
  return Promise.all(promises);
};

const DigitalIDCard = () => {
  const cardRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  // PDF Download logic remains the same.
  const handleDownloadPdf = async () => {
    const input = cardRef.current;
    if (!input) {
      console.error("Card element not found.");
      return;
    }

    setIsLoading(true);
    try {
      const imageUrls = [cardHolderData.photoUrl, cardHolderData.flagUrl];
      await preloadImages(imageUrls);
      
      const canvas = await html2canvas(input, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: null,
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a5' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('MyKad-Digital.pdf');
    } catch (error) {
      console.error("PDF generation error:", error);
      alert("Could not generate PDF. Please check the console.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CSS FOR AUTHENTIC MYKAD DESIGN ---
  const cardStyles = `
    .mykad-card-wrapper {
      padding: 2rem 0;
    }
    .mykad-card {
      max-width: 800px;
      margin: 1rem auto;
      border-radius: 20px;
      font-family: 'Helvetica Neue', 'Arial', sans-serif;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
      background: linear-gradient(120deg, #d4eaf7 0%, #a7d7f2 100%);
      position: relative;
      overflow: hidden;
      border: 1px solid #fff3;
    }
    .mykad-card::before {
      content: '';
      position: absolute;
      top: 0; left: 0; right: 0; bottom: 0;
      background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    }
    .mykad-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 25px;
    }
    .mykad-title h1 { font-size: 24px; color: #003366; margin: 0; font-weight: 700; letter-spacing: 1px; }
    .mykad-title h2 { font-size: 30px; color: #003366; margin: 0; font-weight: 900; }
    .mykad-logos { display: flex; align-items: center; gap: 15px; }
    .mykad-logo-text { color: #0052a4; font-weight: 900; font-size: 28px; font-style: italic; }
    .mykad-logo-text sup { color: #d42129; font-size: 16px; font-weight: 700; }
    .mykad-flag { height: 35px; border: 1px solid #ccc; }
    .mykad-body {
      display: flex;
      padding: 10px 25px 25px 25px;
      gap: 20px;
    }
    .mykad-left-col { flex: 1.2; display: flex; flex-direction: column; }
    .mykad-right-col { flex: 0.8; }
    .mykad-ic-number { font-size: 28px; color: #1d3557; font-weight: 600; letter-spacing: 1px; margin-bottom: 20px; }
    .gold-chip {
      width: 60px; height: 50px; background: linear-gradient(135deg, #fde492, #d1a440);
      border-radius: 6px; margin-bottom: 30px; border: 1px solid #b8913a;
      position: relative;
    }
    .gold-chip::before, .gold-chip::after { content: ''; position: absolute; background: #b8913a; }
    .gold-chip::before { width: 80%; height: 2px; top: 20px; left: 10%; }
    .gold-chip::after { width: 2px; height: 70%; left: 30px; top: 15%; }
    .mykad-field { margin-bottom: 12px; }
    .mykad-field p { font-size: 16px; color: #1d3557; font-weight: 600; white-space: pre-wrap; margin: 0; line-height: 1.3; }
    .photo-area { position: relative; }
    .main-photo { width: 100%; max-width: 220px; border-radius: 8px; border: 4px solid white; box-shadow: 0 4px 8px rgba(0,0,0,0.2); }
    .ghost-photo { position: absolute; top: -20px; left: -110px; opacity: 0.2; width: 130px; filter: grayscale(100%) contrast(1.5); }

    /* --- CSS CHANGES ARE HERE --- */
    .bottom-fields-container {
      margin-top: 10px;
      max-width: 220px; /* Match the photo's width for alignment */
      margin-left: auto;
      margin-right: auto;
    }
    .bottom-fields-row {
      display: flex;
      justify-content: space-around; /* Distributes the items nicely */
      margin-top: 5px;
    }
    /* --- END OF CSS CHANGES --- */
  `;

  return (
    <>
      <style>{cardStyles}</style>
      <Container className="mykad-card-wrapper">
        <Row className="justify-content-center">
          <Col lg="10" xl="9">
            <div className="mykad-card" ref={cardRef}>
              <div className="mykad-header">
                {/* ...header content... */}
                 <div className="mykad-title">
                  <h1>KAD PENGENALAN</h1>
                  <h2>MALAYSIA</h2>
                </div>
                <div className="mykad-logos">
                  <span className="mykad-logo-text">MyKad<sup>®</sup></span>
                  <img src={cardHolderData.flagUrl} alt="Malaysian Flag" className="mykad-flag" />
                </div>
              </div>

              <CardBody className="mykad-body">
                <div className="mykad-left-col">
                  {/* ...left column content... */}
                  <div className="mykad-ic-number">{cardHolderData.icNumber}</div>
                  <div className="gold-chip"></div>
                  <div className="mykad-field">
                    <p>{cardHolderData.name}</p>
                  </div>
                  <div className="mykad-field">
                    <p>{cardHolderData.address}</p>
                  </div>
                </div>

                <div className="mykad-right-col">
                  <div className="photo-area">
                    <img src={cardHolderData.photoUrl} alt="Ghost" className="ghost-photo" />
                    <img src={cardHolderData.photoUrl} alt="Card Holder" className="main-photo" />
                  </div>
                  
                  {/* --- JSX STRUCTURE IS CHANGED HERE --- */}
                  <div className="bottom-fields-container">
                    {/* First row: Citizenship */}
                    <div className="mykad-field text-center">
                      <p>{cardHolderData.citizenship}</p>
                    </div>
                    {/* Second row: Religion and Gender */}
                    <div className="bottom-fields-row">
                      <div className="mykad-field text-center">
                        <p>{cardHolderData.religion}</p>
                      </div>
                      <div className="mykad-field text-center">
                        <p>{cardHolderData.gender}</p>
                      </div>
                    </div>
                  </div>
                  {/* --- END OF JSX CHANGES --- */}

                </div>
              </CardBody>
            </div>

            <div className="text-center mt-4">
              <Button color="primary" onClick={handleDownloadPdf} disabled={isLoading}>
                {isLoading ? 'Preparing PDF...' : 'Download as PDF'}
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DigitalIDCard;