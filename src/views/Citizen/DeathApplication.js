import React, { useEffect , useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { Card, CardBody, CardTitle, Container, Row, Col , Form, FormGroup,Input, Button} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';

const DeathApplication = () => {

const navigate = useNavigate();
const [isLoading, setIsLoading] = useState(true); 

const [fullname, setFullname] = useState('');
const [icno, setICNO] = useState('');
const [deathDate, setDeathDate] = useState('');
const [relationship, setRelationship] = useState('');
const handleRelationshipChange = (e) => {
        setRelationship(e.target.value);
    };

const [errorDeceased, setErrorDeceased] = useState('');
const [successMsg, setSuccessMsg] = useState('');

const validateDeceased = async (fullname, icno) => {
        try {
            const response = await axios.post('http://localhost:5000/newbornapply/checkICName', {
            fullname: fullname.toUpperCase(), // Ensure consistent casing
            icno
            }, {
            headers: {
                'Content-Type': 'application/json'
            }
            });
            
            console.log('Validation response:', response.data); // Add logging
            return response.data.success ? response.data.user.citizenID : null;


        } catch (error) {
            console.error('Validation error:', error.response?.data || error.message);
            return false;
        }
};


 const handleSubmit = async () => {
    const citizenID = sessionStorage.getItem('citizenID');
    setErrorDeceased('');
    setSuccessMsg('');

    // Validate required fields
    if (!fullname || !icno || !relationship || !deathDate) {
      Swal.fire({
        icon: 'warning',
        title: 'Pastikan semua ruangan borang diisi',
        confirmButtonText: 'OK'
      });
      return;
    }

    try {
      // Step 1: Validate deceased exists
      const deceasedID = await validateDeceased(fullname, icno);
      if (!deceasedID) {
        setErrorDeceased('Nama penuh dan nombor IC si mati tidak sepadan.');
        return;
      }

      // Step 2: Check death application validity
      const checkResponse = await axios.post('http://localhost:5000/deathapply/checkDeathApp', {
        icno
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!checkResponse.data.success) {
        Swal.fire({
          icon: 'warning',
          title: checkResponse.data.message,
          confirmButtonText: 'OK'
        });
        return;
      }

      // Step 3: Submit application if all validations pass
      const response = await axios.post('http://localhost:5000/deathapply/1', {
        citizenID,
        deceasedID,
        relationship,
        deathDate
      });

      Swal.fire({
        icon: response.data.success ? 'success' : 'error',
        title: response.data.message,
        confirmButtonText: 'Pergi ke halaman utama',
      }).then(() => {
        if (response.data.success) {
          navigate('/citizenMenu/index');
        }
      });

    } catch (err) {
      console.error('Submission error:', err);
      Swal.fire('Ralat server! Sila cuba lagi.');
    }
  };

  useEffect(() => {
    const storedCitizenID = sessionStorage.getItem('citizenID');
    const storedUsername = sessionStorage.getItem('username');

    if (storedCitizenID && storedUsername) {
      setIsLoading(false);
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
                    <small className="text-danger">{errorDeceased}</small>
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

            <Row>
                                                  <Col lg="12">
                                                      <FormGroup>
                                                      <label
                                                          className="form-control-label"
                                                          htmlFor="input-dob"
                                                      >
                                                          Tarikh Kematian
                                                      </label>
                                                      <Input
                                                          className="form-control"
                                                          id="input-dob"
                                                          type="date"
                                                          max={new Date().toISOString().split("T")[0]} // 👈 Set maximum date to today
                                                          value={deathDate}
                                                          onChange={(e) => setDeathDate(e.target.value)}
                                                      />
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
                onClick={handleSubmit}
            >
                Hantar Permohonan
            </Button>
            {successMsg && <p className="text-success mt-2">{successMsg}</p>}
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
