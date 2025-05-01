

// reactstrap components
import { Card, CardBody, CardTitle, Container, Row, Col, Button } from "reactstrap";

const AdminHeader = () => {
  return (
    <>
      <div className="header bg-gradient-info pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          PERMOHONAN PENDAFTARAN BAYI YANG BELUM DISEMAK
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          400
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                      <div>
                        <Button className="my-4" type="button" color="primary">
                            SEMAK
                        </Button>
                      </div>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          PERMOHONAN PENDAFTARAN KEMATIAN YANG BELUM DISEMAK
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">350</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-chart-pie" />
                        </div>
                      </Col>
                      <div>
                        <Button className="my-4" type="button" color="primary">
                            SEMAK
                        </Button>
                      </div>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          PERMOHONAN KAD PENGENALAN YANG BELUM DISEMAK
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">92</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                          <i className="fas fa-users" />
                        </div>
                      </Col>
                      <div>
                        <Button className="my-4" type="button" color="primary">
                            SEMAK
                        </Button>
                      </div>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
            </Row>
          </div>
        </Container>
      </div>
    </>
  );
};

export default AdminHeader;
