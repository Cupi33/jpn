import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Card,
  CardBody,
  Container,
  Row,
  Col,
  CardHeader
} from "reactstrap";

const MenuUtama = () => {
  const navigate = useNavigate();
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
                      <h6 className="mb-1">Sila Tekan Ikon</h6>
                    </Col>
                    <Col className="col-auto">
                      <Link to ="/applicationCitizen/NewbornApplication" >
                      <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                        <i className="fas fa-baby" />
                      </div>
                      </Link>
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
                      <h6 className="mb-1">Sila Tekan Ikon</h6>
                    </Col>
                    <Col className="col-auto">
                      <Link to="/applicationCitizen/DeathApplication">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-skull" />
                        </div>
                      </Link>
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
                      <h6 className="mb-1">Sila Tekan Ikon</h6>
                    </Col>
                    <Col className="col-auto">
                      <Link to= "/applicationCitizen/ICApplication">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="ni ni-credit-card" />
                        </div>
                      </Link>
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