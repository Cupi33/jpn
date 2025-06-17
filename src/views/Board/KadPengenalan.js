import { useEffect, useState } from "react";
import axios from "axios"; // Import axios for API calls
import {  Pie, Bar } from "react-chartjs-2";
import { Card, CardHeader, CardBody, Container, Row, Col } from "reactstrap";
import Chart from "chart.js";
import { useNavigate } from "react-router-dom";

// Import configurations from a chart configuration file
import {
  chartOptions,
  parseOptions,
  deathsByGenderChart,
  deathsByAgeGroupChart,
} from "variables/chartAdmin3";


// --- MAIN IDENTITY CARD STATISTIC COMPONENT ---
const KadPengenalan = (props) => {

  const navigate = useNavigate();
    useEffect(() => {
      const staffID = sessionStorage.getItem('staffID');
      const username = sessionStorage.getItem('username');
  
      // If staffID or username is not found, redirect to login page
      if (!staffID || !username) {
        console.log("Authentication credentials not found. Redirecting...");
        navigate('/authAdmin/loginAdmin');
      }
    }, [navigate]);

  // State for the Performance Chart (from API)
  const [performanceChartData, setPerformanceChartData] = useState({
    labels: [],
    datasets: [],
  });
  const [isPerformanceLoading, setIsPerformanceLoading] = useState(true);

  // State for Application Decision Summary (from API)
  const [decisionChartData, setDecisionChartData] = useState({
    labels: ["Diluluskan", "Ditolak"],
    datasets: [{
        data: [0, 0], 
        backgroundColor: ["#2dce89", "#f5365c"],
        hoverBackgroundColor: ["#2dce89", "#f5365c"]
    }]
  });
  const [isDecisionLoading, setIsDecisionLoading] = useState(true);

  // State for Rejection Reasons Chart (from API)
  const [rejectionReasonChartData, setRejectionReasonChartData] = useState({
    labels: [],
    datasets: [{
        label: "Jumlah",
        data: [],
        backgroundColor: "#fb6340"
    }]
  });
  const [isRejectionLoading, setIsRejectionLoading] = useState(true);


  // --- DEMOGRAPHIC DATA SECTION (NOW FROM API) ---
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  const [avgAgeData, setAvgAgeData] = useState({ male: 0, female: 0 });
  const [isDemographicLoading, setIsDemographicLoading] = useState(true);

  // MODIFIED: State for Age Group chart (now from API)
  const [ageGroupChartData, setAgeGroupChartData] = useState({
    labels: [],
    datasets: [{ label: "Permohonan", data: [], backgroundColor: "#11cdef" }],
  });
  const [isAgeGroupLoading, setIsAgeGroupLoading] = useState(true); // NEW: Loading state for age group chart

  // --- Effect Hooks ---

  // Initialize Chart.js options and fetch all API data
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    const fetchAllData = async () => {
        setIsPerformanceLoading(true);
        setIsDecisionLoading(true);
        setIsRejectionLoading(true);
        setIsDemographicLoading(true);
        setIsAgeGroupLoading(true); // NEW: Set age group loading to true
        
        try {
            // MODIFIED: Fetch all endpoints concurrently for better performance
            const [perfResponse, rejectResponse, genderResponse, ageGroupResponse] = await Promise.all([
                axios.get("http://localhost:5000/board/icApplicationSummary"),
                axios.get("http://localhost:5000/board/icRejectComments"),
                axios.get("http://localhost:5000/board/icApplicationByGender"),
                axios.get("http://localhost:5000/board/icApplicationByAgeGroup") // NEW: Added age group API call
            ]);

            // Process data for Performance and Decision charts
            if (perfResponse.data?.success) {
                const apiData = perfResponse.data.data;
                const perfLabels = apiData.map(item => item.reason);
                const totalData = apiData.map(item => item.total_applications);
                const acceptedData = apiData.map(item => item.total_accepted);
                const rejectedData = apiData.map(item => item.total_rejected);

                setPerformanceChartData({
                    labels: perfLabels,
                    datasets: [
                        { label: 'Jumlah Permohonan', data: totalData, backgroundColor: '#5e72e4' },
                        { label: 'Diluluskan', data: acceptedData, backgroundColor: '#2dce89' },
                        { label: 'Ditolak', data: rejectedData, backgroundColor: '#f5365c' }
                    ]
                });

                const totalAccepted = apiData.reduce((sum, item) => sum + item.total_accepted, 0);
                const totalRejected = apiData.reduce((sum, item) => sum + item.total_rejected, 0);
                setDecisionChartData(prevData => ({
                    ...prevData,
                    datasets: [{ ...prevData.datasets[0], data: [totalAccepted, totalRejected] }]
                }));
            }

            // Process data for Rejection Reasons chart
            if (rejectResponse.data?.success) {
                const apiData = rejectResponse.data.data;
                const reasonLabels = apiData.map(item => item.comment_category);
                const reasonData = apiData.map(item => item.total_comments);
                setRejectionReasonChartData(prevData => ({
                    ...prevData,
                    labels: reasonLabels,
                    datasets: [{ ...prevData.datasets[0], data: reasonData }]
                }));
            }

            // Process data for Gender and Average Age sections
            if (genderResponse.data?.success) {
              const apiData = genderResponse.data.data;
              const maleData = apiData.find(d => (d.gender || '').toUpperCase() === 'LELAKI') || { total_ic_applications: 0, avg_age: 0 };
              const femaleData = apiData.find(d => (d.gender || '').toUpperCase() === 'PEREMPUAN') || { total_ic_applications: 0, avg_age: 0 };
              setGenderChartData(prevData => ({
                ...prevData,
                datasets: [{ ...prevData.datasets[0], data: [maleData.total_ic_applications, femaleData.total_ic_applications] }]
              }));
              setAvgAgeData({ male: maleData.avg_age, female: femaleData.avg_age });
            }

            // NEW: Process data for Age Group chart
            if (ageGroupResponse.data?.success) {
                const apiData = ageGroupResponse.data.data;
                
                // For robustness, define the order of labels to ensure the chart is always consistent
                const orderedLabels = ["0-17", "18-24", "25-39", "40-59", "60+"];
                
                // Create a map for quick lookups of data from the API
                const dataMap = new Map(apiData.map(item => [item.age_group, item.total_ic_applications]));
                
                // Map the data according to the defined order, using 0 as a fallback if a group is missing
                const chartData = orderedLabels.map(label => dataMap.get(label) || 0);

                setAgeGroupChartData(prevData => ({
                    ...prevData,
                    labels: orderedLabels,
                    datasets: [{ ...prevData.datasets[0], data: chartData }]
                }));
            }

        } catch (error) {
            console.error("Error fetching dashboard data:", error);
        } finally {
            setIsPerformanceLoading(false);
            setIsDecisionLoading(false);
            setIsRejectionLoading(false);
            setIsDemographicLoading(false);
            setIsAgeGroupLoading(false); // NEW: Set age group loading to false
        }
    };

    fetchAllData();
  }, []);
  
  // Custom Chart Options
  const rejectionReasonChartOptions = {
    ...deathsByAgeGroupChart.options,
    indexAxis: 'y',
    maintainAspectRatio: false,
    scales: { x: { ticks: { precision: 0 } } },
    plugins: { legend: { display: false } }
  };

  const performanceChartOptions = {
    ...deathsByAgeGroupChart.options, 
    maintainAspectRatio: false,
    scales: { y: { ticks: { precision: 0 } } }
  };

  return (
    <>
      <Container className="pt-4" fluid>
        {/* ROW 1: IC Application Performance Chart */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Prestasi Permohonan</h6>
                <h2 className="mb-0">Prestasi Permohonan Kad Pengenalan dalam Masa 12 Bulan</h2>
              </CardHeader>
              <CardBody>
                {isPerformanceLoading ? (
                  <div className="d-flex justify-content-center align-items-center" style={{ height: "350px" }}>
                    Loading chart data...
                  </div>
                ) : (
                  <div className="chart" style={{ height: "350px" }}>
                    <Bar data={performanceChartData} options={performanceChartOptions} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 2: APPLICATION SUMMARY CHARTS */}
        <Row className="mt-5">
            <Col xl="6" className="mb-5 mb-xl-0">
                <Card className="shadow h-100">
                    <CardHeader className="bg-transparent"><h2 className="mb-0">Jumlah Keputusan Permohonan Dalam 12 Bulan</h2></CardHeader>
                    <CardBody>
                        {isDecisionLoading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                        ) : (
                            <div className="chart" style={{ height: "300px" }}>
                                <Pie data={decisionChartData} options={{...deathsByGenderChart.options, maintainAspectRatio: false }} />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Col>
            <Col xl="6">
                <Card className="shadow h-100">
                    <CardHeader className="bg-transparent"><h2 className="mb-0">Sebab Permohonan Ditolak</h2></CardHeader>
                    <CardBody>
                        {isRejectionLoading ? (
                            <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                        ) : (
                            <div className="chart" style={{ height: "300px" }}>
                                <Bar data={rejectionReasonChartData} options={rejectionReasonChartOptions} />
                            </div>
                        )}
                    </CardBody>
                </Card>
            </Col>
        </Row>

        {/* ROW 3: DEMOGRAPHIC BREAKDOWN DISPLAYS (NOW FULLY FROM API) */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                  <h2 className="mb-0">Permohonan Mengikut Kumpulan Umur</h2>
              </CardHeader>
              {/* MODIFIED: Added loading state for age group chart */}
              <CardBody>
                {isAgeGroupLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : (
                  <div className="chart" style={{ height: "300px" }}>
                      <Bar data={ageGroupChartData} options={{ ...deathsByAgeGroupChart.options, maintainAspectRatio: false }} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                  <h2 className="mb-0">Permohonan Mengikut Jantina</h2>
              </CardHeader>
              <CardBody>
                {isDemographicLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : (
                  <div className="chart" style={{ height: "300px" }}>
                      <Pie data={genderChartData} options={{ ...deathsByGenderChart.options, maintainAspectRatio: false }} />
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik Pemohon</h6>
                  <h2 className="mb-0">Purata Umur Pemohon</h2>
              </CardHeader>
              <CardBody>
                {isDemographicLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : (
                  <Row className="h-100 align-items-center">
                    <Col xs="6" className="text-center">
                        <i className="fas fa-mars text-primary" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                        <div className="display-3 font-weight-bold">{avgAgeData.male.toFixed(1)}</div>
                        <span className="text-muted">Tahun</span>
                        <h4 className="mt-2">Lelaki</h4>
                    </Col>
                    <Col xs="6" className="text-center">
                        <i className="fas fa-venus text-danger" style={{ fontSize: '3rem', marginBottom: '1rem' }}></i>
                        <div className="display-3 font-weight-bold">{avgAgeData.female.toFixed(1)}</div>
                        <span className="text-muted">Tahun</span>
                        <h4 className="mt-2">Perempuan</h4>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default KadPengenalan;