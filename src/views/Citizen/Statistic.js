// Statistic.js

import axios from "axios";
import { useEffect, useState } from "react";
// node.js library that concatenates classes (strings)
import classnames from "classnames";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Pie, Bar } from "react-chartjs-2";
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
  lineChartExample, // The "Sales" line chart
  // pieChartExample,  // The "Race" pie chart
  barChartExample, 
  genderPieChartExample // The "Age" bar chart
} from "variables/charts.js";

import Header from "components/Headers/Header.js";

const Index = (props) => {
  // State for Race and Religion tables
  const [statData, setStatData] = useState({ melayu: 0, cina: 0, india: 0, lain: 0 });
  const [statDataReligion, setStatDataReligion] = useState({ islam: 0, buddha: 0, hindu: 0, kristian: 0, lain: 0 });

  // --- STATE FOR CHARTS ---

  // State for the top Line Chart ("Sales")
  const [activeNav, setActiveNav] = useState(1);
  const [chartExample1Data, setChartExample1Data] = useState("data1");
  
  // *** NEW: State for the Gender Pie Chart ***
  const [genderStat, setGenderStat] = useState(null);
  const [genderChartData, setGenderChartData] = useState(genderPieChartExample.data);

  // State for the Bar Chart (Age Group)
  const [ageGroupStat, setAgeGroupStat] = useState(null);
  const [ageGroupChartData, setAgeGroupChartData] = useState(barChartExample.data);

  // This useEffect fetches all initial data when the component mounts
  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [raceResponse, religionResponse, ageGroupResponse, genderResponse] = 
          await Promise.all([
            axios.get("http://localhost:5000/stat/totalRace"),
            axios.get("http://localhost:5000/stat/totalReligion"),
            axios.get("http://localhost:5000/stat/ageGroup"),
            axios.get("http://localhost:5000/stat/genderDistribution"), 
          ]);

        if (raceResponse.data.success) setStatData(raceResponse.data.stat);
        if (religionResponse.data.success) setStatDataReligion(religionResponse.data.stat);
        if (ageGroupResponse.data.success) setAgeGroupStat(ageGroupResponse.data.stat);
        if (genderResponse.data.success) setGenderStat(genderResponse.data.stat); // Set gender state

      } catch (error) {
        console.error("Error fetching one or more statistic endpoints:", error);
      }
    };

    fetchAllStats();
  }, []); 

  // --- USEEFFECTS TO UPDATE CHARTS WITH API DATA ---

  // This useEffect updates the PIE chart when gender data (genderStat) arrives
   useEffect(() => {
    if (genderStat) {
      // Use the keys "LELAKI" and "PEREMPUAN" from your corrected API
      const dataForChart = [genderStat.LELAKI.count, genderStat.PEREMPUAN.count];
      setGenderChartData((prevData) => ({
        ...prevData,
        datasets: [{ ...prevData.datasets[0], data: dataForChart }],
      }));
    }
  }, [genderStat]);

  // This useEffect updates the BAR chart when age group data (ageGroupStat) arrives
  useEffect(() => {
    if (ageGroupStat) {
      const dataForChart = [
        ageGroupStat['0-12'], ageGroupStat['13-22'], ageGroupStat['23-35'],
        ageGroupStat['36-45'], ageGroupStat['46-55'], ageGroupStat['56+'],
      ];
      setAgeGroupChartData((prevData) => ({
        ...prevData,
        datasets: [{ ...prevData.datasets[0], data: dataForChart }],
      }));
    }
  }, [ageGroupStat]);

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }

  // Handler for the Line Chart's "Month/Week" toggle
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
    setChartExample1Data("data" + index);
  };

  // Function to calculate percentage for race
  const calculatePercentage = (value) => {
    const total = (statData.melayu || 0) + (statData.cina || 0) + (statData.india || 0) + (statData.lain || 0);
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  // Function to calculate percentage for religion
  const calculatePercentageReligion = (value) => {
    const totalReligion = (statDataReligion.islam || 0) + (statDataReligion.buddha || 0) + (statDataReligion.hindu || 0) + (statDataReligion.kristian || 0) + (statDataReligion.lain || 0);
    if (totalReligion === 0) return 0;
    return Math.round((value / totalReligion) * 100);
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* --- ROW FOR THE LINE CHART --- */}
        <Row>
          <Col className="mb-5 mb-xl-0" xl="12"> {/* CORRECTED: Takes full width */}
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
                <div className="chart">
                  <Line
                    data={lineChartExample[chartExample1Data]}
                    options={lineChartExample.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

         {/* --- ROW FOR THE DEMOGRAPHIC CHARTS --- */}
        <Row className="mt-5">
          {/* *** PIE CHART (GENDER) - REPLACED THE RACE CHART *** */}
          <Col xl="6" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">DEMOGRAFI</h6>
                    <h2 className="mb-0">Jumlah Penduduk Mengikut Jantina</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "350px" }}>
                  <Pie data={genderChartData} options={genderPieChartExample.options} />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* BAR CHART (AGE) */}
          <Col xl="6">
            <Card className="shadow h-100"> {/* Added h-100 to make cards same height */}
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">DEMOGRAFI</h6>
                    <h2 className="mb-0">Jumlah Penduduk Mengikut Umur</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "350px" }}>
                  <Bar data={ageGroupChartData} options={barChartExample.options} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* --- ROW FOR THE TABLES --- */}
        <Row className="mt-5">
          <Col xl="6" className="mb-5 mb-xl-0">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">PERATUSAN KEPERCAYAAN DI MALAYSIA</h3>
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
                        <span className="mr-2">{calculatePercentageReligion(statDataReligion.islam)}%</span>
                        <div><Progress max="100" value={calculatePercentageReligion(statDataReligion.islam)} barClassName="bg-gradient-success" /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">HINDU</th>
                    <td>{statDataReligion?.hindu ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentageReligion(statDataReligion.hindu)}%</span>
                        <div><Progress max="100" value={calculatePercentageReligion(statDataReligion.hindu)} barClassName="bg-gradient-warning" /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">BUDDHA</th>
                    <td>{statDataReligion?.buddha ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentageReligion(statDataReligion.buddha)}%</span>
                        <div><Progress max="100" value={calculatePercentageReligion(statDataReligion.buddha)} /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">KRISTIAN</th>
                    <td>{statDataReligion?.kristian ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentageReligion(statDataReligion.kristian)}%</span>
                        <div><Progress max="100" value={calculatePercentageReligion(statDataReligion.kristian)} barClassName="bg-gradient-info" /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">LAIN-LAIN</th>
                    <td>{statDataReligion?.lain ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentageReligion(statDataReligion.lain)}%</span>
                        <div><Progress max="100" value={calculatePercentageReligion(statDataReligion.lain)} barClassName="bg-gradient-danger" /></div>
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
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentage(statData.melayu)}%</span>
                        <div><Progress max="100" value={calculatePercentage(statData.melayu)} barClassName="bg-gradient-success" /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">CINA</th>
                    <td>{statData?.cina ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentage(statData.cina)}%</span>
                        <div><Progress max="100" value={calculatePercentage(statData.cina)} barClassName="bg-gradient-warning" /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">INDIA</th>
                    <td>{statData?.india ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentage(statData.india)}%</span>
                        <div><Progress max="100" value={calculatePercentage(statData.india)} /></div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">LAIN-LAIN</th>
                    <td>{statData?.lain ?? "Loading..."}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">{calculatePercentage(statData.lain)}%</span>
                        <div><Progress max="100" value={calculatePercentage(statData.lain)} barClassName="bg-gradient-danger" /></div>
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