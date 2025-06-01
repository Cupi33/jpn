import React, { useEffect, useState } from 'react';
import { useNavigate} from 'react-router-dom';
import { 
    Card, CardBody, CardTitle, Container, Row, Col, Form, FormGroup, Input, Button, Label 
} from 'reactstrap';
import axios from 'axios';
import Swal from 'sweetalert2';


const ICApplication = () => {
    const [selectedReason, setSelectedReason] = useState(''); // 👈 create state to track the selected reason
    const navigate = useNavigate();
    const [reportFile, setReportFile] = useState(null); // 🆕 handle uploaded file
    const handleReasonChange = (e) => {
        setSelectedReason(e.target.value);
    };
    const [address, setAddress] = useState('');

const handleSubmit = async () => {
  const citizenID = sessionStorage.getItem('citizenID');

  if (!selectedReason) {
    Swal.fire('Sila pilih sebab permohonan.');
    return;
  }

  try {
    let response;

    if (selectedReason === 'ta') {
      if (!address.trim()) {
        Swal.fire('Sila masukkan alamat baru.');
        return;
      }

      // POST to /2 with JSON
      response = await axios.post('http://localhost:5000/icapply/2', {
        citizenID,
        address
      });

    } else if (selectedReason === 'ha') {
      // Validate file presence
      if (!reportFile) {
        Swal.fire('Sila muat naik surat laporan PDRM.');
        return;
      }

      // POST to /1 with FormData
      const formData = new FormData();
      formData.append('citizenID', citizenID);
      formData.append('reasons', selectedReason);
      formData.append('document', reportFile);

      response = await axios.post('http://localhost:5000/icapply/1', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

    } else {
      // POST to /1 without file
      response = await axios.post('http://localhost:5000/icapply/1', {
        citizenID,
        reasons: selectedReason
      });
    }

    const { data } = response;

    Swal.fire({
      icon: data.success ? 'success' : 'error',
      title: data.message,
      confirmButtonText: 'Pergi ke halaman utama',
    }).then(() => {
      if (data.success) {
        navigate('/citizenMenu/index');
      }
    });

  } catch (err) {
    console.error('Submission error:', err);

    if (err.response && err.response.data && err.response.data.message) {
      Swal.fire({
        icon: 'warning',
        title: 'Permohonan Ditolak',
        text: err.response.data.message,
      });
    } else {
      Swal.fire('Ralat server! Sila cuba lagi.');
    }
  }
};


    const [isLoading, setIsLoading] = useState(true); // optional, for UI control

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
                                Permohonan Kad Pengenalan
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
                                                            htmlFor="input-reasons"
                                                        >
                                                            Sebab Permohonan Kad Pengenalan
                                                        </label>
                                                        <Input
                                                            className="form-control"
                                                            id="input-reasons"
                                                            type="select"
                                                            value={selectedReason}
                                                            onChange={handleReasonChange}
                                                        >
                                                            <option value="">Pilih Sebab</option>
                                                            <option value="ha">Hilang Kad</option>
                                                            <option value="ta">Tukar Alamat</option>
                                                            <option value="mykid">Tukar MyKid ke MyKad</option>
                                                        </Input>
                                                    </FormGroup>
                                                </Col>
                                            </Row>

                                            {/* Conditionally render based on selected reason */}
                                            {selectedReason === 'ta' && (
                                                <Row>
                                                    <Col lg="12">
                                                        <FormGroup>
                                                            <label
                                                                className="form-control-label"
                                                                htmlFor="input-new-address"
                                                            >
                                                                Alamat Baru
                                                            </label>
                                                            <Input
                                                                className="form-control"
                                                                id="input-new-address"
                                                                placeholder="Masukkan Alamat Baru"
                                                                type="text"
                                                                value={address}
                                                                onChange={(e) => setAddress(e.target.value)}
                                                                />

                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}

                                            {selectedReason === 'ha' && (
                                                <Row>
                                                    <Col lg="12">
                                                        <FormGroup>
                                                            <Label
                                                                className="form-control-label"
                                                                htmlFor="upload-report"
                                                            >
                                                                Surat Laporan PDRM
                                                            </Label>
                                                            <Input
                                                                className="form-control"
                                                                id="upload-report"
                                                                type="file"
                                                                accept=".pdf"
                                                                onChange={(e) => setReportFile(e.target.files[0])}
                                                              />
                                                        </FormGroup>
                                                    </Col>
                                                </Row>
                                            )}
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

export default ICApplication;
