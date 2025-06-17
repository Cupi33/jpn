// KelahiranBayi.js

import { useEffect, useState } from "react";
import { Line, Pie, Doughnut, Bar } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input } from "reactstrap";
import Chart from "chart.js";

// Import Modal
import KelahiranInsightsModal from "../../components/Modals/KelahiranInsightModal"; // Adjust path if needed

// Import configurations from chartAdmin2.js
import {
  chartOptions,
  parseOptions,
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart,
} from "variables/chartAdmin2";

import geoData from "../../data/malaysia-states.json";

// State name mapping for newborn data
const stateNameMapping = {
  "Johor": "JOHOR", "Kedah": "KEDAH", "Kelantan": "KELANTAN", "Kuala Lumpur": "KUALA_LUMPUR",
  "Melaka": "MELAKA", "Negeri Sembilan": "NEGERI_SEMBILAN", "Pahang": "PAHANG",
  "Perak": "PERAK", "Perlis": "PERLIS", "Pulau Pinang": "PULAU_PINANG", 
  "Sabah": "SABAH", "Sarawak": "SARAWAK", "Selangor": "SELANGOR", "Terengganu": "TERENGGANU",
};

// Hardcoded gender distribution by state
const hardcodedGenderData = {
  "JOHOR": { LELAKI: { total: 43500 }, PEREMPUAN: { total: 41500 } },
  "SELANGOR": { LELAKI: { total: 47000 }, PEREMPUAN: { total: 45000 } },
  "KUALA_LUMPUR": { LELAKI: { total: 23000 }, PEREMPUAN: { total: 22000 } },
  "PERAK": { LELAKI: { total: 19500 }, PEREMPUAN: { total: 18500 } },
  "PAHANG": { LELAKI: { total: 14300 }, PEREMPUAN: { total: 13700 } },
  "KEDAH": { LELAKI: { total: 17800 }, PEREMPUAN: { total: 17200 } },
  "PULAU_PINANG": { LELAKI: { total: 16400 }, PEREMPUAN: { total: 15600 } },
  "KELANTAN": { LELAKI: { total: 21500 }, PEREMPUAN: { total: 20500 } },
  "TERENGGANU": { LELAKI: { total: 12800 }, PEREMPUAN: { total: 12200 } },
  "NEGERI_SEMBILAN": { LELAKI: { total: 11200 }, PEREMPUAN: { total: 10800 } },
  "MELAKA": { LELAKI: { total: 9200 }, PEREMPUAN: { total: 8800 } },
  "PERLIS": { LELAKI: { total: 4100 }, PEREMPUAN: { total: 3900 } },
  "SABAH": { LELAKI: { total: 24500 }, PEREMPUAN: { total: 23500 } },
  "SARAWAK": { LELAKI: { total: 26600 }, PEREMPUAN: { total: 25400 } },
};

// --- MAP COMPONENT with Zoom/Pan ---
const MapChart = ({ data, stateNameMapping }) => {
  const [position, setPosition] = useState({ coordinates: [108, 4], zoom: 1 });
  const handleZoomIn = () => { if (position.zoom < 4) setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 })); };
  const handleZoomOut = () => { if (position.zoom > 1) setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 })); };
  const handleMoveEnd = (position) => { setPosition(position); };

  const populationValues = Object.values(data).map((d) => d.total);
  const minPop = Math.min(...populationValues, 0);
  const maxPop = Math.max(...populationValues, 1);
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
              const dataKey = stateNameMapping[geoJsonName]; 
              const stateData = data[dataKey];
              return (
                <Geography
                  key={geo.rsmKey} geography={geo} data-tooltip-id="map-tooltip"
                  data-tooltip-content={stateData ? `${geoJsonName}: ${stateData.total.toLocaleString()} kelahiran` : `${geoJsonName}: Tiada data`}
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

// --- MAIN KELAHIRAN BAYI COMPONENT ---
const KelahiranBayi = (props) => {
  const [birthTableData, setBirthTableData] = useState([]);
  const [birthMapData, setBirthMapData] = useState({});

  // State for Modal
  const [isInsightsModalOpen, setInsightsModalOpen] = useState(false);
  const [insightsData, setInsightsData] = useState(null);
  const toggleInsightsModal = () => setInsightsModalOpen(!isInsightsModalOpen);


  // State for the main overview chart (Births vs Deaths)
  const [birthDeathChartData, setBirthDeathChartData] = useState({
    labels: [],
    datasets: [
      { label: "Kelahiran Bayi", data: [], borderColor: "#2dce89", backgroundColor: "#2dce89", pointBackgroundColor: "#2dce89", pointRadius: 3, pointHoverRadius: 5 },
      { label: "Jumlah Kematian", data: [], borderColor: "#fb6340", backgroundColor: "#fb6340", pointBackgroundColor: "#fb6340", pointRadius: 3, pointHoverRadius: 5 },
    ],
  });

  // Gender Chart State
  const [selectedGenderState, setSelectedGenderState] = useState("ALL");
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  // States for Ethnicity Chart
  const [yearlyRaceData, setYearlyRaceData] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedEthnicityYear, setSelectedEthnicityYear] = useState("ALL");
  const [ethnicityChartData, setEthnicityChartData] = useState({
    labels: ["Melayu", "Cina", "India", "Lain-lain"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"], hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"] }],
  });

  // States for the 5-year trend chart
  const [birthTrendChartData, setBirthTrendChartData] = useState({
    labels: [],
    datasets: [{ label: "Kelahiran Bayi", data: [], backgroundColor: "#11cdef", borderColor: "#11cdef", borderWidth: 2, fill: false }],
  });
  const [birthTrendIndicators, setBirthTrendIndicators] = useState([]);

  // States for Application Summary Charts
  const [appDecisionChartData, setAppDecisionChartData] = useState({
    labels: ['Diterima', 'Ditolak'],
    datasets: [{ data: [0, 0], backgroundColor: ['#2dce89', '#f5365c'], hoverBackgroundColor: ['#2dce89', '#f5365c'] }],
  });
  const [rejectionReasonChartData, setRejectionReasonChartData] = useState({
    labels: [],
    datasets: [{ label: 'Jumlah Permohonan', data: [], backgroundColor: '#fb6340', borderColor: '#fb6340' }],
  });


  // --- Initial Data Loading ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    const fetchAllData = async () => {
      try {
        // Fetch newborn application summary data
        const appSummaryResponse = await fetch("http://localhost:5000/board/newbornAppSummary");
        const appSummaryApiData = await appSummaryResponse.json();
        if (appSummaryApiData.success && appSummaryApiData.data) {
          const { total_accept, total_reject, comments } = appSummaryApiData.data;
          setAppDecisionChartData(prevData => ({ ...prevData, datasets: [{...prevData.datasets[0], data: [total_accept, total_reject]}] }));
          setRejectionReasonChartData({
            labels: comments.map(c => c.comment_category),
            datasets: [{ label: 'Jumlah Permohonan', data: comments.map(c => c.total_comments), backgroundColor: '#fb6340', borderColor: '#fb6340' }]
          });
        }

        // Fetch birth vs death data for the main chart
        const birthDeathResponse = await fetch("http://localhost:5000/board/birthDeath5Year");
        const birthDeathApiData = await birthDeathResponse.json();
        let yearLabels = [];
        if (birthDeathApiData.success && birthDeathApiData.stats) {
            const sortedStats = birthDeathApiData.stats.sort((a, b) => a.year - b.year);
            yearLabels = sortedStats.map(item => item.year);
            const newbornData = sortedStats.map(item => item.total_newborns);
            const deathData = sortedStats.map(item => item.total_deaths);
            setBirthDeathChartData(prevData => ({ labels: yearLabels, datasets: [ { ...prevData.datasets[0], data: newbornData }, { ...prevData.datasets[1], data: deathData } ] }));
        }

        // Fetch state-wise birth data
        const stateResponse = await fetch("http://localhost:5000/newbornStat/newbornState");
        const stateApiData = await stateResponse.json();
        if (stateApiData.success && stateApiData.stats) {
          const processedMapData = {};
          for (const stateKey in stateApiData.stats) {
            const mapKey = stateKey.replace(/ /g, "_");
            processedMapData[mapKey] = { total: stateApiData.stats[stateKey].total_population, percentage: stateApiData.stats[stateKey].percentage };
          }
          setBirthMapData(processedMapData);
          const formattedTableData = Object.entries(stateApiData.stats)
            .map(([stateName, data]) => ({ state: stateName, births: data.total_population, percentage: data.percentage }))
            .sort((a, b) => b.births - a.births);
          setBirthTableData(formattedTableData);
        }

        // Fetch 5-year trend data (and fix the missing year issue)
        const trendResponse = await fetch("http://localhost:5000/newbornStat/newbornTotal5year");
        const trendApiData = await trendResponse.json();
        if (trendApiData.success && trendApiData.stats) {
            const trendStatsWithYears = trendApiData.stats.map((item, index) => ({ ...item, birth_year: yearLabels[index] || 'N/A' }));
            setBirthTrendChartData(prev => ({ ...prev, labels: yearLabels, datasets: [{ ...prev.datasets[0], data: trendApiData.stats.map(item => item.total_newborn) }] }));
            setBirthTrendIndicators(trendStatsWithYears);
        }

        // Fetch yearly ethnicity data from the new endpoint
        const ethnicityResponse = await fetch("http://localhost:5000/newbornStat/newbornTotal5yearRace");
        const ethnicityApiData = await ethnicityResponse.json();
        if (ethnicityApiData.success && ethnicityApiData.stats) {
          setYearlyRaceData(ethnicityApiData.stats);
          const years = ethnicityApiData.stats.map(item => item.birth_year).sort((a, b) => b - a);
          setAvailableYears(years);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchAllData();
  }, []);

  // --- Data Processing for Insights Modal ---
  useEffect(() => {
    // Ensure all necessary data is loaded before generating insights
    if (birthTableData.length > 0 && birthDeathChartData.labels.length > 0 && rejectionReasonChartData.labels.length > 0) {
      // 1. & 2. Most & Fewest Births
      const mostBirths = {
        name: birthTableData[0].state,
        count: birthTableData[0].births,
      };
      const fewestBirths = {
        name: birthTableData[birthTableData.length - 1].state,
        count: birthTableData[birthTableData.length - 1].births,
      };

      // 3. Births per year
      const birthsPerYear = birthDeathChartData.labels.map((year, index) => ({
        year: year,
        count: birthDeathChartData.datasets[0].data[index],
      }));
      const totalBirths = birthsPerYear.reduce((sum, item) => sum + item.count, 0);

      // 4. Top Rejection Reason
      const rejectionCounts = rejectionReasonChartData.datasets[0].data;
      const maxCount = rejectionCounts.length > 0 ? Math.max(...rejectionCounts) : 0;
      const maxIndex = rejectionCounts.indexOf(maxCount);
      const topRejectionReason = {
        reason: rejectionReasonChartData.labels[maxIndex] || 'N/A',
        count: maxCount || 0,
      };

      // 5. & 6. Generate dynamic analysis text (CORRECTED)
      const birthStatusAnalysisText = `Walaupun majoriti permohonan pendaftaran diterima, isu penolakan masih menjadi satu cabaran. Sebab penolakan utama, iaitu "${topRejectionReason.reason}" (${topRejectionReason.count.toLocaleString()} kes), menyumbang kepada sebahagian besar permohonan yang gagal. Ini menandakan bahawa proses pengumpulan dan pengesahan dokumen merupakan halangan utama bagi pemohon, dan usaha untuk mempermudah atau memberi panduan yang lebih jelas boleh membantu mengurangkan kadar penolakan pada masa hadapan.`;
      const overallAnalysisText = `Dalam tempoh 5 tahun, sejumlah ${totalBirths.toLocaleString()} kelahiran telah direkodkan di seluruh Malaysia. ${mostBirths.name} menjadi penyumbang utama dengan ${mostBirths.count.toLocaleString()} kelahiran, manakala ${fewestBirths.name} mencatatkan jumlah terendah. Trend tahunan menunjukkan variasi, memberikan gambaran tentang dinamik populasi negara. Analisis lanjut diperlukan untuk mengkaji faktor-faktor yang mempengaruhi kadar kelahiran di setiap negeri.`;

      // Set the final insights object into state
      setInsightsData({
        mostBirths,
        fewestBirths,
        birthsPerYear,
        topRejectionReason,
        birthStatusAnalysisText,
        overallAnalysisText,
      });
    }
  }, [birthTableData, birthDeathChartData, rejectionReasonChartData]); // Dependencies ensure this runs when data is ready


  // --- Data Processing for Gender Chart ---
  useEffect(() => {
    let maleTotal = 0; let femaleTotal = 0;
    if (selectedGenderState === "ALL") {
      Object.values(hardcodedGenderData).forEach(stateData => { 
        maleTotal += stateData.LELAKI.total; 
        femaleTotal += stateData.PEREMPUAN.total; 
      });
    } else {
      const stateData = hardcodedGenderData[selectedGenderState];
      if (stateData) { 
        maleTotal = stateData.LELAKI.total; 
        femaleTotal = stateData.PEREMPUAN.total; 
      }
    }
    setGenderChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] }));
  }, [selectedGenderState]);

  // --- Data Processing for Ethnicity Chart ---
  useEffect(() => {
    if (yearlyRaceData.length === 0) return;
    let dataForChart = [0, 0, 0, 0];
    if (selectedEthnicityYear === "ALL") {
      const totals = yearlyRaceData.reduce((acc, yearData) => {
        acc.melayu += yearData.race_counts.melayu;
        acc.cina += yearData.race_counts.cina;
        acc.india += yearData.race_counts.india;
        acc.lain += yearData.race_counts.lain;
        return acc;
      }, { melayu: 0, cina: 0, india: 0, lain: 0 });
      dataForChart = [totals.melayu, totals.cina, totals.india, totals.lain];
    } else {
      const yearData = yearlyRaceData.find(item => item.birth_year === selectedEthnicityYear);
      if (yearData) {
        const { melayu, cina, india, lain } = yearData.race_counts;
        dataForChart = [melayu, cina, india, lain];
      }
    }
    setEthnicityChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: dataForChart }] }));
  }, [selectedEthnicityYear, yearlyRaceData]);


  return (
    <>
      <Container className="pt-5" fluid>
        {/* ROW 1: MAIN OVERVIEW CHART */}
        <Row>
           <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Gambaran Keseluruhan</h6>
                    <h2 className="mb-0">Jumlah Kelahiran Bayi vs Jumlah Kematian</h2>
                  </div>
                  {/* --- NEW BUTTON --- */}
                  <div className="col text-right">
                    <Button
                      color="primary"
                      onClick={toggleInsightsModal}
                      size="sm"
                    >
                      Analisis Lanjut
                    </Button>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "350px" }}>
                  <Line data={birthDeathChartData} options={{ ...annualOverviewChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ... (Rest of your JSX code for other rows remains the same) ... */}

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS */}
        <Row className="mt-5">
          {/* 5-Year Birth Trend Chart */}
          <Col xl="4" className="mb-5 mb-xl-0">
             <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Trend Tahunan</h6>
                    <h2 className="mb-0">Graf Kelahiran Bayi (5 Tahun)</h2>
                    <div className="mt-2 d-flex flex-wrap">
                      {birthTrendIndicators.map((indicator, index) => {
                        if (typeof indicator.percentage_change === 'undefined') {
                          return (
                            <div key={index} className="d-flex align-items-center mr-3 mb-1">
                                <span className="text-muted mr-1">{indicator.birth_year}:</span>
                                <span className="text-sm font-weight-bold">Data Asas</span>
                            </div>
                          );
                        }
                        const change = indicator.percentage_change;
                        const trendClass = change > 0 ? 'text-success' : change < 0 ? 'text-danger' : 'text-warning';
                        const iconClass = change > 0 ? 'fas fa-arrow-up' : change < 0 ? 'fas fa-arrow-down' : 'fas fa-minus';
                        return (
                          <div key={index} className="d-flex align-items-center mr-3 mb-1">
                            <span className="text-muted mr-1">{indicator.birth_year}:</span>
                            <i className={`${iconClass} ${trendClass} mr-1`}></i>
                            <span className={`${trendClass} text-sm font-weight-bold`}>
                              {Math.abs(change)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Line data={birthTrendChartData} options={{ 
                    ...ageGroupChart.options, 
                    maintainAspectRatio: false,
                    scales: { y: { beginAtZero: false, ticks: { callback: (value) => value.toLocaleString() } } }
                  }} />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Gender Chart */}
          <Col xl="4" className="mb-5 mb-xl-0">
             <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik Bayi</h6>
                    <h2 className="mb-0">Ratio Jantina</h2>
                  </div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} 
                           value={selectedGenderState} 
                           onChange={e => setSelectedGenderState(e.target.value)}>
                      <option value="ALL">Seluruh Malaysia</option>
                      {Object.keys(stateNameMapping).sort().map(prettyName => (
                        <option key={stateNameMapping[prettyName]} value={stateNameMapping[prettyName]}>
                          {prettyName}
                        </option>
                      ))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Pie data={genderChartData} options={{ ...genderDistributionChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Ethnicity Chart */}
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik Bayi</h6>
                    <h2 className="mb-0">Komposisi Kaum</h2>
                  </div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} 
                           value={selectedEthnicityYear} 
                           onChange={e => setSelectedEthnicityYear(e.target.value)}>
                      <option value="ALL">Semua Tahun</option>
                      {availableYears.map(year => (
                        <option key={year} value={year}>
                          Tahun {year}
                        </option>
                      ))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Doughnut data={ethnicityChartData} options={{ ...maritalStatusChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 3: APPLICATION SUMMARY CHARTS */}
        <Row className="mt-5">
          {/* Application Decision Pie Chart */}
          <Col xl="6" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Ringkasan Permohonan</h6>
                <h2 className="mb-0">Jumlah Keputusan Permohonan Pendaftaran Kelahiran Bayi</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Pie data={appDecisionChartData} options={{...genderDistributionChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>

          {/* Rejection Reason Bar Chart */}
          <Col xl="6">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Analisis Penolakan</h6>
                <h2 className="mb-0">Sebab Permohonan Ditolak</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Bar data={rejectionReasonChartData} options={{
                    ...ageGroupChart.options, 
                    maintainAspectRatio: false,
                    scales: { 
                      x: { ticks: { autoSkip: false, maxRotation: 75, minRotation: 45 } },
                      y: { ticks: { stepSize: 1 } } // Ensure y-axis shows whole numbers
                    }
                  }}/>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>


        {/* ROW 4: HEATMAP AND DATA TABLE */}
        <Row className="mt-5">
           <Col xl="7" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="border-0">
                <h3 className="mb-0">Peta Kelahiran Bayi Di Malaysia</h3>
              </CardHeader>
              <CardBody>
                {Object.keys(birthMapData).length > 0 ? (
                  <MapChart data={birthMapData} stateNameMapping={stateNameMapping} />
                ) : (
                  <div className="text-center">Memuatkan data peta...</div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Carta Kelahiran Bayi di Malaysia</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Negeri</th>
                    <th scope="col">Kelahiran</th>
                    <th scope="col">Peratusan</th>
                  </tr>
                </thead>
                <tbody>
                  {birthTableData.length > 0 ? (
                    birthTableData.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" style={{ textTransform: 'capitalize' }}>
                          {item.state.toLowerCase()}
                        </th>
                        <td>{item.births.toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="mr-2">{item.percentage}%</span>
                            <div>
                              <Progress max="100" value={item.percentage} barClassName="bg-gradient-success" />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">Memuatkan data...</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card>
          </Col>
        </Row>
      </Container>
      <ReactTooltip id="map-tooltip" />
      {/* --- RENDER THE MODAL --- */}
      <KelahiranInsightsModal 
        isOpen={isInsightsModalOpen}
        toggle={toggleInsightsModal}
        insights={insightsData}
      />
    </>
  );
};

export default KelahiranBayi;