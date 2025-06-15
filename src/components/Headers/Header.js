// reactstrap components
import axios from "axios";
import { useEffect, useState } from "react";
import { Card, CardBody, CardTitle, Container, Row, Col } from "reactstrap";

const Header = () => {
  const [statData, setStatData] = useState(null);

  console.log("1. Header component is rendering or re-rendering.");

  useEffect(() => {
    console.log("2. useEffect is running - API call will be made. This should only happen ONCE per mount.");

    axios
      .get("http://localhost:5000/stat/general")
      .then((response) => {
        if (response.data.success) {
          setStatData(response.data.stat);
        } else {
          console.error("Failed to fetch statistic data:", response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching statistic data:", error);
      });
    
    return () => {
        console.log("3. Header component is UNMOUNTING."); 
    };
  }, []);

  // --- START: Added logic for dynamic percentage display ---
  // Default values for the loading state
  let percentageText = "Loading...";
  let percentageClass = "text-muted";
  let percentageIcon = "fas fa-spinner fa-spin"; // A loading spinner icon

  if (statData) {
    const percentage = statData.peratus_peningkatan;
    percentageText = `${Math.abs(percentage)}%`; // Use Math.abs() to always show a positive number

    if (percentage > 0) {
      percentageClass = "text-success";
      percentageIcon = "fas fa-arrow-up";
    } else if (percentage < 0) {
      percentageClass = "text-danger";
      percentageIcon = "fas fa-arrow-down";
    } else {
      percentageClass = "text-warning"; // Use a neutral color for zero
      percentageIcon = "fas fa-minus";   // Use a neutral icon for zero
    }
  }
  // --- END: Added logic ---

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
                          JUMLAH RAKYAT MALAYSIA BERDAFTAR
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {statData?.jumlah_rakyat ?? "Loading..."}
                        </span>
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
                          Purata Umur Rakyat Malaysia
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {statData?.purata_umur ?? "Loading..."}
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
                          JUMLAH KEMATIAN TAHUN INI
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {statData?.jumlah_kematian ?? "Loading..."}
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
              <Col lg="6" xl="3">
                <Card className="card-stats mb-4 mb-xl-0">
                  <CardBody>
                    <Row>
                      <div className="col">
                        <CardTitle
                          tag="h5"
                          className="text-uppercase text-muted mb-0"
                        >
                          JUMLAH KES KEHILANGAN KAD PENGENALAN
                        </CardTitle>
                        <span className="h2 font-weight-bold mb-0">
                          {statData?.kad_hilang ?? "Loading..."}
                        </span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                          <i className="fas fa-percent" />
                        </div>
                      </Col>
                    </Row>
                    {/* --- START: Modified this section to be dynamic --- */}
                    <p className="mt-3 mb-0 text-muted text-sm">
                      <span className={`${percentageClass} mr-2`}>
                        <i className={percentageIcon} /> {percentageText}
                      </span>{" "}
                      <span className="text-nowrap">
                        Berbanding tahun lepas
                      </span>
                    </p>
                    {/* --- END: Modified section --- */}
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

export default Header;