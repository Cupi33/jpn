import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie, Bar } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input } from "reactstrap";
import Chart from "chart.js";

// Import configurations from our chart configuration file
import {
  chartOptions,
  parseOptions,
  annualDeathsChart,
  deathsByGenderChart,
  deathsByAgeGroupChart,
  stateNameMapping,
} from "variables/chartAdmin3";
import { useNavigate } from "react-router-dom";

import geoData from "../../data/malaysia-states.json";
// NEW: Import the modal component
import KematianInsightsModal from "../../components/Modals/KematianInsightModal";

// --- MAP COMPONENT (No changes needed) ---
const MapChart = ({ data, stateNameMapping }) => {
    const [position, setPosition] = useState({ coordinates: [108, 4], zoom: 1 });
    const handleZoomIn = () => { if (position.zoom < 4) setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 })); };
    const handleZoomOut = () => { if (position.zoom > 1) setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 })); };
    const handleMoveEnd = (position) => { setPosition(position); };

    const deathValues = Object.values(data).map((d) => d.total);
    const minPop = Math.min(...deathValues, 0);
    const maxPop = Math.max(...deathValues, 1);
    const colorScale = (value) => {
        if (value === undefined || value === null) return "#DDD";
        const normalized = (value - minPop) / (maxPop - minPop);
        const r = 255; const g = 255 - Math.floor(normalized * 200); const b = 100 - Math.floor(normalized * 100);
        return `rgb(${r}, ${g}, ${b})`;
    };

    return (
        <div style={{ position: "relative" }}>
        <ComposableMap projection="geoMercator" projectionConfig={{ scale: 1800 }} style={{ width: "100%", height: "auto" }}>
            <ZoomableGroup zoom={position.zoom} center={position.coordinates} onMoveEnd={handleMoveEnd}>
            <Geographies geography={geoData}>
                {({ geographies }) => geographies.map((geo) => {
                const geoJsonName = geo.properties.name;
                const apiName = stateNameMapping[geoJsonName];
                const stateData = data[apiName];
                return (
                    <Geography
                    key={geo.rsmKey} geography={geo} data-tooltip-id="map-tooltip"
                    data-tooltip-content={stateData ? `${geoJsonName}: ${stateData.total.toLocaleString()} deaths` : `${geoJsonName}: No data`}
                    style={{
                        default: { fill: stateData ? colorScale(stateData.total) : "#F5F5F5", outline: "none", stroke: "#FFF", strokeWidth: 0.5 },
                        hover: { fill: "#f5365c", outline: "none" },
                        pressed: { fill: "#E42B4F", outline: "none" },
                    }}
                    />
                );
                })}
            </Geographies>
            </ZoomableGroup>
        </ComposableMap>
        <div style={{ position: "absolute", top: "10px", right: "10px", display: "flex", flexDirection: "column" }}>
            <Button color="primary" onClick={handleZoomIn} className="btn-icon btn-sm mb-1"><span className="btn-inner--icon"><i className="fas fa-plus" /></span></Button>
            <Button color="primary" onClick={handleZoomOut} className="btn-icon btn-sm"><span className="btn-inner--icon"><i className="fas fa-minus" /></span></Button>
        </div>
        </div>
    );
};


// --- MAIN DEATH STATISTIC COMPONENT ---
const Kematian = (props) => {

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

  // NEW: State for the modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const toggleModal = () => setIsModalOpen(!isModalOpen);

  // State for Annual Chart
  const [annualChartData, setAnnualChartData] = useState({
    labels: [], datasets: [{ label: "Kematian", data: [], borderColor: "#f5365c", backgroundColor: "#f5365c", pointBackgroundColor: "#f5365c", pointRadius: 3, pointHoverRadius: 5, }],
  });
  const [isAnnualChartLoading, setIsAnnualChartLoading] = useState(true);
  const [annualRawStats, setAnnualRawStats] = useState([]);

  // State for Death Application Summary
  const [decisionChartData, setDecisionChartData] = useState({
    labels: ["Diluluskan", "Ditolak"], datasets: [{ data: [0, 0], backgroundColor: ["#2dce89", "#f5365c"], hoverBackgroundColor: ["#2dce89", "#f5365c"] }]
  });
  const [isDecisionLoading, setIsDecisionLoading] = useState(true);
  const [rejectionReasonChartData, setRejectionReasonChartData] = useState({
    labels: [], datasets: [{ label: "Jumlah", data: [], backgroundColor: "#fb6340" }]
  });
  const [isRejectionLoading, setIsRejectionLoading] = useState(true);

  // State for Map/Table data
  const [deathTableData, setDeathTableData] = useState([]);
  const [deathMapData, setDeathMapData] = useState({});
  const [isMapDataLoading, setIsMapDataLoading] = useState(true);

  // State for Gender chart
  const [allGenderData, setAllGenderData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [isGenderLoading, setIsGenderLoading] = useState(true);
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"], datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  // State for Age Group chart
  const [ageGroupChartData, setAgeGroupChartData] = useState({
    labels: ["0-17", "18-24", "25-39", "40-59", "60+"], datasets: [{ label: "Deaths", data: [0, 0, 0, 0, 0], backgroundColor: "#11cdef" }],
  });
  const [isAgeGroupLoading, setIsAgeGroupLoading] = useState(true);

  // State for Average Age of Death display
  const [avgAgeData, setAvgAgeData] = useState({ male: 0, female: 0 });
  const [isAvgAgeLoading, setIsAvgAgeLoading] = useState(true);

  // --- Data Fetching and Initial Processing ---
  useEffect(() => {
    if (window.Chart) { parseOptions(Chart, chartOptions()); }
    const fetchAllData = async () => {
        // ... (all axios calls remain the same as your previous file)
        // Fetch data for the Annual Deaths Chart
        setIsAnnualChartLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/board/deathPerYear");
            if (response.data?.success) {
                const stats = response.data.stats; setAnnualRawStats(stats);
                const labels = stats.map(d => d.death_year); const dataPoints = stats.map(d => d.total_deaths);
                setAnnualChartData(prev => ({...prev, labels: labels, datasets: [{ ...prev.datasets[0], data: dataPoints }]}));
            }
        } catch (error) { console.error("Error fetching annual death data:", error); }
        finally { setIsAnnualChartLoading(false); }
        // Fetch data for Death Application Summary
        setIsDecisionLoading(true); setIsRejectionLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/board/deathAppSummary");
            if (response.data?.success) {
                const { total_accept, total_reject, comments } = response.data.data;
                setDecisionChartData(prev => ({...prev, datasets: [{ ...prev.datasets[0], data: [total_accept, total_reject] }]}));
                const reasonLabels = comments.map(c => c.comment_category); const reasonData = comments.map(c => c.total_comments);
                setRejectionReasonChartData(prev => ({...prev, labels: reasonLabels, datasets: [{ ...prev.datasets[0], data: reasonData }]}));
            }
        } catch (error) { console.error("Error fetching death application summary data:", error); }
        finally { setIsDecisionLoading(false); setIsRejectionLoading(false); }
        // Fetch data for Map and Table
        setIsMapDataLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/deathStat/deathState");
            if (response.data?.success) {
                const stats = response.data.stats;
                const formattedTableData = Object.entries(stats).map(([stateName, data]) => ({ state: stateName, population: data.total_death, percentage: data.percentage })).sort((a, b) => b.population - a.population);
                setDeathTableData(formattedTableData);
                const formattedMapData = {};
                for (const [stateName, data] of Object.entries(stats)) {
                    const mapKey = stateName.replace(/ /g, '_').toUpperCase(); formattedMapData[mapKey] = { total: data.total_death, percentage: data.percentage };
                }
                setDeathMapData(formattedMapData);
            }
        } catch (error) { console.error("Error fetching death by state data:", error); } 
        finally { setIsMapDataLoading(false); }
        // Fetch data for Age Group Chart
        setIsAgeGroupLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/deathStat/deathTotal5year");
            if (response.data?.success) {
                const { stats } = response.data; const dataArray = [ stats['0-17'] || 0, stats['18-24'] || 0, stats['25-39'] || 0, stats['40-59'] || 0, stats['60+'] || 0 ];
                setAgeGroupChartData(prev => ({ ...prev, datasets: [{ ...prev.datasets[0], data: dataArray }] }));
            }
        } catch (error) { console.error("Error fetching age group death data:", error); } 
        finally { setIsAgeGroupLoading(false); }
        // Fetch data for Gender Chart
        setIsGenderLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/deathStat/genderDeath5year");
            if (response.data?.success) { setAllGenderData(response.data.stats); }
        } catch (error) { console.error("Error fetching gender death data:", error); }
        finally { setIsGenderLoading(false); }
        // Fetch data for Average Age display
        setIsAvgAgeLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/deathStat/avgAgeOfDeath");
            if (response.data?.success) { setAvgAgeData(response.data.stats); }
        } catch (error) { console.error("Error fetching average age of death data:", error); }
        finally { setIsAvgAgeLoading(false); }
    };
    fetchAllData();
  }, []);

  // NEW: useEffect to calculate insights when all data is ready
  useEffect(() => {
    const allDataLoaded = !isMapDataLoading && !isAnnualChartLoading && !isRejectionLoading && !isAgeGroupLoading;
    if (allDataLoaded) {
      // 1. & 2. Most and Fewest Deaths
      const mostDeaths = { name: deathTableData[0]?.state, count: deathTableData[0]?.population };
      const fewestDeaths = { name: deathTableData[deathTableData.length - 1]?.state, count: deathTableData[deathTableData.length - 1]?.population };

      // 3. Deaths Per Year
      const deathsPerYear = annualRawStats.map(stat => ({
        year: stat.death_year,
        count: stat.total_deaths
      }));

      // 4. Top Rejection Reason
      let topReason = { reason: 'N/A', count: 0 };
      if (rejectionReasonChartData.datasets[0].data.length > 0) {
        const rejectionData = rejectionReasonChartData.datasets[0].data;
        const maxCount = Math.max(...rejectionData);
        const maxIndex = rejectionData.indexOf(maxCount);
        topReason = {
          reason: rejectionReasonChartData.labels[maxIndex],
          count: maxCount
        };
      }
      
      // 5. Age Group Analysis
      const ageData = ageGroupChartData.datasets[0].data;
      const maxAgeCount = Math.max(...ageData);
      const maxAgeIndex = ageData.indexOf(maxAgeCount);
      const topAgeGroup = ageGroupChartData.labels[maxAgeIndex];
      const ageGroupAnalysisText = `Statistik menunjukkan bahawa kumpulan umur ${topAgeGroup} mencatatkan bilangan kematian tertinggi dalam tempoh 5 tahun yang lepas. Ini menyoroti kepentingan tumpuan kesihatan dan sokongan sosial untuk golongan ini.`;
      
      // 6. Overall Analysis
      const totalDeaths5Years = annualRawStats.reduce((acc, curr) => acc + curr.total_deaths, 0);
      const overallAnalysisText = `Dalam tempoh 5 tahun terakhir, Malaysia telah merekodkan sejumlah ${totalDeaths5Years.toLocaleString()} kematian. ${mostDeaths.name} secara konsisten menjadi negeri dengan jumlah kematian tertinggi. Dari segi pentadbiran, isu berkaitan "${topReason.reason}" merupakan halangan utama dalam kelancaran proses pendaftaran kematian, menandakan perlunya semakan semula prosedur untuk memudahkan urusan orang awam.`;

      setInsightsData({
        mostDeaths,
        fewestDeaths,
        deathsPerYear,
        topRejectionReason: topReason,
        ageGroupAnalysisText,
        overallAnalysisText,
      });
    }
  }, [isMapDataLoading, isAnnualChartLoading, isRejectionLoading, isAgeGroupLoading, deathTableData, annualRawStats, rejectionReasonChartData, ageGroupChartData]);

  // ... (other useEffect and custom options remain the same)
  // --- Data Processing for Gender Chart ---
  useEffect(() => {
    if (!allGenderData || allGenderData.length === 0) return; let maleTotal = 0; let femaleTotal = 0;
    if (selectedYear === "ALL") { allGenderData.forEach(yearData => { maleTotal += yearData.male; femaleTotal += yearData.female; });
    } else { const yearData = allGenderData.find(d => d.year === selectedYear); if (yearData) { maleTotal = yearData.male; femaleTotal = yearData.female; } }
    setGenderChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] }));
  }, [selectedYear, allGenderData]);
  // --- Custom Chart Options ---
  const customAnnualChartOptions = {
    ...annualDeathsChart.options, maintainAspectRatio: false,
    tooltips: {
      callbacks: {
        label: function (tooltipItem, data) {
          const datasetLabel = data.datasets[tooltipItem.datasetIndex].label || '';
          const totalDeaths = tooltipItem.yLabel;
          const avgAge = annualRawStats[tooltipItem.index]?.average_age_death;
          let hoverLabel = `${datasetLabel}: ${totalDeaths.toLocaleString()}`;
          if (avgAge) { hoverLabel += ` | Purata Umur: ${avgAge.toFixed(1)}`; }
          return hoverLabel;
        },
      },
    },
  };
  const rejectionReasonChartOptions = {
    ...deathsByAgeGroupChart.options, indexAxis: 'y', maintainAspectRatio: false,
    scales: { x: { ticks: { precision: 0 } } }, plugins: { legend: { display: false } }
  };

  return (
    <>
      <Container className="pt-4" fluid>
        {/* ROW 1: ANNUAL DEATHS CHART */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              {/* MODIFIED: CardHeader with button */}
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Gambaran Keseluruhan</h6>
                    <h2 className="mb-0">Statistik Kematian 5 Tahun Terakhir</h2>
                  </div>
                  <Button color="info" size="sm" onClick={toggleModal}>
                    Analisis Lanjut
                  </Button>
                </div>
              </CardHeader>
              <CardBody>
                {isAnnualChartLoading ? ( <div className="d-flex justify-content-center align-items-center" style={{ height: "350px" }}>Loading chart data...</div>
                ) : ( <div className="chart" style={{ height: "350px" }}><Line data={annualChartData} options={customAnnualChartOptions} /></div> )}
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 2: NEW - Application Summary Charts */}
        <Row className="mt-5">
            <Col xl="6" className="mb-5 mb-xl-0">
                <Card className="shadow h-100">
                    <CardHeader className="bg-transparent"><h2 className="mb-0">Jumlah Keputusan Permohonan Pendaftaran Kematian Dalam 12 Bulan</h2></CardHeader>
                    <CardBody>
                        {isDecisionLoading ? ( <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                        ) : ( <div className="chart" style={{ height: "300px" }}><Pie data={decisionChartData} options={{...deathsByGenderChart.options, maintainAspectRatio: false }} /></div> )}
                    </CardBody>
                </Card>
            </Col>
            <Col xl="6">
                <Card className="shadow h-100">
                    <CardHeader className="bg-transparent"><h2 className="mb-0">Sebab Permohonan Ditolak</h2></CardHeader>
                    <CardBody>
                         {isRejectionLoading ? ( <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                         ) : ( <div className="chart" style={{ height: "300px" }}><Bar data={rejectionReasonChartData} options={rejectionReasonChartOptions} /></div> )}
                    </CardBody>
                </Card>
            </Col>
        </Row>

        {/* ROW 3: DEMOGRAPHIC BREAKDOWN DISPLAYS */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent"><div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Kematian Mengikut Umur</h2></div></CardHeader>
              <CardBody>
                {isAgeGroupLoading ? ( <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : ( <div className="chart" style={{ height: "300px" }}><Bar data={ageGroupChartData} options={{ ...deathsByAgeGroupChart.options, maintainAspectRatio: false }} /></div> )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Kematian Mengikut Jantina</h2></div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
                      <option value="ALL">All Years</option>
                      {allGenderData.map(item => (<option key={item.year} value={item.year}>{item.year}</option>))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {isGenderLoading ? ( <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : ( <div className="chart" style={{ height: "300px" }}><Pie data={genderChartData} options={{ ...deathsByGenderChart.options, maintainAspectRatio: false }} /></div> )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent"><div><h6 className="text-uppercase text-muted ls-1 mb-1">Jangka Hayat</h6><h2 className="mb-0">Purata Umur Kematian</h2></div></CardHeader>
              <CardBody>
                {isAvgAgeLoading ? ( <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
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
        
        {/* ROW 4: HEATMAP AND DATA TABLE */}
        <Row className="mt-5">
          <Col xl="7" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="border-0"><h3 className="mb-0">Peta Taburan Kematian Di Malaysia Dalam 5 Tahun</h3></CardHeader>
              <CardBody>
                 {isMapDataLoading ? ( <div className="text-center">Loading map data...</div>
                 ) : ( <MapChart data={deathMapData} stateNameMapping={stateNameMapping} /> )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0"><h3 className="mb-0">Jadual Kematian Mengikut Negeri Dalam 5 Tahun</h3></CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light"><tr><th scope="col">Negeri</th><th scope="col">Jumlah Kematian</th><th scope="col">Peratusan</th></tr></thead>
                <tbody>
                  {isMapDataLoading ? ( <tr><td colSpan="3" className="text-center">Loading data...</td></tr>
                  ) : (
                    deathTableData.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" style={{ textTransform: 'capitalize' }}>{item.state.toLowerCase()}</th>
                        <td>{item.population.toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center"><span className="mr-2">{item.percentage}%</span>
                            <div><Progress max="100" value={item.percentage} barClassName="bg-gradient-danger" /></div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
      {/* NEW: Render the modal */}
      <KematianInsightsModal 
        isOpen={isModalOpen}
        toggle={toggleModal}
        insights={insightsData}
      />
      <ReactTooltip id="map-tooltip" />
    </>
  );
};

export default Kematian;