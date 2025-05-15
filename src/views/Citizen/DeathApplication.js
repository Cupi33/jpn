import React, { useEffect , useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { Card, CardBody, CardTitle, Container, Row, Col , Form, FormGroup,Input, Button} from 'reactstrap';

const DeathApplication = () => {

const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(true); 

const [fullname, setFullname] = useState('');
const [icno, setICNO] = useState('');
const [relationship, setRelationship] = useState('');
const handleRelationshipChange = (e) => {
        setRelationship(e.target.value);
    };


  useEffect(() => {
      console.log('Checking session storage...');
      const storedCitizenID = sessionStorage.getItem('citizenID');
      const storedUsername = sessionStorage.getItem('username');
  
      console.log('Current citizenID:', storedCitizenID);
      console.log('Current username:', storedUsername);
  
      if (storedCitizenID && storedUsername) {
        setIsLoading(false); // optional: indicate data is loaded
      } else {
        navigate('/authCitizen/login');
      }
    }, [navigate]);


    if (isLoading) {
      return (
        <Container className="mt-5 text-center">
          <h4>Loading...</h4>
        </Container>
      );
    }


    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md="8">
                <Card className="shadow">
  <CardBody>
    <CardTitle tag="h3" className="mb-4 text-center">
      Pendaftaran Kematian
    </CardTitle>
    <Row className="justify-content-center">
      <Col lg="8">
        <Form>
          <div className="pl-lg-4">
            <Row>
              <Col lg="12">
              <FormGroup>
                    <label
                        className="form-control-label"
                        htmlFor="input-fullname"
                    >
                        Nama Penuh Si Mati (Seperti Di Kad Pengenalan)
                    </label>
                    <Input
                        className="form-control"
                        id="input-fullname"
                        placeholder="Contoh: Muhammad Sufi Haikal Bin Saifuzbahari"
                        type="text"
                        value={fullname}
                        onChange={(e) => setFullname(e.target.value)}
                    />
              </FormGroup>
              </Col>
            </Row>

            <Row>
              <Col lg="12">
              <FormGroup>
                    <label
                        className="form-control-label"
                        htmlFor="input-fullname"
                    >
                        Nombor Kad Pengenalan Si Mati
                    </label>
                    <Input
                        className="form-control"
                        id="input-fullname"
                        placeholder="Contoh: 00001102010100"
                        type="text"
                        value={icno}
                        onChange={(e) => setICNO(e.target.value)}
                    />
              </FormGroup>
              </Col>
            </Row>
            <Row>
              <Col lg="12">
              <FormGroup>
                    <label
                        className="form-control-label"
                        htmlFor="input-relationship"
                    >
                        Hubungan Dengan Si Mati
                    </label>
                    <Input
                        className="form-control"
                        id="input-relationship"
                        type="select"
                        value={relationship}
                        onChange={handleRelationshipChange}
                        >

                        <option value="">Pilih Hubungan</option>
                        <option value="PARENT-CHILDREN">Ibu/Bapa kepada Anak</option>
                        <option value="CHILDREN-PARENT">Anak kepada Ibu/Bapa</option>
                        <option value="SIBLING">Adik-Beradik</option>
                        <option value="SPOUSE">Suami-Isteri</option>
                        <option value="OTHERS">Lain-lain</option>
                        
                    </Input>
             </FormGroup>
              </Col>
            </Row>
            <FormGroup>
              <label
                    className="form-control-label"
                    htmlFor="upload-police-report"
              > 
                Surat Kematian Daripada PDRM
              </label>
              <Input
                className="form-control"
                id="upload-police-report"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png" // Accept only certain file types
              />
           </FormGroup>

          </div>
          <hr className="my-4" />
          <div className="text-center">
            <Button 
                className="my-4" 
                color="primary" 
                type="button"
            >
                Hantar Permohonan
            </Button>
         </div>
        </Form>
      </Col>
    </Row>
  </CardBody>
</Card>
                </Col>
            </Row>
        </Container>
    );
};

export default DeathApplication;
