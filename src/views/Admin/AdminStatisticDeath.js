// AdminStatisticDeath.js

import { useEffect, useState } from "react";
import axios from "axios"; // <-- IMPORTED axios for API calls
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input } from "reactstrap";
import Chart from "chart.js";

// Import configurations from our NEW chart configuration file
import {
  chartOptions,
  parseOptions,
  annualDeathsChart,
  deathsByGenderChart,
  deathsByAgeGroupChart,
  deathsByCauseChart,
  stateNameMapping,
} from "variables/chartAdmin3"; // <-- IMPORTANT: Using new chart file

import Header from "components/Headers/AdminStatHeader"; // Assuming a generic header can be reused
import geoData from "../../data/malaysia-states.json";

// --- MOCK / HARDCODED DATA (for charts not covered by the new API) ---

// 1. Annual Deaths (Line Chart)
const annualDeathsData = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Deaths", data: [170, 180, 195, 225, 205, 210, 220], borderColor: "#f5365c", backgroundColor: "#f5365c", pointBackgroundColor: "#f5365c", pointRadius: 3, pointHoverRadius: 5,
    },
  ],
};

// 2. Deaths by State (Map & Table) - THIS IS NOW FETCHED FROM API
// const allDeathsByState = { ... }; // <-- REMOVED

// 3. Deaths by Gender, per State
const allDeathsByGender = {
  "JOHOR": { "LELAKI": { total: 8000 }, "PEREMPUAN": { total: 7200 } },
  "SELANGOR": { "LELAKI": { total: 15000 }, "PEREMPUAN": { total: 13900 } },
  "PERAK": { "LELAKI": { total: 9500 }, "PEREMPUAN": { total: 9000 } },
  "KEDAH": { "LELAKI": { total: 6000 }, "PEREMPUAN": { total: 5500 } },
};

// 4. Deaths by Age Group, per State
const allDeathsByAgeGroup = {
  "JOHOR": { "AGE_0_17": { total: 500 }, "AGE_18_39": { total: 1200 }, "AGE_40_59": { total: 4500 }, "AGE_60_PLUS": { total: 9000 } },
  "SELANGOR": { "AGE_0_17": { total: 900 }, "AGE_18_39": { total: 2500 }, "AGE_40_59": { total: 9500 }, "AGE_60_PLUS": { total: 16000 } },
  "PERAK": { "AGE_0_17": { total: 600 }, "AGE_18_39": { total: 1500 }, "AGE_40_59": { total: 6000 }, "AGE_60_PLUS": { total: 10400 } },
};

// 5. Deaths by Cause, per State
const allDeathsByCause = {
  "JOHOR": { "HEART_DISEASE": { total: 4000 }, "CANCER": { total: 2500 }, "PNEUMONIA": { total: 1500 }, "OTHERS": { total: 7200 } },
  "SELANGOR": { "HEART_DISEASE": { total: 8000 }, "CANCER": { total: 5000 }, "PNEUMONIA": { total: 3000 }, "OTHERS": { total: 12900 } },
};


// --- MAP COMPONENT (No changes needed here) ---
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
              const apiName = stateNameMapping[geoJsonName]; // e.g., "Kuala Lumpur" -> "KUALA_LUMPUR"
              const stateData = data[apiName]; // Looks for data['KUALA_LUMPUR']
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
const AdminStatisticDeath = (props) => {
  // NEW State for Map/Table data fetched from API
  const [deathTableData, setDeathTableData] = useState([]);
  const [deathMapData, setDeathMapData] = useState({});
  const [isMapDataLoading, setIsMapDataLoading] = useState(true);

  // State for other charts (using hardcoded data)
  const [selectedGenderState, setSelectedGenderState] = useState("ALL");
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  const [selectedAgeGroupState, setSelectedAgeGroupState] = useState("ALL");
  const [ageGroupChartData, setAgeGroupChartData] = useState({
    labels: ["0-17", "18-39", "40-59", "60+"],
    datasets: [{ label: "Deaths", data: [0, 0, 0, 0], backgroundColor: "#11cdef" }],
  });

  const [selectedCauseState, setSelectedCauseState] = useState("ALL");
  const [causeChartData, setCauseChartData] = useState({
    labels: ["Heart Disease", "Cancer", "Pneumonia", "Others"],
    datasets: [{ data: [0, 0, 0, 0], backgroundColor: ["#f5365c", "#fb6340", "#ffd600", "#adb5bd"] }],
  });


  // --- Data Fetching and Processing ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    // NEW: Function to fetch data for Map and Table
    const fetchDeathStateData = async () => {
      setIsMapDataLoading(true);
      try {
        const response = await axios.get("http://localhost:5000/deathStat/deathState");
        if (response.data && response.data.success) {
          const stats = response.data.stats;

          // 1. Format data for the Table
          const formattedTableData = Object.entries(stats)
            .map(([stateName, data]) => ({
              state: stateName, // API provides names like "KUALA LUMPUR"
              population: data.total_death,
              percentage: data.percentage,
            }))
            .sort((a, b) => b.population - a.population);
          setDeathTableData(formattedTableData);

          // 2. Format data for the Map
          const formattedMapData = {};
          for (const [stateName, data] of Object.entries(stats)) {
            // Convert API key "KUALA LUMPUR" to "KUALA_LUMPUR" to match stateNameMapping
            const mapKey = stateName.replace(/ /g, '_').toUpperCase();
            formattedMapData[mapKey] = {
              total: data.total_death, // MapChart expects 'total'
              percentage: data.percentage
            };
          }
          setDeathMapData(formattedMapData);
        }
      } catch (error) {
        console.error("Error fetching death by state data:", error);
        // Set to empty to avoid crashing the app
        setDeathTableData([]);
        setDeathMapData({});
      } finally {
        setIsMapDataLoading(false);
      }
    };

    fetchDeathStateData(); // Call the fetch function
  }, []); // Empty dependency array means this runs once on mount

  // --- Data Processing for Gender Chart ---
  useEffect(() => {
    let maleTotal = 0; let femaleTotal = 0;
    if (selectedGenderState === "ALL") {
      Object.values(allDeathsByGender).forEach(stateData => { maleTotal += stateData.LELAKI.total; femaleTotal += stateData.PEREMPUAN.total; });
    } else {
      const stateData = allDeathsByGender[selectedGenderState];
      if (stateData) { maleTotal = stateData.LELAKI.total; femaleTotal = stateData.PEREMPUAN.total; }
    }
    setGenderChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] }));
  }, [selectedGenderState]);

  // --- Data Processing for Age Group Chart ---
  useEffect(() => {
    let age0_17 = 0, age18_39 = 0, age40_59 = 0, age60_plus = 0;
    if (selectedAgeGroupState === "ALL") {
      Object.values(allDeathsByAgeGroup).forEach(stateData => {
        age0_17 += stateData.AGE_0_17.total; age18_39 += stateData.AGE_18_39.total; age40_59 += stateData.AGE_40_59.total; age60_plus += stateData.AGE_60_PLUS.total;
      });
    } else {
      const stateData = allDeathsByAgeGroup[selectedAgeGroupState];
      if (stateData) {
        age0_17 = stateData.AGE_0_17.total; age18_39 = stateData.AGE_18_39.total; age40_59 = stateData.AGE_40_59.total; age60_plus = stateData.AGE_60_PLUS.total;
      }
    }
    setAgeGroupChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [age0_17, age18_39, age40_59, age60_plus] }] }));
  }, [selectedAgeGroupState]);
  
  // --- Data Processing for Cause of Death Chart ---
  useEffect(() => {
    let heart = 0, cancer = 0, pneumonia = 0, others = 0;
    if (selectedCauseState === "ALL") {
        Object.values(allDeathsByCause).forEach(stateData => {
            heart += stateData.HEART_DISEASE.total; cancer += stateData.CANCER.total; pneumonia += stateData.PNEUMONIA.total; others += stateData.OTHERS.total;
        });
    } else {
        const stateData = allDeathsByCause[selectedCauseState];
        if (stateData) {
            heart = stateData.HEART_DISEASE.total; cancer = stateData.CANCER.total; pneumonia = stateData.PNEUMONIA.total; others = stateData.OTHERS.total;
        }
    }
    setCauseChartData(prevData => ({ ...prevData, datasets: [{...prevData.datasets[0], data: [heart, cancer, pneumonia, others]}]}));
  }, [selectedCauseState]);


  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {/* ROW 1: ANNUAL DEATHS CHART */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent"><Row className="align-items-center"><div className="col"><h6 className="text-uppercase text-muted ls-1 mb-1">Gambaran Keseluruhan</h6><h2 className="mb-0">Statistik Kematian Tahunan</h2></div></Row></CardHeader>
              <CardBody><div className="chart" style={{ height: "350px" }}><Line data={annualDeathsData} options={{ ...annualDeathsChart.options, maintainAspectRatio: false }} /></div></CardBody>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Kematian Mengikut Umur</h2></div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedAgeGroupState} onChange={e => setSelectedAgeGroupState(e.target.value)}>
                      <option value="ALL">All Malaysia</option>
                      {Object.keys(allDeathsByAgeGroup).sort().map(stateKey => (<option key={stateKey} value={stateKey}>{stateKey.replace(/_/g, " ")}</option>))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}><Bar data={ageGroupChartData} options={{ ...deathsByAgeGroupChart.options, maintainAspectRatio: false }} /></div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Kematian Mengikut Jantina</h2></div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedGenderState} onChange={e => setSelectedGenderState(e.target.value)}>
                      <option value="ALL">All Malaysia</option>
                      {Object.keys(allDeathsByGender).sort().map(stateKey => (<option key={stateKey} value={stateKey}>{stateKey.replace(/_/g, " ")}</option>))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}><Pie data={genderChartData} options={{ ...deathsByGenderChart.options, maintainAspectRatio: false }} /></div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-uppercase text-muted ls-1 mb-1">Faktor</h6><h2 className="mb-0">Punca Kematian</h2></div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedCauseState} onChange={e => setSelectedCauseState(e.target.value)}>
                      <option value="ALL">All Malaysia</option>
                      {Object.keys(allDeathsByCause).sort().map(stateKey => (<option key={stateKey} value={stateKey}>{stateKey.replace(/_/g, " ")}</option>))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}><Doughnut data={causeChartData} options={{ ...deathsByCauseChart.options, maintainAspectRatio: false }} /></div>
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 3: HEATMAP AND DATA TABLE - UPDATED WITH API DATA */}
        <Row className="mt-5">
          <Col xl="7" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="border-0"><h3 className="mb-0">Peta Taburan Kematian Di Malaysia</h3></CardHeader>
              <CardBody>
                 {isMapDataLoading ? (
                   <div className="text-center">Loading map data...</div>
                 ) : (
                   <MapChart data={deathMapData} stateNameMapping={stateNameMapping} />
                 )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0"><h3 className="mb-0">Jadual Kematian Mengikut Negeri</h3></CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light"><tr><th scope="col">Negeri</th><th scope="col">Jumlah Kematian</th><th scope="col">Peratusan</th></tr></thead>
                <tbody>
                  {isMapDataLoading ? (
                    <tr><td colSpan="3" className="text-center">Loading data...</td></tr>
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
      <ReactTooltip id="map-tooltip" />
    </>
  );
};

export default AdminStatisticDeath;