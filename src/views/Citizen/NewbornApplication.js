import React from 'react';
import { Card, CardBody, CardTitle, Container, Row, Col , Form, FormGroup,Input, Button} from 'reactstrap';

const NewbornApplication = () => {
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
                                            type="select" >
                                            <option value="">Pilih Jantina</option>
                                            <option value="Lelaki">Lelaki</option>
                                            <option value="Perempuan">Perempuan</option>
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
                                            type="select" >
                                            <option value="">Pilih Agama</option>
                                            <option value="Islam">Islam</option>
                                            <option value="Buddha">Buddha</option>
                                            <option value="Hindu">Hindu</option>
                                            <option value="Kristian">Kristian</option>
                                            <option value="Lain-lain">Lain-lain</option>
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
                                            type="select" >
                                            <option value="">Pilih Bangsa</option>
                                            <option value="Melayu">Melayu</option>
                                            <option value="Cina">Cina</option>
                                            <option value="India">India</option>
                                            <option value="Lain-lain">Lain-lain</option>
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
                                        />
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
                                        />
                                </FormGroup>
                                </Col>
                                </Row>

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
                                        />
                                </FormGroup>
                                </Col>
                                </Row>   
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

export default NewbornApplication;
