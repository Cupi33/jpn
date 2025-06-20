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
  lineChartExample, // We will use its options but provide our own data
  barChartExample, 
  genderPieChartExample
} from "variables/charts.js";

import Header from "components/Headers/Header.js";

// *** NEW: Helper function to calculate Y-axis scale ***
const getAxisConfig = (maxVal) => {
  if (maxVal <= 0) return { suggestedMax: 10, stepSize: 2 };
  if (maxVal <= 10) return { suggestedMax: 10, stepSize: 2 };
  if (maxVal <= 30) return { suggestedMax: 30, stepSize: 5 };
  if (maxVal <= 50) return { suggestedMax: 50, stepSize: 10 };
  if (maxVal <= 100) return { suggestedMax: 100, stepSize: 20 };
  
  // For larger numbers, calculate a step size that creates 4-6 ticks
  const step = Math.ceil(maxVal / 5); // Aim for 5 ticks
  const roundedStep = Math.ceil(step / 10) * 10; // Round step up to nearest 10
  const finalMax = Math.ceil(maxVal / roundedStep) * roundedStep; // Round max up to match the step

  return { suggestedMax: finalMax, stepSize: roundedStep };
};


const Index = (props) => {
  // State for Race and Religion tables
  const [statData, setStatData] = useState({ melayu: 0, cina: 0, india: 0, lain: 0 });
  const [statDataReligion, setStatDataReligion] = useState({ islam: 0, buddha: 0, hindu: 0, kristian: 0, lain: 0 });

  // --- STATE FOR CHARTS ---

  // State for the top Line Chart (Births/Deaths)
  const [activeNav, setActiveNav] = useState(1); // 1 for Deaths, 2 for Births
  const [deathData, setDeathData] = useState(null);
  const [birthData, setBirthData] = useState(null);
  const [birthDeathChartData, setBirthDeathChartData] = useState({});
  // *** NEW: State for the dynamic line chart options ***
  const [lineChartOptions, setLineChartOptions] = useState(lineChartExample.options);
  
  // State for the Gender Pie Chart
  const [genderStat, setGenderStat] = useState(null);
  const [genderChartData, setGenderChartData] = useState(genderPieChartExample.data);

  // State for the Bar Chart (Age Group)
  const [ageGroupStat, setAgeGroupStat] = useState(null);
  const [ageGroupChartData, setAgeGroupChartData] = useState(barChartExample.data);

  // This useEffect fetches all initial data when the component mounts
  useEffect(() => {
    const fetchAllStats = async () => {
      try {
        const [
          raceResponse, 
          religionResponse, 
          ageGroupResponse, 
          genderResponse,
          deathResponse,
          birthResponse,
        ] = await Promise.all([
            axios.get("http://localhost:5000/stat/totalRace"),
            axios.get("http://localhost:5000/stat/totalReligion"),
            axios.get("http://localhost:5000/stat/ageGroup"),
            axios.get("http://localhost:5000/stat/genderDistribution"), 
            axios.get("http://localhost:5000/stat/totalDeath"),
            axios.get("http://localhost:5000/stat/totalBorn"),
          ]);

        if (raceResponse.data.success) setStatData(raceResponse.data.stat);
        if (religionResponse.data.success) setStatDataReligion(religionResponse.data.stat);
        if (ageGroupResponse.data.success) setAgeGroupStat(ageGroupResponse.data.stat);
        if (genderResponse.data.success) setGenderStat(genderResponse.data.stat);
        if (deathResponse.data.success) setDeathData(deathResponse.data.stat);
        if (birthResponse.data.success) setBirthData(birthResponse.data.stat);

      } catch (error) {
        console.error("Error fetching one or more statistic endpoints:", error);
      }
    };

    fetchAllStats();
  }, []); 

  // --- USEEFFECTS TO UPDATE CHARTS WITH API DATA ---

  // This useEffect updates the LINE chart when birth/death data arrives or the toggle is clicked
  useEffect(() => {
    if (!deathData || !birthData) {
      return;
    }

    let dataToShow;
    let chartLabel;
    let chartColor;

    if (activeNav === 1) { // Show Deaths
      dataToShow = deathData;
      chartLabel = "Total Deaths";
      chartColor = "rgba(245, 54, 92, 0.6)";
    } else { // Show Births
      dataToShow = birthData;
      chartLabel = "Total Births";
      chartColor = "rgba(24, 119, 242, 0.6)";
    }

    const labels = Object.keys(dataToShow).sort();
    const values = labels.map(year => dataToShow[year]);

    setBirthDeathChartData({
      labels: labels,
      datasets: [
        {
          label: chartLabel,
          data: values,
          borderColor: chartColor,
        },
      ],
    });

    // *** NEW: Calculate and set the dynamic chart options ***
    const maxDataValue = values.length > 0 ? Math.max(...values) : 10;
    const { suggestedMax, stepSize } = getAxisConfig(maxDataValue);

    // Deep copy and update options to avoid mutation issues
    const newOptions = JSON.parse(JSON.stringify(lineChartExample.options));
    newOptions.scales.yAxes[0].ticks.stepSize = stepSize;
    newOptions.scales.yAxes[0].suggestedMax = suggestedMax;
    setLineChartOptions(newOptions);


  }, [deathData, birthData, activeNav]);


  // This useEffect updates the PIE chart when gender data arrives
   useEffect(() => {
    if (genderStat) {
      const dataForChart = [genderStat.LELAKI.count, genderStat.PEREMPUAN.count];
      setGenderChartData((prevData) => ({
        ...prevData,
        datasets: [{ ...prevData.datasets[0], data: dataForChart }],
      }));
    }
  }, [genderStat]);

  // This useEffect updates the BAR chart when age group data arrives
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

  // Handler for the Line Chart's toggle buttons
  const toggleNavs = (e, index) => {
    e.preventDefault();
    setActiveNav(index);
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
          <Col className="mb-5 mb-xl-0" xl="12">
            <Card className="bg-gradient-default shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-1">
                      Overview
                    </h6>
                    <h2 className="text-white mb-0">
                      {activeNav === 1 ? 'Jumlah Kematian Per Tahun' : 'Jumlah Kelahiran Per Tahun'}
                    </h2>
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
                          <span className="d-none d-md-block">Kematian</span>
                          <span className="d-md-none">D</span>
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
                          <span className="d-none d-md-block">Kelahiran</span>
                          <span className="d-md-none">B</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  {/* *** UPDATED: Line chart now uses DYNAMIC options *** */}
                  <Line
                    data={birthDeathChartData}
                    options={lineChartOptions}
                    getDatasetAtEvent={(e) => console.log(e)}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

         {/* --- ROW FOR THE DEMOGRAPHIC CHARTS --- */}
        <Row className="mt-5">
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
          <Col xl="6">
            <Card className="shadow h-100">
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