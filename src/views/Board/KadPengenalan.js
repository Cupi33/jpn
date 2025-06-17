import { useEffect, useState } from "react";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Card, CardHeader, CardBody, Container, Row, Col, Input } from "reactstrap";
import Chart from "chart.js";

// Import configurations from a chart configuration file
// These are reused for styling but the data is hardcoded below.
import {
  chartOptions,
  parseOptions,
  annualDeathsChart,
  deathsByGenderChart,
  deathsByAgeGroupChart,
} from "variables/chartAdmin3";


// --- MAIN IDENTITY CARD STATISTIC COMPONENT ---
const KadPengenalan = (props) => {

  // --- HARDCODED DATA SECTION ---

  // State for Annual Chart (Hardcoded)
  const [annualChartData] = useState({
    labels: ["2019", "2020", "2021", "2022", "2023"],
    datasets: [{
        label: "Permohonan",
        data: [225000, 210000, 240000, 265000, 280000],
        borderColor: "#5e72e4",
        backgroundColor: "#5e72e4",
        pointBackgroundColor: "#5e72e4",
        pointRadius: 3,
        pointHoverRadius: 5,
    }],
  });

  // State for Application Decision Summary (Hardcoded)
  const [decisionChartData] = useState({
    labels: ["Diluluskan", "Ditolak"],
    datasets: [{
        data: [450000, 25000],
        backgroundColor: ["#2dce89", "#f5365c"],
        hoverBackgroundColor: ["#2dce89", "#f5365c"]
    }]
  });
  const [rejectionReasonChartData] = useState({
    labels: ["Dokumen Tidak Lengkap", "Maklumat Tidak Tepat", "Gambar Tidak Jelas", "Lain-lain"],
    datasets: [{
        label: "Jumlah",
        data: [12000, 8000, 4500, 500],
        backgroundColor: "#fb6340"
    }]
  });

  // State for Gender chart (Hardcoded data for filter)
  const [allGenderData] = useState([
    { year: "2023", male: 145000, female: 135000 },
    { year: "2022", male: 138000, female: 127000 },
    { year: "2021", male: 124000, female: 116000 },
    { year: "2020", male: 108000, female: 102000 },
    { year: "2019", male: 115000, female: 110000 },
  ]);
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  // State for Age Group chart (Hardcoded)
  const [ageGroupChartData] = useState({
    labels: ["0-17", "18-24", "25-39", "40-59", "60+"],
    datasets: [{ label: "Permohonan", data: [95000, 150000, 110000, 85000, 55000], backgroundColor: "#11cdef" }],
  });

  // State for Average Age of Applicant display (Hardcoded)
  const [avgAgeData] = useState({ male: 35.2, female: 36.8 });

  // --- Effect Hooks ---

  // Initialize Chart.js options
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }
  }, []);

  // Data Processing for Gender Chart Filter
  useEffect(() => {
    if (!allGenderData || allGenderData.length === 0) return;
    let maleTotal = 0;
    let femaleTotal = 0;
    if (selectedYear === "ALL") {
      allGenderData.forEach(yearData => {
        maleTotal += yearData.male;
        femaleTotal += yearData.female;
      });
    } else {
      const yearData = allGenderData.find(d => d.year.toString() === selectedYear.toString());
      if (yearData) {
        maleTotal = yearData.male;
        femaleTotal = yearData.female;
      }
    }
    setGenderChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] }));
  }, [selectedYear, allGenderData]);
  
  // Custom Chart Options
  const rejectionReasonChartOptions = {
    ...deathsByAgeGroupChart.options,
    indexAxis: 'y',
    maintainAspectRatio: false,
    scales: { x: { ticks: { precision: 0 } } },
    plugins: { legend: { display: false } }
  };

  return (
    <>
      <Container className="pt-4" fluid>
        {/* ROW 1: ANNUAL APPLICATIONS CHART */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Gambaran Keseluruhan</h6>
                    <h2 className="mb-0">Statistik Permohonan Kad Pengenalan 5 Tahun Terakhir</h2>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "350px" }}>
                  <Line data={annualChartData} options={{...annualDeathsChart.options, maintainAspectRatio: false}} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 2: APPLICATION SUMMARY CHARTS */}
        <Row className="mt-5">
            <Col xl="6" className="mb-5 mb-xl-0">
                <Card className="shadow h-100">
                    <CardHeader className="bg-transparent"><h2 className="mb-0">Jumlah Keputusan Permohonan Kad Pengenalan Dalam 12 Bulan</h2></CardHeader>
                    <CardBody>
                        <div className="chart" style={{ height: "300px" }}>
                            <Pie data={decisionChartData} options={{...deathsByGenderChart.options, maintainAspectRatio: false }} />
                        </div>
                    </CardBody>
                </Card>
            </Col>
            <Col xl="6">
                <Card className="shadow h-100">
                    <CardHeader className="bg-transparent"><h2 className="mb-0">Sebab Permohonan Ditolak</h2></CardHeader>
                    <CardBody>
                        <div className="chart" style={{ height: "300px" }}>
                            <Bar data={rejectionReasonChartData} options={rejectionReasonChartOptions} />
                        </div>
                    </CardBody>
                </Card>
            </Col>
        </Row>

        {/* ROW 3: DEMOGRAPHIC BREAKDOWN DISPLAYS */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div>
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                  <h2 className="mb-0">Permohonan Mengikut Kumpulan Umur</h2>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                    <Bar data={ageGroupChartData} options={{ ...deathsByAgeGroupChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                    <h2 className="mb-0">Permohonan Mengikut Jantina</h2>
                  </div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                      <option value="ALL">All Years</option>
                      {allGenderData.map(item => (<option key={item.year} value={item.year}>{item.year}</option>))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                    <Pie data={genderChartData} options={{ ...deathsByGenderChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div>
                  <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik Pemohon</h6>
                  <h2 className="mb-0">Purata Umur Pemohon</h2>
                </div>
              </CardHeader>
              <CardBody>
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
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default KadPengenalan;