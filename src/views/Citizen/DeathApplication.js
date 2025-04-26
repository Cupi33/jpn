import React from 'react';
import { Card, CardBody, CardTitle, Container, Row, Col , Form, FormGroup,Input, Button} from 'reactstrap';

const DeathApplication = () => {
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
                        htmlFor="input-relationship"
                    >
                        Hubungan Dengan Si Mati
                    </label>
                    <Input
                        className="form-control"
                        id="input-relationship"
                        type="select" >
                        <option value="">Pilih Hubungan</option>
                        <option value="Ibu/Bapa-Anak">Ibu/Bapa-Anak</option>
                        <option value="Adik-Beradik">Adik-Beradik</option>
                        <option value="Suami-Isteri">Suami-Isteri</option>
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
