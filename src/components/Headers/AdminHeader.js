import { useState, useEffect } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col, Button } from "reactstrap";
import { useNavigate } from "react-router-dom";

const AdminHeader = () => {
  // 1. State to store the fetched counts
  const [pendingCounts, setPendingCounts] = useState({
    newborn: 0,
    death: 0,
    ic: 0,
  });

  const navigate = useNavigate();
  // 2. useEffect to fetch data when the component mounts
  useEffect(() => {
    const fetchPendingTotals = async () => {
      try {
        const response = await fetch('http://localhost:5000/adminstat/applyPendingTotal'); 
        const data = await response.json();

        if (data.success) {
          // Create a new object to hold the counts from the API response
          const newCounts = { newborn: 0, death: 0, ic: 0 };

          // 3. Process the API data array
          data.stat.forEach(item => {
            if (item.APPTYPE === 'NEWBORN') {
              newCounts.newborn = item.TOTAL;
            } else if (item.APPTYPE === 'DEATH') {
              newCounts.death = item.TOTAL;
            } else if (item.APPTYPE === 'IC') {
              newCounts.ic = item.TOTAL;
            }
          });

          // Update the state with the new counts
          setPendingCounts(newCounts);
        } else {
          console.error("API returned an error:", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch pending totals:", error);
      }
    };

    fetchPendingTotals();
  }, []); // The empty array [] ensures this effect runs only once after the component mounts

  return (
    <>
      <div className="header bg-gradient-danger pb-8 pt-5 pt-md-8">
        <Container fluid>
          <div className="header-body">
            {/* Card stats */}
            <Row>
              {/* Card for Newborn Applications */}
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
                        {/* 4. Display the state value here */}
                        <span className="h2 font-weight-bold mb-0">
                          {pendingCounts.newborn}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-danger text-white rounded-circle shadow">
                          <i className="fas fa-chart-bar" />
                        </div>
                      </Col>
                      <div>
                        <Button className="my-4" type="button" color="primary" onClick={() => navigate('/adminApplication/checkNewborn')}>
                            SEMAK
                        </Button>
                      </div>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              {/* Card for Death Applications */}
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
                        {/* 4. Display the state value here */}
                        <span className="h2 font-weight-bold mb-0">
                          {pendingCounts.death}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-warning text-white rounded-circle shadow">
                          <i className="fas fa-chart-pie" />
                        </div>
                      </Col>
                      <div>
                        <Button className="my-4" type="button" color="primary" onClick={() => navigate('/adminApplication/checkDeath')}>
                            SEMAK
                        </Button>
                      </div>
                    </Row>
                  </CardBody>
                </Card>
              </Col>
              {/* Card for IC Applications */}
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
                        {/* 4. Display the state value here */}
                        <span className="h2 font-weight-bold mb-0">
                          {pendingCounts.ic}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-yellow text-white rounded-circle shadow">
                          <i className="fas fa-users" />
                        </div>
                      </Col>
                      <div>
                        <Button className="my-4" type="button" color="primary" onClick={() => navigate('/adminApplication/checkIC')}>
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