// AdminStatistic.js

import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input } from "reactstrap";
import Chart from "chart.js";

// Import configurations and data-fetching logic from our refactored module
import {
  chartOptions,
  parseOptions,
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart, // We'll still use its options for the race chart
  stateNameMapping,
} from "variables/chartAdmin";

import Header from "components/Headers/AdminStatHeader";
import geoData from "../../data/malaysia-states.json";

// --- MOCK DATA (for non-dynamic charts) ---
const annualOverviewData = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Births", data: [490, 510, 485, 530, 550, 540, 565], borderColor: "#2dce89", backgroundColor: "#2dce89", pointBackgroundColor: "#2dce89", pointRadius: 3, pointHoverRadius: 5,
    },
    {
      label: "Deaths", data: [170, 180, 195, 185, 205, 210, 220], borderColor: "#f5365c", backgroundColor: "#f5365c", pointBackgroundColor: "#f5365c", pointRadius: 3, pointHoverRadius: 5,
    },
  ],
};
const ageGroupData = {
  labels: ["0-17", "18-24", "25-39", "40-59", "60+"],
  datasets: [{ label: "Population", data: [8900100, 4500250, 9800500, 6450800, 3218910], backgroundColor: "#11cdef" }],
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
                  data-tooltip-content={stateData ? `${geoJsonName}: ${stateData.total.toLocaleString()} people` : `${geoJsonName}: No data`}
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


// --- MAIN ADMIN STATISTIC COMPONENT ---
const AdminStatistic = (props) => {
  const [populationTableData, setPopulationTableData] = useState([]);
  const [populationMapData, setPopulationMapData] = useState({});

  // Gender Chart State
  const [allGenderStats, setAllGenderStats] = useState(null);
  const [selectedGenderState, setSelectedGenderState] = useState("ALL");
  const [isGenderLoading, setIsGenderLoading] = useState(true);
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    // *** FIX: Initialize with zero data to prevent rendering issues ***
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  // Race Chart State
  const [allRaceStats, setAllRaceStats] = useState(null);
  const [selectedRaceState, setSelectedRaceState] = useState("ALL");
  const [isRaceLoading, setIsRaceLoading] = useState(true);
  const [raceChartData, setRaceChartData] = useState({
    labels: ["Melayu", "Cina", "India", "Lain-lain"],
    // *** FIX: Initialize with zero data to prevent rendering issues ***
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"],
      hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"],
    }],
  });


  // --- Initial Data Fetching ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    // *** FIX: Fetch data in separate, robust try-catch blocks ***
    const fetchPopulationData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/adminstat/citizenPlacement");
        if (response.data.success) {
          const stats = response.data.stats;
          setPopulationMapData(stats);
          const formattedTableData = Object.entries(stats)
            .map(([stateName, data]) => ({ state: stateName.replace(/_/g, " "), population: data.total, percentage: data.percentage }))
            .sort((a, b) => b.population - a.population);
          setPopulationTableData(formattedTableData);
        }
      } catch (error) {
        console.error("Error fetching population data:", error);
      }
    };
    
    const fetchGenderData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/adminstat/stateGender");
        if (response.data.success) {
          setAllGenderStats(response.data.stats);
        }
      } catch (error) {
        console.error("Error fetching gender data:", error);
        setAllGenderStats({}); // Set to empty to stop loading spinner on error
      }
    };

    const fetchRaceData = async () => {
        try {
            const response = await axios.get("http://localhost:5000/adminstat/stateRace");
            if (response.data.success) {
                setAllRaceStats(response.data.stats);
            }
        } catch (error) {
            console.error("Error fetching race data:", error);
            setAllRaceStats({}); // Set to empty to stop loading spinner on error
        }
    };

    fetchPopulationData();
    fetchGenderData();
    fetchRaceData();
  }, []);

  // --- Data Processing for Gender Chart ---
  useEffect(() => {
    if (!allGenderStats) return;
    setIsGenderLoading(true);
    let maleTotal = 0; let femaleTotal = 0;
    if (selectedGenderState === "ALL") {
      Object.values(allGenderStats).forEach(stateData => {
        maleTotal += stateData.LELAKI.total; femaleTotal += stateData.PEREMPUAN.total;
      });
    } else {
      // Keys from gender API use underscores, which matches our dropdown values
      const stateData = allGenderStats[selectedGenderState];
      if (stateData) { maleTotal = stateData.LELAKI.total; femaleTotal = stateData.PEREMPUAN.total; }
    }
    setGenderChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] }));
    setIsGenderLoading(false);
  }, [selectedGenderState, allGenderStats]);

  // --- Data Processing for Race Chart ---
  useEffect(() => {
    if (!allRaceStats) return;
    setIsRaceLoading(true);
    let melayuTotal = 0, cinaTotal = 0, indiaTotal = 0, lainTotal = 0;
    if (selectedRaceState === "ALL") {
      Object.values(allRaceStats).forEach(stateData => {
        melayuTotal += stateData.MELAYU.total; cinaTotal += stateData.CINA.total;
        indiaTotal += stateData.INDIA.total; lainTotal += stateData.LAIN_LAIN.total;
      });
    } else {
      // *** FIX: Keys from race API have spaces, so we convert the dropdown value (with underscores) to match ***
      const lookupKey = selectedRaceState.replace(/_/g, ' ');
      const stateData = allRaceStats[lookupKey];
      if (stateData) {
        melayuTotal = stateData.MELAYU.total; cinaTotal = stateData.CINA.total;
        indiaTotal = stateData.INDIA.total; lainTotal = stateData.LAIN_LAIN.total;
      }
    }
    setRaceChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [melayuTotal, cinaTotal, indiaTotal, lainTotal] }] }));
    setIsRaceLoading(false);
  }, [selectedRaceState, allRaceStats]);


  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {/* ROW 1: MAIN OVERVIEW CHART */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent"><Row className="align-items-center"><div className="col"><h6 className="text-uppercase text-muted ls-1 mb-1">Overview</h6><h2 className="mb-0">Annual Population Dynamics</h2></div></Row></CardHeader>
              <CardBody><div className="chart" style={{ height: "350px" }}><Line data={annualOverviewData} options={{ ...annualOverviewChart.options, maintainAspectRatio: false }} /></div></CardBody>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent"><h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6><h2 className="mb-0">Age Groups</h2></CardHeader>
              <CardBody><div className="chart" style={{ height: "300px" }}><Bar data={ageGroupData} options={{ ...ageGroupChart.options, maintainAspectRatio: false }} /></div></CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Ratio Jantina Di Setiap Negeri</h2></div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedGenderState} onChange={e => setSelectedGenderState(e.target.value)}>
                      <option value="ALL">All Malaysia</option>
                      {Object.keys(stateNameMapping).sort().map(prettyName => (
                        <option key={stateNameMapping[prettyName]} value={stateNameMapping[prettyName]}>{prettyName}</option>
                      ))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {isGenderLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : (
                  <div className="chart" style={{ height: "300px" }}><Pie data={genderChartData} options={{ ...genderDistributionChart.options, maintainAspectRatio: false }} /></div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div className="d-flex justify-content-between align-items-center">
                  <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Komposisi Kaum</h2></div>
                  <div>
                    <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedRaceState} onChange={e => setSelectedRaceState(e.target.value)}>
                      <option value="ALL">All Malaysia</option>
                      {Object.keys(stateNameMapping).sort().map(prettyName => (<option key={stateNameMapping[prettyName]} value={stateNameMapping[prettyName]}>{prettyName}</option>))}
                    </Input>
                  </div>
                </div>
              </CardHeader>
              <CardBody>
                {isRaceLoading ? (<div className="d-flex justify-content-center align-items-center h-100">Loading...</div>) : 
                (<div className="chart" style={{ height: "300px" }}><Doughnut data={raceChartData} options={{ ...maritalStatusChart.options, maintainAspectRatio: false }} /></div>)}
              </CardBody>
            </Card>
          </Col>
        </Row>
        
        {/* ROW 3: HEATMAP AND DATA TABLE */}
        <Row className="mt-5">
          <Col xl="7" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="border-0"><h3 className="mb-0">Peta Kependudukan Di Malaysia</h3></CardHeader>
              <CardBody>
                {Object.keys(populationMapData).length > 0 ? (<MapChart data={populationMapData} stateNameMapping={stateNameMapping} />) : (<div className="text-center">Loading map data...</div>)}
              </CardBody>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0"><h3 className="mb-0">Carta Kependudukan di Malaysia</h3></CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light"><tr><th scope="col">Negeri</th><th scope="col">Populasi</th><th scope="col">Peratusan</th></tr></thead>
                <tbody>
                  {populationTableData.length > 0 ? (populationTableData.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" style={{ textTransform: 'capitalize' }}>{item.state.toLowerCase()}</th>
                        <td>{item.population.toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center"><span className="mr-2">{item.percentage}%</span>
                            <div><Progress max="100" value={item.percentage} barClassName="bg-gradient-primary" /></div>
                          </div>
                        </td>
                      </tr>))) : 
                      (<tr><td colSpan="3" className="text-center">Loading data...</td></tr>)}
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

export default AdminStatistic;