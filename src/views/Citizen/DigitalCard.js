import React from 'react';
import { Card, CardBody, Container, Row, Col } from 'reactstrap';

// --- Hardcoded Data Section ---
const cardHolderData = {
  name: 'MOHAMAD AMIRUL BIN ABDULLAH',
  icNumber: '900101-01-5555',
  address: 'NO 1, JALAN PUTERI 1/2, BANDAR PUTERI, 47100 PUCHONG, SELANGOR',
  gender: 'LELAKI',
  citizenship: 'WARGANEGARA',
  photoUrl: 'https://placehold.co/150x180/EFEFEF/333?text=Photo',
  jataNegaraUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Coat_of_arms_of_Malaysia.svg/240px-Coat_of_arms_of_Malaysia.svg.png',
  myJpnLogoUrl: 'https://www.myjpn.gov.my/wp-content/uploads/2023/10/logo-myjpn.png'
};
// ------------------------------


const DigitalIDCard = () => {

  // --- Inline CSS for Styling ---
  const cardStyles = `
    .id-card-wrapper {
        padding-top: 2rem; /* Adds space from the top of the container */
        padding-bottom: 2rem; /* Adds space at the bottom */
    }
    .id-card {
      max-width: 650px;
      margin: 1rem auto;
      border-radius: 15px;
      font-family: 'Arial', sans-serif;
      background: linear-gradient(135deg, #eef7ff, #d8eaff);
      box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
      border: 1px solid #cddcff;
    }
    .id-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 2px solid #b0c4ff;
      margin-bottom: 1rem;
    }
    .id-card-header h5 {
      font-weight: bold;
      color: #002366;
      margin: 0;
    }
    .id-card-header img {
      height: 50px;
    }
    .id-card-photo {
      width: 100%;
      max-width: 150px;
      height: auto;
      border-radius: 8px;
      border: 3px solid #fff;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }
    .id-card-title {
        color: #003399;
        font-weight: 600;
        text-align: center;
        margin-bottom: 1.5rem;
    }
    .data-label {
      font-size: 0.8rem;
      color: #555;
      text-transform: uppercase;
      margin-bottom: 2px;
    }
    .data-value {
      font-size: 1rem;
      font-weight: bold;
      color: #111;
      word-wrap: break-word;
    }
    .data-field {
        margin-bottom: 1.2rem;
    }
    .jpn-link {
        display: block;
        text-align: center;
        margin-top: 20px;
        font-weight: 500;
        color: #0056b3;
    }
    .page-logo {
        display: block;
        margin: 0 auto 20px auto;
        height: 50px;
    }
  `;
  // ------------------------------

  return (
    <>
      <style>{cardStyles}</style>

      {/* 
        This is the fix. 
        We use a simple Container with custom padding via the 'id-card-wrapper' class.
        This pushes everything down from the top, solving the overlap issue.
      */}
      <Container className="id-card-wrapper">
        <Row className="justify-content-center">
          <Col lg="10" xl="8">
            <img 
              src={cardHolderData.myJpnLogoUrl} 
              alt="MyJPN Logo"
              className="page-logo" 
            />
            
            <Card className="id-card">
              <CardBody>
                <div className="id-card-header">
                  <h5>MALAYSIA</h5>
                  <img src={cardHolderData.jataNegaraUrl} alt="Jata Negara" />
                </div>

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
                        <div className="data-field">
                          <div className="data-label">Warganegara</div>
                          <div className="data-value">{cardHolderData.citizenship}</div>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </CardBody>
            </Card>

          </Col>
        </Row>
      </Container>
    </>
  );
};

export default DigitalIDCard;