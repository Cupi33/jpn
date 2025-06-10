// AdminStatisticNewborn.js

import { useEffect, useState } from "react";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input } from "reactstrap";
import Chart from "chart.js";

// Import configurations from chartAdmin2.js
import {
  chartOptions,
  parseOptions,
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart,
} from "variables/chartAdmin2";

import Header from "components/Headers/AdminStatHeader";
import geoData from "../../data/malaysia-states.json";

// --- HARDCODED DATA FOR NEWBORN STATISTICS ---

// State name mapping for newborn data
const stateNameMapping = {
  "Johor": "JOHOR", "Kedah": "KEDAH", "Kelantan": "KELANTAN", "Kuala Lumpur": "KUALA_LUMPUR",
  "Melaka": "MELAKA", "Negeri Sembilan": "NEGERI_SEMBILAN", "Pahang": "PAHANG",
  "Perak": "PERAK", "Perlis": "PERLIS", "Pulau Pinang": "PULAU_PINANG", 
  "Sabah": "SABAH", "Sarawak": "SARAWAK", "Selangor": "SELANGOR", "Terengganu": "TERENGGANU",
};

// Annual newborn overview data
const annualNewbornOverviewData = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Kelahiran Bayi", 
      data: [485000, 495000, 470000, 510000, 525000, 515000, 540000], 
      borderColor: "#2dce89", 
      backgroundColor: "#2dce89", 
      pointBackgroundColor: "#2dce89", 
      pointRadius: 3, 
      pointHoverRadius: 5,
    },
    {
      label: "Kelahiran Prematur", 
      data: [48500, 49500, 47000, 51000, 52500, 51500, 54000], 
      borderColor: "#fb6340", 
      backgroundColor: "#fb6340", 
      pointBackgroundColor: "#fb6340", 
      pointRadius: 3, 
      pointHoverRadius: 5,
    },
  ],
};

// Hardcoded 5-year birth data by state (2020-2024)
const hardcodedFiveYearBirthData = {
  "JOHOR": [82000, 83500, 84000, 84500, 85000],
  "SELANGOR": [90000, 91000, 91500, 92000, 92000],
  "KUALA_LUMPUR": [43000, 44000, 44500, 45000, 45000],
  "PERAK": [36000, 37000, 37500, 38000, 38000],
  "PAHANG": [26000, 27000, 27500, 28000, 28000],
  "KEDAH": [33000, 34000, 34500, 35000, 35000],
  "PULAU_PINANG": [30000, 31000, 31500, 32000, 32000],
  "KELANTAN": [40000, 41000, 41500, 42000, 42000],
  "TERENGGANU": [23000, 24000, 24500, 25000, 25000],
  "NEGERI_SEMBILAN": [20000, 21000, 21500, 22000, 22000],
  "MELAKA": [16000, 17000, 17500, 18000, 18000],
  "PERLIS": [7000, 7500, 7800, 8000, 8000],
  "SABAH": [46000, 47000, 47500, 48000, 48000],
  "SARAWAK": [50000, 51000, 51500, 52000, 52000],
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

// Hardcoded ethnicity distribution by state
const hardcodedEthnicityData = {
  "JOHOR": { MELAYU: { total: 45000 }, CINA: { total: 25000 }, INDIA: { total: 12000 }, LAIN_LAIN: { total: 3000 } },
  "SELANGOR": { MELAYU: { total: 48000 }, CINA: { total: 28000 }, INDIA: { total: 13000 }, LAIN_LAIN: { total: 3000 } },
  "KUALA_LUMPUR": { MELAYU: { total: 18000 }, CINA: { total: 15000 }, INDIA: { total: 8000 }, LAIN_LAIN: { total: 4000 } },
  "PERAK": { MELAYU: { total: 22000 }, CINA: { total: 10000 }, INDIA: { total: 4500 }, LAIN_LAIN: { total: 1500 } },
  "PAHANG": { MELAYU: { total: 24000 }, CINA: { total: 2800 }, INDIA: { total: 1000 }, LAIN_LAIN: { total: 200 } },
  "KEDAH": { MELAYU: { total: 30000 }, CINA: { total: 3500 }, INDIA: { total: 1200 }, LAIN_LAIN: { total: 300 } },
  "PULAU_PINANG": { MELAYU: { total: 16000 }, CINA: { total: 12000 }, INDIA: { total: 3500 }, LAIN_LAIN: { total: 500 } },
  "KELANTAN": { MELAYU: { total: 40000 }, CINA: { total: 1500 }, INDIA: { total: 400 }, LAIN_LAIN: { total: 100 } },
  "TERENGGANU": { MELAYU: { total: 23500 }, CINA: { total: 1200 }, INDIA: { total: 250 }, LAIN_LAIN: { total: 50 } },
  "NEGERI_SEMBILAN": { MELAYU: { total: 14000 }, CINA: { total: 5000 }, INDIA: { total: 2500 }, LAIN_LAIN: { total: 500 } },
  "MELAKA": { MELAYU: { total: 11000 }, CINA: { total: 4500 }, INDIA: { total: 2000 }, LAIN_LAIN: { total: 500 } },
  "PERLIS": { MELAYU: { total: 7500 }, CINA: { total: 400 }, INDIA: { total: 80 }, LAIN_LAIN: { total: 20 } },
  "SABAH": { MELAYU: { total: 15000 }, CINA: { total: 8000 }, INDIA: { total: 2000 }, LAIN_LAIN: { total: 23000 } },
  "SARAWAK": { MELAYU: { total: 18000 }, CINA: { total: 15000 }, INDIA: { total: 1500 }, LAIN_LAIN: { total: 17500 } },
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

// --- HELPER FUNCTION TO CALCULATE TREND ---
const calculateTrend = (data) => {
  if (data.length < 2) return { trend: 'stable', percentage: 0 };
  
  const latest = data[data.length - 1];
  const previous = data[data.length - 2];
  const change = ((latest - previous) / previous) * 100;
  
  if (change > 0) {
    return { trend: 'increase', percentage: change.toFixed(1) };
  } else if (change < 0) {
    return { trend: 'decrease', percentage: Math.abs(change).toFixed(1) };
  } else {
    return { trend: 'stable', percentage: 0 };
  }
};

// --- MAIN ADMIN STATISTIC NEWBORN COMPONENT ---
const AdminStatisticNewborn = (props) => {
  const [birthTableData, setBirthTableData] = useState([]);
  const [birthMapData, setBirthMapData] = useState({});

  // Gender Chart State
  const [selectedGenderState, setSelectedGenderState] = useState("ALL");
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  // Ethnicity Chart State
  const [selectedEthnicityState, setSelectedEthnicityState] = useState("ALL");
  const [ethnicityChartData, setEthnicityChartData] = useState({
    labels: ["Melayu", "Cina", "India", "Lain-lain"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"], hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"] }],
  });

  // 5-Year Birth Trend Chart State
  const [selectedBirthTrendState, setSelectedBirthTrendState] = useState("ALL");
  const [birthTrendChartData, setBirthTrendChartData] = useState({
    labels: ["2020", "2021", "2022", "2023", "2024"],
    datasets: [{ 
      label: "Kelahiran Bayi", 
      data: [0, 0, 0, 0, 0], 
      backgroundColor: "#11cdef",
      borderColor: "#11cdef",
      borderWidth: 2,
      fill: false
    }],
  });
  const [birthTrendIndicator, setBirthTrendIndicator] = useState({ trend: 'stable', percentage: 0 });

  // --- Initial Data Loading ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    // Fetch data from the API
    const fetchBirthData = async () => {
      try {
        const response = await fetch("http://localhost:5000/newbornStat/newbornState");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const apiData = await response.json();

        if (apiData.success && apiData.stats) {
          const processedMapData = {};
          for (const stateKey in apiData.stats) {
            const mapKey = stateKey.replace(/ /g, "_");
            processedMapData[mapKey] = {
              total: apiData.stats[stateKey].total_population,
              percentage: apiData.stats[stateKey].percentage
            };
          }
          setBirthMapData(processedMapData);

          const formattedTableData = Object.entries(apiData.stats)
            .map(([stateName, data]) => ({
              state: stateName,
              births: data.total_population,
              percentage: data.percentage
            }))
            .sort((a, b) => b.births - a.births);
          setBirthTableData(formattedTableData);
        } else {
          console.error("API call was not successful or stats data is missing:", apiData.message);
        }
      } catch (error) {
        console.error("Failed to fetch newborn statistics:", error);
      }
    };

    fetchBirthData();
  }, []);

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
    setGenderChartData(prevData => ({ 
      ...prevData, 
      datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] 
    }));
  }, [selectedGenderState]);

  // --- Data Processing for Ethnicity Chart ---
  useEffect(() => {
    let melayuTotal = 0, cinaTotal = 0, indiaTotal = 0, lainTotal = 0;
    if (selectedEthnicityState === "ALL") {
      Object.values(hardcodedEthnicityData).forEach(stateData => { 
        melayuTotal += stateData.MELAYU.total; 
        cinaTotal += stateData.CINA.total; 
        indiaTotal += stateData.INDIA.total; 
        lainTotal += stateData.LAIN_LAIN.total; 
      });
    } else {
      const stateData = hardcodedEthnicityData[selectedEthnicityState];
      if (stateData) { 
        melayuTotal = stateData.MELAYU.total; 
        cinaTotal = stateData.CINA.total; 
        indiaTotal = stateData.INDIA.total; 
        lainTotal = stateData.LAIN_LAIN.total; 
      }
    }
    setEthnicityChartData(prevData => ({ 
      ...prevData, 
      datasets: [{ ...prevData.datasets[0], data: [melayuTotal, cinaTotal, indiaTotal, lainTotal] }] 
    }));
  }, [selectedEthnicityState]);

  // --- Data Processing for 5-Year Birth Trend Chart ---
  useEffect(() => {
    let trendData = [0, 0, 0, 0, 0];
    
    if (selectedBirthTrendState === "ALL") {
      // Sum all states for each year
      for (let yearIndex = 0; yearIndex < 5; yearIndex++) {
        Object.values(hardcodedFiveYearBirthData).forEach(stateData => {
          trendData[yearIndex] += stateData[yearIndex];
        });
      }
    } else {
      const stateData = hardcodedFiveYearBirthData[selectedBirthTrendState];
      if (stateData) {
        trendData = [...stateData];
      }
    }
    
    setBirthTrendChartData(prevData => ({ 
      ...prevData, 
      datasets: [{ ...prevData.datasets[0], data: trendData }] 
    }));
    
    // Calculate trend indicator
    const trendInfo = calculateTrend(trendData);
    setBirthTrendIndicator(trendInfo);
  }, [selectedBirthTrendState]);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {/* ROW 1: MAIN OVERVIEW CHART */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Gambaran Keseluruhan</h6>
                    <h2 className="mb-0">Statistik Kelahiran Bayi Tahunan</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "350px" }}>
                  <Line data={annualNewbornOverviewData} options={{ ...annualOverviewChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS */}
        <Row className="mt-5">
          {/* 5-Year Birth Trend Chart */}
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Trend Kelahiran</h6>
                    <h2 className="mb-0">Graf Kelahiran Bayi (5 Tahun)</h2>
                    {/* Trend Indicator */}
                    <div className="mt-2">
                      {birthTrendIndicator.trend === 'increase' && (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-arrow-up text-success mr-1"></i>
                          <span className="text-success text-sm font-weight-bold">
                            Naik {birthTrendIndicator.percentage}%
                          </span>
                        </div>
                      )}
                      {birthTrendIndicator.trend === 'decrease' && (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-arrow-down text-danger mr-1"></i>
                          <span className="text-danger text-sm font-weight-bold">
                            Turun {birthTrendIndicator.percentage}%
                          </span>
                        </div>
                      )}
                      {birthTrendIndicator.trend === 'stable' && (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-minus text-warning mr-1"></i>
                          <span className="text-warning text-sm font-weight-bold">
                            Stabil
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} 
                           value={selectedBirthTrendState} 
                           onChange={e => setSelectedBirthTrendState(e.target.value)}>
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
                  <Line data={birthTrendChartData} options={{ 
                    ...ageGroupChart.options, 
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          callback: function(value) {
                            return value.toLocaleString();
                          }
                        }
                      }
                    }
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
                           value={selectedEthnicityState} 
                           onChange={e => setSelectedEthnicityState(e.target.value)}>
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
                  <Doughnut data={ethnicityChartData} options={{ ...maritalStatusChart.options, maintainAspectRatio: false }} />
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 3: HEATMAP AND DATA TABLE */}
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
    </>
  );
};

export default AdminStatisticNewborn;