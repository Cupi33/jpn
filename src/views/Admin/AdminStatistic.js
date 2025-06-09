// AdminStatistic.js

import { useEffect, useState } from "react";
import axios from "axios";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
// reactstrap components
import {
  Badge,
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Col,
  Progress,
} from "reactstrap";

// core components
import {
  chartOptions, // This function returns the global defaults
  parseOptions,
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart,
} from "variables/chartAdmin";

import Header from "components/Headers/AdminStatHeader";

// --- MOCK DATA FOR THE DASHBOARD (except for population table) ---

// Data for the main line chart (Births vs. Deaths)
const annualOverviewData = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Births",
      data: [490, 510, 485, 530, 550, 540, 565],
      borderColor: "#2dce89", // Success color
      backgroundColor: "#2dce89", // Added for better line fill
      pointBackgroundColor: "#2dce89",
      pointRadius: 3,
      pointHoverRadius: 5,
    },
    {
      label: "Deaths",
      data: [170, 180, 195, 185, 205, 210, 220],
      borderColor: "#f5365c", // Danger color
      backgroundColor: "#f5365c", // Added for better line fill
      pointBackgroundColor: "#f5365c",
      pointRadius: 3,
      pointHoverRadius: 5,
    },
  ],
};

// Data for the Gender Pie chart
const genderData = {
  labels: ["Male", "Female"],
  datasets: [
    {
      data: [16890440, 15980120],
      backgroundColor: ["#5e72e4", "#f5365c"],
      hoverBackgroundColor: ["#5e72e4", "#f5365c"],
    },
  ],
};

// Data for the Age Group Bar chart
const ageGroupData = {
  labels: ["0-17", "18-24", "25-39", "40-59", "60+"],
  datasets: [
    {
      label: "Population",
      data: [8900100, 4500250, 9800500, 6450800, 3218910],
      backgroundColor: "#11cdef", // Info color
    },
  ],
};

// Data for the new Marital Status Doughnut chart
const maritalStatusData = {
  labels: ["Single", "Married", "Divorced", "Widowed"],
  datasets: [
    {
      data: [10250340, 19870400, 890120, 1859700],
      backgroundColor: ["#fb6340", "#2dce89", "#f5365c", "#adb5bd"],
      hoverBackgroundColor: ["#fb6340", "#2dce89", "#f5365c", "#adb5bd"],
    },
  ],
};

// Data for the Recent Registrations table
const recentRegistrations = [
    { name: "Ahmad Bin Kassim", ic: "900101-10-1234", date: "2024-05-20", status: "Approved" },
    { name: "Siti Nurhaliza", ic: "850322-01-5678", date: "2024-05-19", status: "Approved" },
    { name: "Lim Wei Jie", ic: "010815-14-9876", date: "2024-05-18", status: "Pending" },
    { name: "Priya a/p Kumar", ic: "921203-08-5544", date: "2024-05-18", status: "Approved" },
    { name: "John Doe", ic: "950505-71-1122", date: "2024-05-17", status: "Pending" },
];


const AdminStatistic = (props) => {
  // State to hold the population data from the API
  const [populationData, setPopulationData] = useState([]);

  useEffect(() => {
    // Initialize Chart.js global defaults
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    // Fetch population data from the API
    const fetchPopulationData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/adminstat/citizenPlacement");
        if (response.data.success) {
          const stats = response.data.stats;
          
          // Convert the stats object into a sorted array for easier rendering
          const formattedData = Object.entries(stats)
            .map(([stateName, data]) => ({
              state: stateName.replace(/_/g, " "), // Replace underscores with spaces
              population: data.total,
              percentage: data.percentage
            }))
            .sort((a, b) => b.population - a.population); // Sort descending by population
          
          setPopulationData(formattedData);
        }
      } catch (error) {
        console.error("Error fetching population data:", error);
      }
    };

    fetchPopulationData();
  }, []); // Empty dependency array means this runs once on component mount

  // Helper to get the right color for status badges
  const getStatusBadge = (status) => {
    switch (status) {
      case "Approved":
        return "success";
      case "Pending":
        return "warning";
      case "Rejected":
        return "danger";
      default:
        return "primary";
    }
  };

  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        {/* --- ROW 1: MAIN OVERVIEW CHART --- */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">
                      Overview
                    </h6>
                    <h2 className="mb-0">Annual Population Dynamics</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart">
                  <Line
                    data={annualOverviewData}
                    options={annualOverviewChart.options}
                  />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* --- ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS --- */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6>
                  <h2 className="mb-0">Age Groups</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Bar data={ageGroupData} options={ageGroupChart.options} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6>
                  <h2 className="mb-0">Gender Distribution</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Pie data={genderData} options={genderDistributionChart.options} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6>
                <h2 className="mb-0">Marital Status</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Doughnut data={maritalStatusData} options={maritalStatusChart.options} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* --- ROW 3: DATA TABLES --- */}
        <Row className="mt-5">
          <Col xl="7" className="mb-5 mb-xl-0">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Recent System Registrations</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Applicant Name</th>
                    <th scope="col">IC Number</th>
                    <th scope="col">Registration Date</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRegistrations.map((reg, index) => (
                     <tr key={index}>
                        <th scope="row">{reg.name}</th>
                        <td>{reg.ic}</td>
                        <td>{reg.date}</td>
                        <td><Badge color={getStatusBadge(reg.status)} pill>{reg.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Carta Kependudukan di Malaysia</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Negeri</th>
                    <th scope="col">Populasi</th>
                    <th scope="col">Peratusan</th>
                  </tr>
                </thead>
                <tbody>
                  {populationData.length > 0 ? (
                    populationData.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" style={{ textTransform: 'capitalize' }}>
                          {item.state.toLowerCase()}
                        </th>
                        <td>{item.population.toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="mr-2">{item.percentage}%</span>
                            <div>
                              <Progress
                                max="100"
                                value={item.percentage}
                                barClassName="bg-gradient-primary"
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">
                        Loading data...
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AdminStatistic;