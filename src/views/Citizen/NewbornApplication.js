import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardTitle, Container, Row, Col, Form, FormGroup, Input, Button } from 'reactstrap';
import axios from 'axios';

const NewbornApplication = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true); // optional if you're using isLoading

    const [fullname,setFullName] = useState('');
    const [gender,setGender] = useState('');
    const [religion,setReligion] = useState('');
    const [race,setRace] = useState('');
    const [address,setAddress] = useState('');
    const [dob,setDob] = useState('');
    const [fatherFullname,setFatherFullName] = useState('');
    const [fatherICNO,setFatherICNO] = useState('');
    const [motherFullname,setMotherFullName] = useState('');
    const [motherICNO,setMotherICNO] = useState('');
    
    const [errorFather, setErrorFather] = useState('');
    const [errorMother, setErrorMother] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    
    const validateParent = async (fullname, icno) => {
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
    return response.data.success;

  } catch (error) {
    console.error('Validation error:', error.response?.data || error.message);
    return false;
  }
};

   const handleSubmit = async () => {
    setErrorFather('');
    setErrorMother('');
    setSuccessMsg('');

    const fatherValid = await validateParent(fatherFullname, fatherICNO);
    const motherValid = await validateParent(motherFullname, motherICNO);

    if (!fatherValid) {
      setErrorFather('Nama penuh dan nombor IC bapa tidak sepadan.');
    }
    if (!motherValid) {
      setErrorMother('Nama penuh dan nombor IC ibu tidak sepadan.');
    }

    if (fatherValid && motherValid) {
      setSuccessMsg('Maklumat ibu bapa telah disahkan!');
      // You can proceed with the next step, e.g., form submission to DB
    }
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
                        Pendaftaran Bayi (Bahagian Bayi)
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
                                            Nama Penuh Bayi
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-fullname"
                                            placeholder="Contoh: Muhammad Sufi Haikal Bin Saifuzbahari"
                                            type="text"
                                            value={fullname}
                                            onChange={(e) => setFullName(e.target.value)}
                                        />
                                </FormGroup>
                                </Col>
                                </Row>

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-gender"
                                        >
                                            Jantina
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-gender"
                                            type="select" 
                                            value={gender}
                                            onChange={(e) => setGender(e.target.value)}
                                            >

                                            <option value="">Pilih Jantina</option>
                                            <option value="LELAKI">Lelaki</option>
                                            <option value="PEREMPUAN">Perempuan</option>
                                        </Input>
                                </FormGroup>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-religion"
                                        >
                                            Agama
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-religion"
                                            type="select"
                                            value={religion}
                                            onChange={(e) => setReligion(e.target.value)}
                                             >

                                            <option value="">Pilih Agama</option>
                                            <option value="ISLAM">Islam</option>
                                            <option value="BUDDHA">Buddha</option>
                                            <option value="HINDU">Hindu</option>
                                            <option value="KRISTIAN">Kristian</option>
                                            <option value="LAIN-LAIN">Lain-lain</option>
                                        </Input>
                                </FormGroup>
                                </Col>
                                </Row>
                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-race"
                                        >
                                            Bangsa
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-race"
                                            type="select"
                                            value={race}
                                            onChange={(e) => setRace(e.target.value)}
                                            >
                                            <option value="">Pilih Bangsa</option>
                                            <option value="MELAYU">Melayu</option>
                                            <option value="CINA">Cina</option>
                                            <option value="INDIA">India</option>
                                            <option value="LAIN-LAIN">Lain-lain</option>
                                        </Input>
                                </FormGroup>
                                </Col>
                                </Row>

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-address"
                                        >
                                            Alamat
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-address"
                                            placeholder="Contoh: No 2 Jalan Talam 4 23200 Bera Pahang"
                                            type="text"
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                        />
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
                                            Tarikh Lahir
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-dob"
                                            type="date"
                                            max={new Date().toISOString().split("T")[0]} // 👈 Set maximum date to today
                                            value={dob}
                                            onChange={(e) => setDob(e.target.value)}
                                        />
                                        </FormGroup>
                                    </Col>
                                </Row>


                                <FormGroup>
                                <label
                                        className="form-control-label"
                                        htmlFor="upload-police-report"
                                > 
                                    Sijil Lahir Daripada Hospital
                                </label>
                                <Input
                                    className="form-control"
                                    id="upload-hospital-report"
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png" // Accept only certain file types
                                />
                            </FormGroup>

                            </div>
                            </Form>
                        </Col>
                        </Row>
                    </CardBody>
               </Card>
                </Col>
            </Row>

            {/* Add margin between card 1 and card 2 */}
            <div className="my-5"></div>

            <Row className='justify-content-center'> 
                {/* {untuk form pendaftaran newborn (ibu bapa)} */}
                <Col md="8">
                <Card className="shadow">
                    <CardBody>
                        <CardTitle tag="h3" className="mb-4 text-center">
                        Pendaftaran Bayi (Bahagian Ibu Bapa)
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
                                            htmlFor="input-fatherFullname"
                                        >
                                            Nama Penuh Bapa (Seperti Di Kad Pengenalan)
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-fatherFullname"
                                            placeholder="Contoh: Muhammad Sufi Haikal Bin Saifuzbahari"
                                            type="text"
                                            value={fatherFullname}
                                            onChange={(e) => 
                                              {
                                                 const cleanValue = e.target.value.replace(/_/g, ' ').trim();
                                                 setFatherFullName(cleanValue);
                                              }
                                              }
                                        />
                                        <small className="text-danger">{errorFather}</small>
                                </FormGroup>
                                </Col>
                                </Row>

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-icnoFather"
                                        >
                                            Nombor Kad Pengenalan Bapa
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-icnoFather"
                                            placeholder="Contoh: 00001102010100"
                                            type="text"
                                                onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
                                                }}
                                            value={fatherICNO}
                                            onChange={(e) => 
                                              {
                                                 const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                                                 setFatherICNO(cleanValue);
                                              }
                                              }
                                        />
                                </FormGroup>
                                </Col>
                                </Row>

                                {/* Mother */}
                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-motherFullname"
                                        >
                                            Nama Penuh Ibu (Seperti Di Kad Pengenalan)
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-motherFullname"
                                            placeholder="Contoh: Muhammad Sufi Haikal Bin Saifuzbahari"
                                            type="text"
                                            value={motherFullname}
                                            onChange={(e) => 
                                              {
                                                 const cleanValue = e.target.value.replace(/_/g, ' ').trim();
                                                 setMotherFullName(cleanValue);
                                              }
                                              }
                                        />
                                        <small className="text-danger">{errorMother}</small>
                                </FormGroup>
                                </Col>
                                </Row>  

                                <Row>
                                <Col lg="12">
                                <FormGroup>
                                        <label
                                            className="form-control-label"
                                            htmlFor="input-icnomother"
                                        >
                                            Nombor Kad Pengenalan Ibu
                                        </label>
                                        <Input
                                            className="form-control"
                                            id="input-icnoMother"
                                            placeholder="Contoh: 00001102010100"
                                            type="text"
                                                onInput={(e) => {
                                                e.target.value = e.target.value.replace(/[^0-9]/g, ''); // Allow only digits
                                                }}
                                            value={motherICNO}
                                            onChange={(e) => 
                                              {
                                                 const cleanValue = e.target.value.replace(/[^0-9]/g, '');
                                                 setMotherICNO(cleanValue);
                                              }
                                              }
                                        />
                                </FormGroup>
                                </Col>
                                </Row> 
                            </div>

                            <hr className="my-4" />
                            <div className="text-center">
                                <Button color="primary" type="button" onClick={handleSubmit}>
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

export default NewbornApplication;