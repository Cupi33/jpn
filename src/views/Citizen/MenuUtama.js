// reactstrap components
import {
    Card,
    CardBody,
    Container,
    Row,
    Col,
    CardHeader
  } from "reactstrap";
  // core components
  
  const MenuUtama = () => {
    
    return (
      <>
        {/* Page content */}
        <Container className="mt--7" fluid>
          <Row>
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">
                        Pendaftaran
                      </h6>
                      <h2 className="mb-0">Kelahiran Bayi</h2>
                    </Col>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="fas fa-baby" />
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* You can add content here if needed */}
                </CardBody>
              </Card>
            </Col>
          
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">
                        Pendaftaran
                      </h6>
                      <h2 className="mb-0">Kematian</h2>
                    </Col>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="fas fa-skull" />
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* You can add content here if needed */}
                </CardBody>
              </Card>
            </Col>
            
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">
                        Permohonan
                      </h6>
                      <h2 className="mb-0">Kad Pengenalan</h2>
                    </Col>
                    <Col className="col-auto">
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="ni ni-credit-card" />
                      </div>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody>
                  {/* You can add content here if needed */}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  };
  
  export default MenuUtama;