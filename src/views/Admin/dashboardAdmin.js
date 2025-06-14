// src/views/admin/dashboardAdmin.js

import { useState, useEffect } from "react"; // Added useEffect to import
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import {
  Button,
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
import { useNavigate } from "react-router-dom";

import {
  chartOptions,
  parseOptions,
  annualOverviewChart,
  ageGroupChart,
} from "variables/dashboardAdminChart";

import AdminHeader from "components/Headers/AdminHeader";

// *** NEW: Helper function to format the API data into the structure the chart needs ***
const formatApiDataForChart = (apiStats, monthLabels) => {
    // Default structure for the chart data
    const formattedData = {
      kadPengenalan: { labels: monthLabels, datasets: [{ label: "Permohonan Kad Pengenalan", data: [0, 0, 0, 0] }] },
      kematian: { labels: monthLabels, datasets: [{ label: "Pendaftaran Kematian", data: [0, 0, 0, 0] }] },
      bayi: { labels: monthLabels, datasets: [{ label: "Pendaftaran Kelahiran Bayi", data: [0, 0, 0, 0] }] },
    };
  
    // Mapping from API apptype to our chart keys
    const typeMapping = {
      'IC': 'kadPengenalan',
      'DEATH': 'kematian',
      'NEWBORN': 'bayi'
    };
  
    // Populate the structure with data from the API
    apiStats.forEach(stat => {
      const chartKey = typeMapping[stat.apptype];
      if (chartKey) {
        // The data is ordered from month_1 (oldest) to month_4 (newest)
        const dataPoints = [stat.month_1, stat.month_2, stat.month_3, stat.month_4];
        formattedData[chartKey].datasets[0].data = dataPoints;
      }
    });
  
    return formattedData;
};

const Index = (props) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // *** CHANGED: State for active button remains, but chart data state is new ***
  const [activeNav, setActiveNav] = useState('kadPengenalan');
  const [permohonanChartData, setPermohonanChartData] = useState({}); // To hold data from API

  const getPastFourMonths = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const months = [];
    for (let i = 3; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push(monthNames[d.getMonth()]);
    }
    return months;
  };
  const lastFourMonths = getPastFourMonths();

  // *** CHANGED: useEffect to fetch data from the API ***
  useEffect(() => {
    const storedStaffID = sessionStorage.getItem('staffID');
    const storedUsername = sessionStorage.getItem('username');

    if (!storedStaffID || !storedUsername) {
        navigate('/authCitizen/login');
        return; // Stop execution if not logged in
    }

    const fetchChartData = async () => {
        try {
            const response = await fetch('http://localhost:5000/adminstat/totalApplication4Month');
            const data = await response.json();

            if (data.success) {
                // Process the API data and set it to state
                const formattedData = formatApiDataForChart(data.stats, lastFourMonths);
                setPermohonanChartData(formattedData);
            } else {
                console.error("Failed to fetch chart data:", data.message);
                // Optionally set an error state here
            }
        } catch (error) {
            console.error("Error fetching chart data:", error);
            // Optionally set an error state here
        } finally {
            setIsLoading(false); // Stop loading indicator
        }
    };
    
    fetchChartData();

  }, [navigate]); // Dependency array, runs once on mount

  // Hardcoded data for the second chart remains
  const ordersChart = {
    options: ageGroupChart.options,
    data: {
      labels: ["Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Total orders",
          data: [25, 20, 30, 22, 17, 29],
        },
      ],
    },
  };

  if (isLoading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  if (window.Chart) {
    parseOptions(Chart, chartOptions());
  }
  
  const toggleNavs = (e, key) => {
    e.preventDefault();
    setActiveNav(key);
  };

  return (
    <>
      <AdminHeader />
      <Container className="mt--7" fluid>
        <Row>
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="bg-gradient-default shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-light ls-1 mb-1">
                      Overview
                    </h6>
                    <h2 className="text-white mb-0">Jumlah Permohonan Dalam masa 4 bulan</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", { active: activeNav === 'kadPengenalan' })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 'kadPengenalan')}
                        >
                          <span className="d-none d-md-block">Kad Pengenalan</span>
                          <span className="d-md-none">KP</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", { active: activeNav === 'kematian' })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 'kematian')}
                        >
                          <span className="d-none d-md-block">Kematian</span>
                          <span className="d-md-none">M</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink
                          className={classnames("py-2 px-3", { active: activeNav === 'bayi' })}
                          href="#pablo"
                          onClick={(e) => toggleNavs(e, 'bayi')}
                        >
                          <span className="d-none d-md-block">Bayi</span>
                          <span className="d-md-none">B</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  {/* *** CHANGED: Use the new state data for the chart *** */}
                  <Line
                    data={permohonanChartData[activeNav] || { labels: [], datasets: [] }}
                    options={annualOverviewChart.options} // Options from imported file
                    getDatasetAtEvent={(e) => console.log(e)}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            {/* The second chart remains unchanged */}
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Performance
                    </h6>
                    <h2 className="mb-0">Total orders</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Bar
                    data={ordersChart.data}
                    options={ordersChart.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        <Row className="mt-5">
           {/* The rest of the page remains the same... */}
          <Col className="mb-5 mb-xl-0" xl="8">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Page visits</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Page name</th>
                    <th scope="col">Visitors</th>
                    <th scope="col">Unique users</th>
                    <th scope="col">Bounce rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">/argon/</th>
                    <td>4,569</td>
                    <td>340</td>
                    <td>
                      <i className="fas fa-arrow-up text-success mr-3" /> 46,53%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/index.html</th>
                    <td>3,985</td>
                    <td>319</td>
                    <td>
                      <i className="fas fa-arrow-down text-warning mr-3" />{" "}
                      46,53%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/charts.html</th>
                    <td>3,513</td>
                    <td>294</td>
                    <td>
                      <i className="fas fa-arrow-down text-warning mr-3" />{" "}
                      36,49%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/tables.html</th>
                    <td>2,050</td>
                    <td>147</td>
                    <td>
                      <i className="fas fa-arrow-up text-success mr-3" /> 50,87%
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">/argon/profile.html</th>
                    <td>1,795</td>
                    <td>190</td>
                    <td>
                      <i className="fas fa-arrow-down text-danger mr-3" />{" "}
                      46,53%
                    </td>
                  </tr>
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col">
                    <h3 className="mb-0">Social traffic</h3>
                  </div>
                  <div className="col text-right">
                    <Button
                      color="primary"
                      href="#pablo"
                      onClick={(e) => e.preventDefault()}
                      size="sm"
                    >
                      See all
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Referral</th>
                    <th scope="col">Visitors</th>
                    <th scope="col" />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">Facebook</th>
                    <td>1,480</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">60%</span>
                        <div>
                          <Progress
                            max="100"
                            value="60"
                            barClassName="bg-gradient-danger"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Facebook</th>
                    <td>5,480</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">70%</span>
                        <div>
                          <Progress
                            max="100"
                            value="70"
                            barClassName="bg-gradient-success"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Google</th>
                    <td>4,807</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">80%</span>
                        <div>
                          <Progress max="100" value="80" />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">Instagram</th>
                    <td>3,678</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">75%</span>
                        <div>
                          <Progress
                            max="100"
                            value="75"
                            barClassName="bg-gradient-info"
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th scope="row">twitter</th>
                    <td>2,645</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <span className="mr-2">30%</span>
                        <div>
                          <Progress
                            max="100"
                            value="30"
                            barClassName="bg-gradient-warning"
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