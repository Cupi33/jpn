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
  import { useEffect , useState } from "react";

  import { Link , useNavigate} from "react-router-dom";
  
  const CheckApplication = () => {

    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      console.log('Checking session storage...');
      const storedStaffID = sessionStorage.getItem('staffID');
      const storedUsername = sessionStorage.getItem('username');

      console.log('Current staffID:', storedStaffID);
      console.log('Current username:', storedUsername);

      if (storedStaffID && storedUsername) {
        setIsLoading(false); // optional: indicate data is loaded
      } else {
        navigate('/authAdmin/loginAdmin');
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
  
          {/* First Row: 2 cards */}
          <Row>
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Semak</h6>
                      <h2 className="mb-0">Permohonan Kelahiran Bayi</h2>
                      <h6 className="mb-1">Sila Tekan Ikon</h6>
                    </Col>
                    <Col className="col-auto">
                      <Link to="/adminApplication/checkNewborn">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-baby" />
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody />
              </Card>
            </Col>
  
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Semak</h6>
                      <h2 className="mb-0">Pendaftaran Kematian</h2>
                      <h6 className="mb-1">Sila Tekan Ikon</h6>
                    </Col>
                    <Col className="col-auto">
                      <Link to="/adminApplication/checkDeath">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-skull" />
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody />
              </Card>
            </Col>
          </Row>
  
          {/* Second Row: 1 card */}
          <Row>
            <Col lg="6" className="mb-4">
              <Card className="shadow">
                <CardHeader className="bg-transparent">
                  <Row className="align-items-center">
                    <Col>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Semak</h6>
                      <h2 className="mb-0">Pendaftaran Kad Pengenalan</h2>
                      <h6 className="mb-1">Sila Tekan Ikon</h6>
                    </Col>
                    <Col className="col-auto">
                      <Link to="/adminApplication/checkIC">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="ni ni-credit-card" />
                        </div>
                      </Link>
                    </Col>
                  </Row>
                </CardHeader>
                <CardBody />
              </Card>
            </Col>
          </Row>
        </Container>
      </>
    );
  };
  
  export default CheckApplication;
  