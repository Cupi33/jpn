import axios from "axios";
import { useEffect, useState } from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Bar } from "react-chartjs-2";
// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Progress,
  Table,
  Container,
  Row,
  Col,
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  chartExample1,
  chartExample2,
} from "variables/charts.js";

import Header from "components/Headers/Header.js";

const Index = (props) => {
  const [statData, setStatData] = useState({
    melayu: 0,
    cina: 0,
    india: 0,
    lain: 0
  });
  const [statDataReligion, setStatDataReligion] = useState({
    islam: 0,
    buddha: 0,
    hindu: 0,
    kristian: 0,
    lain: 0
  });

  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");

  // --- START: FIX AND IMPROVEMENT ---
  useEffect(() => {
    // We will fetch both sets of data at the same time
    const fetchAllStats = async () => {
      try {
        const [raceResponse, religionResponse] = await Promise.all([
          axios.get("http://localhost:5000/stat/totalRace"),
          axios.get("http://localhost:5000/stat/totalReligion")
        ]);

        if (raceResponse.data.success) {
          setStatData(raceResponse.data.stat);
        } else {
          console.error("Failed to fetch race statistic data:", raceResponse.data.message);
        }

        if (religionResponse.data.success) {
          setStatDataReligion(religionResponse.data.stat);
        } else {
          console.error("Failed to fetch religion statistic data:", religionResponse.data.message);
        }
      } catch (error) {
        console.error("Error fetching statistic data:", error);
      }
    };

    fetchAllStats();
  }, []); // <-- CRITICAL FIX: Empty dependency array ensures this runs only ONCE.
  // --- END: FIX AND IMPROVEMENT ---

  const total = (statData.melayu || 0) +
                (statData.cina || 0) +
                (statData.india || 0) +
                (statData.lain || 0);

  const totalReligion = (statDataReligion.islam || 0) +
                        (statDataReligion.buddha || 0) +
                        (statDataReligion.hindu || 0) +
                        (statDataReligion.kristian || 0) +
                        (statDataReligion.lain || 0);

  // Function to calculate percentage
  const calculatePercentage = (value) => {
    // Check totalReligion to avoid division by zero if data is not yet loaded
    const currentTotal = (statData.melayu || 0) + (statData.cina || 0) + (statData.india || 0) + (statData.lain || 0);
    if (currentTotal === 0) return 0;
    return Math.round((value / currentTotal) * 100);
  };

  // Function to calculate percentage religion
  const calculatePercentageReligion = (value) => {
    // Check totalReligion to avoid division by zero if data is not yet loaded
    const currentTotalReligion = (statDataReligion.islam || 0) + (statDataReligion.buddha || 0) + (statDataReligion.hindu || 0) + (statDataReligion.kristian || 0) + (statDataReligion.lain || 0);
    if (currentTotalReligion === 0) return 0;
    return Math.round((value / currentTotalReligion) * 100);
  };


  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* ... The rest of your JSX code remains the same ... */}
        {/* I've removed it for brevity, but you should keep it as is. */}
        {/* The fix was only in the useEffect hook above. */}
        <Row>
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="bg-gradient-default shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-1">
                      Overview
                    </h6>
                    <h2 className="text-white mb-0">Sales value</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 1,
                          })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 1)}
                        >
                          <span className="d-none d-md-block">Month</span>
                          <span className="d-md-none">M</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", {
                            active: activeNav === 2,
                          })}
                          data-toggle="tab"
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 2)}
                        >
                          <span className="d-none d-md-block">Week</span>
                          <span className="d-md-none">W</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart">
                  <Line
                    data={chartExample1[chartExample1Data]}
                    options={chartExample1.options}
                    getDatasetAtEvent={(e) => console.log(e)}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>

        </Row>
        <Row className="mt-4">
           
           <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      5 TAHUN TERAKHIR
                    </h6>
                    <h2 className="mb-0">Jumlah Kelahiran Bayi</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {/* Chart */}
                <div className="chart" style={{ height: "400px", width: "100.000000000001%" }}>
                  <Bar
                    data={chartExample2.data}
                    options={chartExample2.options}
                  />
                </div>
              </CardBody>
            </Card>
          
          
          </Row>
        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="8">
          </Col>
          <Col xl="6">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">PERATUSAN KEPERCAYAAN DI MALAYSIA</h3>
                  </div>
                  <div className="col text-right">
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Agama</th>
                    <th scope="col">Jumlah</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">ISLAM</th>
                    <td>{statDataReligion?.islam ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentageReligion(statDataReligion.islam)}%
                          </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentageReligion(statDataReligion.islam)}
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">HINDU</th>
                    <td>{statDataReligion?.hindu ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentageReligion(statDataReligion.hindu)}%
                          </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentageReligion(statDataReligion.hindu)}
                            barClassName="bg-gradient-success"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">BUDDHA</th>
                    <td>{statDataReligion?.buddha ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentageReligion(statDataReligion.buddha)}%
                          </span>
                        <div>
                          <Progress
                           max="100"
                            value={calculatePercentageReligion(statDataReligion.buddha)} 
                           />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">KRISTIAN</th>
                    <td>{statDataReligion?.kristian ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentageReligion(statDataReligion.kristian)}%
                          </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentageReligion(statDataReligion.kristian)}
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">LAIN-LAIN</th>
                    <td>{statDataReligion?.lain ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentageReligion(statDataReligion.lain)}%
                          </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentageReligion(statDataReligion.lain)}
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col xl="6">
          <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">PERATUSAN BANGSA DI MALAYSIA</h3>
                  </div>
                  <div className="col text-right">
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Bangsa</th>
                    <th scope="col">Jumlah</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">MELAYU</th>
                    <td>{statData?.melayu ?? "Loading..."}</td>
                    <td>
                      <div  className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentage(statData.melayu)}%
                        </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentage(statData.melayu)}
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">CINA</th>
                    <td>{statData?.cina ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentage(statData.cina)}%
                          </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentage(statData.cina)}
                            barClassName="bg-gradient-success"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">INDIA</th>
                    <td>{statData?.india ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentage(statData.india)}%
                          </span>
                        <div>
                          <Progress max="100"
                           value={calculatePercentage(statData.india)} />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">LAIN-LAIN</th>
                    <td>{statData?.lain ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">
                          {calculatePercentage(statData.lain)}%
                          </span>
                        <div>
                          <Progress
                            max="100"
                            value={calculatePercentage(statData.lain)}
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;