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

// Hardcoded state birth data for map and table
const hardcodedBirthData = {
  "JOHOR": { total: 85000, percentage: 18.5 },
  "SELANGOR": { total: 92000, percentage: 20.1 },
  "KUALA_LUMPUR": { total: 45000, percentage: 9.8 },
  "PERAK": { total: 38000, percentage: 8.3 },
  "PAHANG": { total: 28000, percentage: 6.1 },
  "KEDAH": { total: 35000, percentage: 7.6 },
  "PULAU_PINANG": { total: 32000, percentage: 7.0 },
  "KELANTAN": { total: 42000, percentage: 9.2 },
  "TERENGGANU": { total: 25000, percentage: 5.5 },
  "NEGERI_SEMBILAN": { total: 22000, percentage: 4.8 },
  "MELAKA": { total: 18000, percentage: 3.9 },
  "PERLIS": { total: 8000, percentage: 1.7 },
  "SABAH": { total: 48000, percentage: 10.5 },
  "SARAWAK": { total: 52000, percentage: 11.4 },
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

// Hardcoded birth weight categories by state
const hardcodedBirthWeightData = {
  "JOHOR": { NORMAL: { total: 70000 }, LOW: { total: 12000 }, VERY_LOW: { total: 2500 }, MACROSOMIA: { total: 500 } },
  "SELANGOR": { NORMAL: { total: 76000 }, LOW: { total: 13000 }, VERY_LOW: { total: 2700 }, MACROSOMIA: { total: 300 } },
  "KUALA_LUMPUR": { NORMAL: { total: 37000 }, LOW: { total: 6500 }, VERY_LOW: { total: 1300 }, MACROSOMIA: { total: 200 } },
  "PERAK": { NORMAL: { total: 31500 }, LOW: { total: 5500 }, VERY_LOW: { total: 900 }, LAIN_LAIN: { total: 100 } },
  "PAHANG": { NORMAL: { total: 23000 }, LOW: { total: 4200 }, VERY_LOW: { total: 700 }, MACROSOMIA: { total: 100 } },
  "KEDAH": { NORMAL: { total: 29000 }, LOW: { total: 5200 }, VERY_LOW: { total: 750 }, MACROSOMIA: { total: 50 } },
  "PULAU_PINANG": { NORMAL: { total: 26500 }, LOW: { total: 4800 }, VERY_LOW: { total: 650 }, MACROSOMIA: { total: 50 } },
  "KELANTAN": { NORMAL: { total: 35000 }, LOW: { total: 6200 }, VERY_LOW: { total: 750 }, MACROSOMIA: { total: 50 } },
  "TERENGGANU": { NORMAL: { total: 20500 }, LOW: { total: 3800 }, VERY_LOW: { total: 650 }, MACROSOMIA: { total: 50 } },
  "NEGERI_SEMBILAN": { NORMAL: { total: 18200 }, LOW: { total: 3200 }, VERY_LOW: { total: 550 }, MACROSOMIA: { total: 50 } },
  "MELAKA": { NORMAL: { total: 14800 }, LOW: { total: 2700 }, VERY_LOW: { total: 450 }, MACROSOMIA: { total: 50 } },
  "PERLIS": { NORMAL: { total: 6600 }, LOW: { total: 1200 }, VERY_LOW: { total: 180 }, MACROSOMIA: { total: 20 } },
  "SABAH": { NORMAL: { total: 39500 }, LOW: { total: 7200 }, VERY_LOW: { total: 1200 }, MACROSOMIA: { total: 100 } },
  "SARAWAK": { NORMAL: { total: 43000 }, LOW: { total: 7800 }, VERY_LOW: { total: 1100 }, MACROSOMIA: { total: 100 } },
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
              const apiName = stateNameMapping[geoJsonName];
              const stateData = data[apiName];
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
  
  // Ethnicity Chart State
  const [selectedEthnicityState, setSelectedEthnicityState] = useState("ALL");
  const [ethnicityChartData, setEthnicityChartData] = useState({
    labels: ["Melayu", "Cina", "India", "Lain-lain"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"], hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"] }],
  });

  // Birth Weight Chart State
  const [selectedWeightState, setSelectedWeightState] = useState("ALL");
  const [birthWeightChartData, setBirthWeightChartData] = useState({
    labels: ["Normal", "Berat Rendah", "Sangat Rendah", "Makrosomia"],
    datasets: [{ label: "Bilangan Kelahiran", data: [0, 0, 0, 0], backgroundColor: "#11cdef" }],
  });

  // --- Initial Data Loading ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    // Set hardcoded birth data for map and table
    setBirthMapData(hardcodedBirthData);
    const formattedTableData = Object.entries(hardcodedBirthData)
      .map(([stateName, data]) => ({ state: stateName.replace(/_/g, " "), births: data.total, percentage: data.percentage }))
      .sort((a, b) => b.births - a.births);
    setBirthTableData(formattedTableData);
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
      const lookupKey = selectedGenderState.replace(/_/g, ' ');
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

  // --- Data Processing for Birth Weight Chart ---
  useEffect(() => {
    let normalTotal = 0, lowTotal = 0, veryLowTotal = 0, macrosomiaTotal = 0;
    if (selectedWeightState === "ALL") {
      Object.values(hardcodedBirthWeightData).forEach(stateData => {
        normalTotal += stateData.NORMAL?.total || 0;
        lowTotal += stateData.LOW?.total || 0;
        veryLowTotal += stateData.VERY_LOW?.total || 0;
        macrosomiaTotal += stateData.MACROSOMIA?.total || 0;
      });
    } else {
      const stateData = hardcodedBirthWeightData[selectedWeightState];
      if (stateData) {
        normalTotal = stateData.NORMAL?.total || 0;
        lowTotal = stateData.LOW?.total || 0;
        veryLowTotal = stateData.VERY_LOW?.total || 0;
        macrosomiaTotal = stateData.MACROSOMIA?.total || 0;
      }
    }
    setBirthWeightChartData(prevData => ({ 
      ...prevData, 
      datasets: [{ ...prevData.datasets[0], data: [normalTotal, lowTotal, veryLowTotal, macrosomiaTotal] }] 
    }));
  }, [selectedWeightState]);

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
          {/* Birth Weight Chart */}
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Statistik Kelahiran</h6>
                    <h2 className="mb-0">Kategori Berat Bayi</h2>
                  </div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} 
                           value={selectedWeightState} 
                           onChange={e => setSelectedWeightState(e.target.value)}>
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
                  <Bar data={birthWeightChartData} options={{ ...ageGroupChart.options, maintainAspectRatio: false }} />
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