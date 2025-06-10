// reactstrap components
import axios from "axios";
import { useEffect, useState } from "react";
import {
     Card,
      CardBody, 
      CardTitle, 
      Container,
      Row,
      Col,
      Button
    } from "reactstrap";

import { useNavigate } from "react-router-dom";

const AdminStatHeader = () => {

    const navigate = useNavigate();
  console.log("1. Header component is rendering or re-rendering.");



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
                          INFORMASI KEPENDUDUKAN RAKYAT MALAYSIA
                        </CardTitle>
                        <Button className="my-4" type="button" color="primary" >
                            SEMAK
                        </Button>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
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
                          INFORMASI KELAHIRAN BAYI DI MALAYSIA
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          <Button className="my-4" type="button" color="primary" onClick={() => navigate('/statistic/statAdminNewborn')}>
                            SEMAK
                        </Button>
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-chart-pie" />
                        </div>
                      </Col>
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
                          INFORMASI KEMATIAN RAKYAT MALAYSIA
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          <Button className="my-4" type="button" color="primary" >
                            SEMAK
                        </Button>
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                          <i className="fas fa-users" />
                        </div>
                      </Col>
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

export default AdminStatHeader;