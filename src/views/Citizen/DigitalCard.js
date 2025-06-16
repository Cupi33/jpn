import React, { useRef, useState } from 'react';
import { Card, CardBody, Container, Row, Col, Button } from 'reactstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// --- Image paths from public folder ---
const cardHolderData = {
  name: 'MOHAMAD AMIRUL BIN ABDULLAH',
  icNumber: '900101-01-5555',
  address: 'NO 1, JALAN PUTERI 1/2, BANDAR PUTERI, 47100 PUCHONG, SELANGOR',
  gender: 'LELAKI',
  citizenship: 'WARGANEGARA',
  photoUrl: process.env.PUBLIC_URL + '/user.png',
  jataNegaraUrl: process.env.PUBLIC_URL + '/jata-negara.jpg',
  myJpnLogoUrl: process.env.PUBLIC_URL + '/jpn_ori.png',
};

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
  const cardRef = useRef(null); // <-- This ref will now point to the wrapper div
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadPdf = async () => {
    const input = cardRef.current; // This will now correctly get the div
    if (!input) {
      console.error("Card element not found. The ref is not attached.");
      return;
    }

    setIsLoading(true);
    console.log("STEP 1: Pre-loading all images...");

    try {
      const imageUrls = [
        cardHolderData.myJpnLogoUrl,
        cardHolderData.jataNegaraUrl,
        cardHolderData.photoUrl,
      ];
      await preloadImages(imageUrls);
      console.log("STEP 2: All images are loaded. Now running html2canvas.");

      const canvas = await html2canvas(input, {
        scale: 2,
        backgroundColor: '#eef7ff',
        useCORS: true,
      });

      console.log("STEP 3: Canvas created successfully.");
      const imgData = canvas.toDataURL('image/png');
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth() - 30;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 15, 15, pdfWidth, pdfHeight);
      console.log("STEP 4: Saving PDF.");
      pdf.save('Digital-ID-Card.pdf');

    } catch (error) {
      console.error("A critical error occurred during PDF generation:", error);
      alert("Sorry, could not generate the PDF. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  const cardStyles = `
    .id-card-wrapper { padding-top: 2rem; padding-bottom: 2rem; }
    .id-card { max-width: 650px; margin: 0 auto; /* Removed margin-top/bottom */ border-radius: 15px; font-family: 'Arial', sans-serif; background-color: #eef7ff; border: 1px solid #cddcff; overflow: hidden; }
    .id-card-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 2px solid #b0c4ff; }
    .id-card-header h5 { font-weight: bold; color: #002366; margin: 0; }
    .id-card-header img { height: 50px; }
    .id-card-photo { width: 100%; max-width: 150px; height: auto; border-radius: 8px; border: 3px solid #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .id-card-title { color: #003399; font-weight: 600; text-align: center; margin-bottom: 1.5rem; }
    .data-label { font-size: 0.8rem; color: #555; text-transform: uppercase; margin-bottom: 2px; }
    .data-value { font-size: 1rem; font-weight: bold; color: #111; word-wrap: break-word; }
    .data-field { margin-bottom: 1.2rem; }
    .page-logo { display: block; margin: 0 auto 20px auto; height: 50px; }
  `;

  return (
    <>
      <style>{cardStyles}</style>
      <Container className="id-card-wrapper">
        <Row className="justify-content-center">
          <Col lg="10" xl="8">
            <img 
              src={cardHolderData.myJpnLogoUrl} 
              alt="MyJPN Logo"
              className="page-logo"
            />
            
            {/* 
              --- THE FIX IS HERE ---
              We wrap the Card in a div and attach the ref to this div.
              html2canvas will now capture this div and everything inside it.
            */}
            <div ref={cardRef} style={{ margin: '1rem auto' }}>
              <Card className="id-card">
                <CardBody style={{ padding: '0' }}>
                  <div className="id-card-header">
                    <h5>MALAYSIA</h5>
                    <img src={cardHolderData.jataNegaraUrl} alt="Jata Negara" />
                  </div>
                  
                  <div style={{ padding: '1.5rem' }}>
                    <h4 className="id-card-title">KAD PENGENALAN</h4>
                    <Row>
                      <Col md="4" className="text-center mb-4 mb-md-0 d-flex align-items-center justify-content-center">
                        <img 
                          src={cardHolderData.photoUrl} 
                          alt="Card holder" 
                          className="id-card-photo"
                        />
                      </Col>
                      <Col md="8">
                        {/* Data fields remain the same */}
                        <div className="data-field">
                          <div className="data-label">Nama</div>
                          <div className="data-value">{cardHolderData.name}</div>
                        </div>
                        <div className="data-field">
                          <div className="data-label">No. K/P</div>
                          <div className="data-value">{cardHolderData.icNumber}</div>
                        </div>
                        <div className="data-field">
                          <div className="data-label">Alamat</div>
                          <div className="data-value">{cardHolderData.address}</div>
                        </div>
                        <Row>
                          <Col xs="6">
                            <div className="data-field">
                              <div className="data-label">Jantina</div>
                              <div className="data-value">{cardHolderData.gender}</div>
                            </div>
                          </Col>
                          <Col xs="6">
                            <div className="data-label">Warganegara</div>
                            <div className="data-value">{cardHolderData.citizenship}</div>
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </div>
            {/* --- END OF FIX --- */}

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