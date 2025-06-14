// src/views/admin/dashboardAdmin.js

import { useState, useEffect } from "react";
import classnames from "classnames";
import Chart from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";
import {
  Button,
  Card,
  CardHeader,
  CardBody,
  NavItem,
  NavLink,
  Nav,
  Input,
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
  genderDistributionChart, 
} from "variables/dashboardAdminChart";

import AdminHeader from "components/Headers/AdminHeader";

// Helper function for the Line chart
const formatApiDataForChart = (apiStats, monthLabels) => {
    const formattedData = {
      kadPengenalan: { labels: monthLabels, datasets: [{ label: "Permohonan Kad Pengenalan", data: [0, 0, 0, 0] }] },
      kematian: { labels: monthLabels, datasets: [{ label: "Pendaftaran Kematian", data: [0, 0, 0, 0] }] },
      bayi: { labels: monthLabels, datasets: [{ label: "Pendaftaran Kelahiran Bayi", data: [0, 0, 0, 0] }] },
    };
    const typeMapping = { 'IC': 'kadPengenalan', 'DEATH': 'kematian', 'NEWBORN': 'bayi' };
    apiStats.forEach(stat => {
      const chartKey = typeMapping[stat.apptype];
      if (chartKey) {
        const dataPoints = [stat.month_1, stat.month_2, stat.month_3, stat.month_4];
        formattedData[chartKey].datasets[0].data = dataPoints;
      }
    });
    return formattedData;
};

// Helper function for the average review time bar chart
const formatAvgTimeForChart = (apiStats) => {
    const labels = ["Kad Pengenalan", "Kematian", "Bayi"];
    const data = [0, 0, 0]; 
    const typeMapping = { 'IC': 0, 'DEATH': 1, 'NEWBORN': 2 };
    apiStats.forEach(stat => {
        const index = typeMapping[stat.apptype];
        if (index !== undefined) {
            data[index] = parseFloat(stat.avg_review_time_days);
        }
    });
    return {
        labels: labels,
        datasets: [{ label: "Purata Masa Semakan", data: data }],
    };
};

// Helper function to format the API data for the Age Group chart
const formatAgeGroupForChart = (apiStats) => {
    const labels = ["0-17", "18-24", "25-39", "40-59", "60+"];
    const data = [0, 0, 0, 0, 0];
    const labelMapping = { "0-17": 0, "18-24": 1, "25-39": 2, "40-59": 3, "60+": 4 };
    apiStats.forEach(stat => {
        const index = labelMapping[stat.age_group];
        if (index !== undefined) {
            data[index] = stat.total_applicants;
        }
    });
    return {
        labels: labels,
        datasets: [{ label: "Jumlah Permohonan", data: data }]
    };
};

// *** NEW: Helper function to format the API data for the Decision Pie chart ***
const formatDecisionForChart = (apiStats) => {
    const formattedData = {
        kadPengenalan: { labels: ["Lulus", "Gagal"], datasets: [{ data: [0, 0], backgroundColor: ["#2dce89", "#f5365c"] }] },
        kematian: { labels: ["Lulus", "Gagal"], datasets: [{ data: [0, 0], backgroundColor: ["#2dce89", "#f5365c"] }] },
        bayi: { labels: ["Lulus", "Gagal"], datasets: [{ data: [0, 0], backgroundColor: ["#2dce89", "#f5365c"] }] },
    };

    const typeMapping = {
        'IC': 'kadPengenalan',
        'DEATH': 'kematian',
        'NEWBORN': 'bayi'
    };

    apiStats.forEach(stat => {
        const chartKey = typeMapping[stat.apptype];
        if (chartKey) {
            formattedData[chartKey].datasets[0].data = [
                stat.accept_percentage,
                stat.reject_percentage
            ];
        }
    });

    return formattedData;
};

// Moved chart options outside the component to prevent re-creation on every render.
const purataMasaChartOptions = {
    ...ageGroupChart.options,
    scales: {
      y: {
        ticks: { callback: function (value) { if (Number.isInteger(value)) return value; } },
        title: { display: true, text: 'Purata Hari' }
      },
    },
    plugins: {
      ...ageGroupChart.options.plugins,
      tooltip: {
        callbacks: {
          label: function (item) {
            let label = item.dataset.label || "";
            if (label) { label += ": "; }
            // Use .toFixed(2) to ensure percentage formatting in tooltips for the pie chart
            label += `${parseFloat(item.raw).toFixed(2)}%`;
            return label;
          },
        },
      },
    },
};


const Index = (props) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // State for interactive controls
  const [activeNav, setActiveNav] = useState('kadPengenalan');
  const [keputusanNav, setKeputusanNav] = useState('kadPengenalan');

  // Initialized state with a stable, empty structure for each chart
  const [permohonanChartData, setPermohonanChartData] = useState({ kadPengenalan: { labels: [], datasets: [] }, kematian: { labels: [], datasets: [] }, bayi: { labels: [], datasets: [] } });
  const [purataMasaChartData, setPurataMasaChartData] = useState({ labels: [], datasets: [] });
  const [kumpulanUmurChartData, setKumpulanUmurChartData] = useState({ labels: [], datasets: [] });
  // *** NEW: State for the pie chart data ***
  const [keputusanChartData, setKeputusanChartData] = useState({ kadPengenalan: { labels: [], datasets: [] }, kematian: { labels: [], datasets: [] }, bayi: { labels: [], datasets: [] } });

  const getPastFourMonths = () => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const today = new Date();
    const months = [];
    for (let i = 3; i >= 0; i--) { const d = new Date(today.getFullYear(), today.getMonth() - i, 1); months.push(monthNames[d.getMonth()]); }
    return months;
  };
  
  useEffect(() => {
    const storedStaffID = sessionStorage.getItem('staffID');
    const storedUsername = sessionStorage.getItem('username');
    if (!storedStaffID || !storedUsername) { navigate('/authCitizen/login'); return; }

    const fetchAllChartData = async () => {
        const lastFourMonths = getPastFourMonths();
        try {
            // *** CHANGED: Fetching all four sets of data ***
            const [appResponse, timeResponse, ageGroupResponse, decisionResponse] = await Promise.all([
                fetch('http://localhost:5000/adminstat/totalApplication4Month'),
                fetch('http://localhost:5000/adminstat/avgReviewTime'),
                fetch('http://localhost:5000/adminstat/applicationAgeGroup'),
                fetch('http://localhost:5000/adminstat/applicationDecision5Months')
            ]);
            const appData = await appResponse.json();
            const timeData = await timeResponse.json();
            const ageGroupData = await ageGroupResponse.json();
            const decisionData = await decisionResponse.json();

            if (appData.success) { setPermohonanChartData(formatApiDataForChart(appData.stats, lastFourMonths)); } 
            else { console.error("Failed to fetch application data:", appData.message); }
            
            if (timeData.success) { setPurataMasaChartData(formatAvgTimeForChart(timeData.stats)); } 
            else { console.error("Failed to fetch average time data:", timeData.message); }
            
            if (ageGroupData.success) { setKumpulanUmurChartData(formatAgeGroupForChart(ageGroupData.stats)); } 
            else { console.error("Failed to fetch age group data:", ageGroupData.message); }

            // *** NEW: Process and set data for the pie chart ***
            if (decisionData.success) { setKeputusanChartData(formatDecisionForChart(decisionData.stats)); }
            else { console.error("Failed to fetch decision data:", decisionData.message); }

        } catch (error) { console.error("Error fetching dashboard data:", error); } 
        finally { setIsLoading(false); }
    };
    
    fetchAllChartData();
  }, [navigate]);


  if (isLoading) {
    return ( <div className="text-center mt-5"><div className="spinner-border text-primary" role="status"><span className="sr-only">Loading...</span></div></div> );
  }

  if (window.Chart) { parseOptions(Chart, chartOptions()); }
  
  const toggleNavs = (e, key) => { e.preventDefault(); setActiveNav(key); };

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
                    <h6 className="text-uppercase text-light ls-1 mb-1">Overview</h6>
                    <h2 className="text-white mb-0">Jumlah Permohonan Dalam masa 4 bulan</h2>
                  </div>
                  <div className="col">
                    <Nav className="justify-content-end" pills>
                      <NavItem>
                        <NavLink className={classnames("py-2 px-3", { active: activeNav === 'kadPengenalan' })} href="#pablo" onClick={(e) => toggleNavs(e, 'kadPengenalan')} >
                          <span className="d-none d-md-block">Kad Pengenalan</span>
                          <span className="d-md-none">KP</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink className={classnames("py-2 px-3", { active: activeNav === 'kematian' })} href="#pablo" onClick={(e) => toggleNavs(e, 'kematian')} >
                          <span className="d-none d-md-block">Kematian</span>
                          <span className="d-md-none">M</span>
                        </NavLink>
                      </NavItem>
                      <NavItem>
                        <NavLink className={classnames("py-2 px-3", { active: activeNav === 'bayi' })} href="#pablo" onClick={(e) => toggleNavs(e, 'bayi')} >
                          <span className="d-none d-md-block">Bayi</span>
                          <span className="d-md-none">B</span>
                        </NavLink>
                      </NavItem>
                    </Nav>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart"><Line data={permohonanChartData[activeNav]} options={annualOverviewChart.options} /></div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col"><h6 className="text-uppercase text-muted ls-1 mb-1">Kecekapan Semakan</h6><h2 className="mb-0">Purata masa semak permohonan</h2></div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart"><Bar data={purataMasaChartData} options={purataMasaChartOptions} /></div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        <Row className="mt-5">
          <Col className="mb-5 mb-xl-0" xl="7">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col"><h6 className="text-uppercase text-muted ls-1 mb-1">Demografi Pemohon</h6><h2 className="mb-0">Kumpulan umur yang membuat permohonan</h2></div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart"><Bar data={kumpulanUmurChartData} options={ageGroupChart.options} /></div>
              </CardBody>
            </Card>
          </Col>

          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0">
                <Row className="align-items-center">
                  <div className="col"><h3 className="mb-0">Peratusan Keputusan Permohonan</h3></div>
                  <div className="col text-right">
                    <Input type="select" bsSize="sm" style={{ maxWidth: '180px' }} value={keputusanNav} onChange={(e) => setKeputusanNav(e.target.value)}>
                        <option value="kadPengenalan">Kad Pengenalan</option>
                        <option value="kematian">Kematian</option>
                        <option value="bayi">Kelahiran Bayi</option>
                    </Input>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                  <div className="chart">
                    {/* *** CHANGED: Using new state for the pie chart data *** */}
                    <Pie data={keputusanChartData[keputusanNav]} options={genderDistributionChart.options} />
                  </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Index;