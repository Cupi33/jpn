// AdminStatisticNewborn.js

import { useEffect, useState } from "react";
import { Line, Pie,  Doughnut } from "react-chartjs-2";
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

// State name mapping for newborn data
const stateNameMapping = {
  "Johor": "JOHOR", "Kedah": "KEDAH", "Kelantan": "KELANTAN", "Kuala Lumpur": "KUALA_LUMPUR",
  "Melaka": "MELAKA", "Negeri Sembilan": "NEGERI_SEMBILAN", "Pahang": "PAHANG",
  "Perak": "PERAK", "Perlis": "PERLIS", "Pulau Pinang": "PULAU_PINANG", 
  "Sabah": "SABAH", "Sarawak": "SARAWAK", "Selangor": "SELANGOR", "Terengganu": "TERENGGANU",
};

// Annual newborn overview data (can also be fetched from an API if available)
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
  
  // --- MODIFIED: States for Ethnicity Chart ---
  const [yearlyRaceData, setYearlyRaceData] = useState([]); // To store API data (array)
  const [availableYears, setAvailableYears] = useState([]); // To store years from API for dropdown
  const [selectedEthnicityYear, setSelectedEthnicityYear] = useState("ALL"); // For the dropdown
  const [ethnicityChartData, setEthnicityChartData] = useState({
    labels: ["Melayu", "Cina", "India", "Lain-lain"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"], hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"] }],
  });

  // States for the 5-year trend chart
  const [birthTrendChartData, setBirthTrendChartData] = useState({
    labels: [],
    datasets: [{ 
      label: "Kelahiran Bayi", 
      data: [],
      backgroundColor: "#11cdef",
      borderColor: "#11cdef",
      borderWidth: 2,
      fill: false
    }],
  });
  const [birthTrendIndicators, setBirthTrendIndicators] = useState([]);

  // --- Initial Data Loading ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    const fetchAllData = async () => {
      try {
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

        // Fetch 5-year trend data
        const trendResponse = await fetch("http://localhost:5000/newbornStat/newbornTotal5year");
        const trendApiData = await trendResponse.json();
        if (trendApiData.success && trendApiData.stats) {
          setBirthTrendChartData(prev => ({
            ...prev,
            labels: trendApiData.stats.map(item => item.birth_year),
            datasets: [{ ...prev.datasets[0], data: trendApiData.stats.map(item => item.total_newborn) }]
          }));
          setBirthTrendIndicators(trendApiData.stats);
        }

        // --- MODIFIED: Fetch yearly ethnicity data from the new endpoint ---
        const ethnicityResponse = await fetch("http://localhost:5000/newbornStat/newbornTotal5yearRace");
        const ethnicityApiData = await ethnicityResponse.json();
        if (ethnicityApiData.success && ethnicityApiData.stats) {
          setYearlyRaceData(ethnicityApiData.stats); // Store the array of yearly data
          
          // Dynamically populate the years dropdown from the API response
          const years = ethnicityApiData.stats.map(item => item.birth_year).sort((a, b) => b - a); // Newest first
          setAvailableYears(years);
        }

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchAllData();
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

  // --- MODIFIED: Data Processing for Ethnicity Chart based on Year and new API structure ---
  useEffect(() => {
    if (yearlyRaceData.length === 0) return; // Don't run if data isn't loaded

    let dataForChart = [0, 0, 0, 0];

    if (selectedEthnicityYear === "ALL") {
      // Sum up all years if 'ALL' is selected
      const totals = yearlyRaceData.reduce((acc, yearData) => {
        acc.melayu += yearData.race_counts.melayu;
        acc.cina += yearData.race_counts.cina;
        acc.india += yearData.race_counts.india;
        acc.lain += yearData.race_counts.lain;
        return acc;
      }, { melayu: 0, cina: 0, india: 0, lain: 0 });
      
      dataForChart = [totals.melayu, totals.cina, totals.india, totals.lain];

    } else {
      // Find the data for the specific selected year
      const yearData = yearlyRaceData.find(item => item.birth_year === selectedEthnicityYear);
      if (yearData) {
        const { melayu, cina, india, lain } = yearData.race_counts;
        dataForChart = [melayu, cina, india, lain];
      }
    }

    setEthnicityChartData(prevData => ({ 
      ...prevData, 
      datasets: [{ ...prevData.datasets[0], data: dataForChart }] 
    }));
  }, [selectedEthnicityYear, yearlyRaceData]); // Re-run when year changes or data arrives


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

          {/* --- MODIFIED: Ethnicity Chart with Year Dropdown populated from API --- */}
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