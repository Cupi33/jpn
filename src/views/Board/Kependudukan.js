import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input, CardTitle } from "reactstrap";
import Chart from "chart.js";

// Import configurations and data-fetching logic
import {
  chartOptions,
  parseOptions,
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart,
  stateNameMapping,
} from "variables/chartAdmin";

import geoData from "../../data/malaysia-states.json";

// --- MAP COMPONENT with Zoom/Pan (Unchanged) ---
const MapChart = ({ data, stateNameMapping }) => {
    // ... (This component's code remains the same as in your file)
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

// --- MAIN KEPENDUDUKAN COMPONENT ---
const Kependudukan = (props) => {
  // Existing state
  const [populationTableData, setPopulationTableData] = useState([]);
  const [populationMapData, setPopulationMapData] = useState({});
  const [allGenderStats, setAllGenderStats] = useState(null);
  const [selectedGenderState, setSelectedGenderState] = useState("ALL");
  const [isGenderLoading, setIsGenderLoading] = useState(true);
  const [genderChartData, setGenderChartData] = useState({ labels: [], datasets: [] });
  const [allRaceStats, setAllRaceStats] = useState(null);
  const [selectedRaceState, setSelectedRaceState] = useState("ALL");
  const [isRaceLoading, setIsRaceLoading] = useState(true);
  const [raceChartData, setRaceChartData] = useState({ labels: [], datasets: [] });
  const [allAgeGroupStats, setAllAgeGroupStats] = useState(null);
  const [selectedAgeGroupState, setSelectedAgeGroupState] = useState("ALL");
  const [isAgeGroupLoading, setIsAgeGroupLoading] = useState(true);
  const [ageGroupChartData, setAgeGroupChartData] = useState({ labels: [], datasets: [] });

  // --- NEW: State for Population Projection Chart ---
  const [projectionDataSource, setProjectionDataSource] = useState([]);
  const [selectedProjectionState, setSelectedProjectionState] = useState("ALL");
  const [isProjectionLoading, setIsProjectionLoading] = useState(true);
  const [projectionChartData, setProjectionChartData] = useState({ labels: [], datasets: [] });
  const [projectedAverageAge, setProjectedAverageAge] = useState(null);


  // --- Initial Data Fetching ---
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    const fetchAllData = async () => {
      // Set all loading states to true initially
      setIsProjectionLoading(true);
      setIsGenderLoading(true);
      setIsRaceLoading(true);
      setIsAgeGroupLoading(true);
      
      try {
        const [popResponse, genderResponse, raceResponse, ageResponse, projectionResponse] = await Promise.all([
          axios.get("http://localhost:5000/adminstat/citizenPlacement"),
          axios.get("http://localhost:5000/adminstat/stateGender"),
          axios.get("http://localhost:5000/adminstat/stateRace"),
          axios.get("http://localhost:5000/adminstat/stateGroupAge"),
          axios.get("http://localhost:5000/board/kependudukan10tahun") // New API call
        ]);

        // Population data for map, table, and projection base
        if (popResponse.data.success) {
          const stats = popResponse.data.stats;
          setPopulationMapData(stats);
          const formattedTableData = Object.entries(stats)
            .map(([stateName, data]) => ({ state: stateName.replace(/_/g, " "), population: data.total, percentage: data.percentage }))
            .sort((a, b) => b.population - a.population);
          setPopulationTableData(formattedTableData);
        }

        // Projection data source
        if (projectionResponse.data.success) {
            setProjectionDataSource(projectionResponse.data.stats);
        }

        // Other chart data
        if (genderResponse.data.success) setAllGenderStats(genderResponse.data.stats);
        if (raceResponse.data.success) setAllRaceStats(raceResponse.data.stats);
        if (ageResponse.data.success) setAllAgeGroupStats(ageResponse.data.stats);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchAllData();
  }, []);

  // --- NEW: Data Processing for 10-Year Projection Chart ---
  useEffect(() => {
    // Wait until both data sources are available
    if (projectionDataSource.length === 0 || populationTableData.length === 0) {
      return;
    }
    setIsProjectionLoading(true);

    let currentPopulation = 0;
    let totalNewborns_5y = 0;
    let totalDeaths_5y = 0;
    let currentAverageAge = 0;

    if (selectedProjectionState === "ALL") {
      // Aggregate data for all of Malaysia
      currentPopulation = populationTableData.reduce((sum, state) => sum + state.population, 0);
      totalNewborns_5y = projectionDataSource.reduce((sum, state) => sum + state.total_newborn, 0);
      totalDeaths_5y = projectionDataSource.reduce((sum, state) => sum + state.total_death, 0);
      
      // Calculate weighted average age for All Malaysia
      const totalWeightedAge = projectionDataSource.reduce((sum, stateData) => {
        const stateName = stateData.state.replace(/_/g, ' ').toUpperCase();
        const popData = populationTableData.find(p => p.state.toUpperCase() === stateName);
        const statePopulation = popData ? popData.population : 0;
        return sum + (stateData.avg_age * statePopulation);
      }, 0);

      currentAverageAge = totalWeightedAge / currentPopulation;

    } else {
      // Find data for the selected state
      const stateTrendData = projectionDataSource.find(s => s.state === selectedProjectionState);
      const statePopulationData = populationTableData.find(s => s.state.toUpperCase() === selectedProjectionState);

      if (stateTrendData && statePopulationData) {
        currentPopulation = statePopulationData.population;
        totalNewborns_5y = stateTrendData.total_newborn;
        totalDeaths_5y = stateTrendData.total_death;
        currentAverageAge = stateTrendData.avg_age;
      }
    }

    // Perform the projection calculation
    const annualAvgNewborns = totalNewborns_5y / 5;
    const annualAvgDeaths = totalDeaths_5y / 5;
    const annualChange = annualAvgNewborns - annualAvgDeaths;

    const futureLabels = [];
    const futureDataPoints = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= 10; i++) {
      futureLabels.push(currentYear + i);
      const projectedPop = currentPopulation + (annualChange * i);
      futureDataPoints.push(Math.round(projectedPop));
    }
    
    // Set state for the chart and the average age card
    setProjectionChartData({
      labels: futureLabels,
      datasets: [{
        label: "Jangkaan Populasi",
        data: futureDataPoints,
        borderColor: "#5e72e4",
        backgroundColor: "transparent",
      }]
    });
    setProjectedAverageAge(currentAverageAge + 10);
    setIsProjectionLoading(false);

  }, [selectedProjectionState, projectionDataSource, populationTableData]);

  // ... (useEffect hooks for Gender, Race, and Age Group charts remain unchanged)
  // --- Data Processing for Gender Chart ---
  useEffect(() => {
    if (!allGenderStats) return;
    setIsGenderLoading(true);
    let maleTotal = 0; let femaleTotal = 0;
    if (selectedGenderState === "ALL") {
      Object.values(allGenderStats).forEach(stateData => { maleTotal += stateData.LELAKI.total; femaleTotal += stateData.PEREMPUAN.total; });
    } else {
      const lookupKey = selectedGenderState.replace(/_/g, ' ');
      const stateData = allGenderStats[lookupKey];
      if (stateData) { maleTotal = stateData.LELAKI.total; femaleTotal = stateData.PEREMPUAN.total; }
    }
    setGenderChartData({
        labels: ["Lelaki", "Perempuan"],
        datasets: [{ data: [maleTotal, femaleTotal], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
    });
    setIsGenderLoading(false);
  }, [selectedGenderState, allGenderStats]);

  // --- Data Processing for Race Chart ---
  useEffect(() => {
    if (!allRaceStats) return;
    setIsRaceLoading(true);
    let melayuTotal = 0, cinaTotal = 0, indiaTotal = 0, lainTotal = 0;
    if (selectedRaceState === "ALL") {
      Object.values(allRaceStats).forEach(stateData => { melayuTotal += stateData.MELAYU.total; cinaTotal += stateData.CINA.total; indiaTotal += stateData.INDIA.total; lainTotal += stateData.LAIN_LAIN.total; });
    } else {
      const lookupKey = selectedRaceState.replace(/_/g, ' ');
      const stateData = allRaceStats[lookupKey];
      if (stateData) { melayuTotal = stateData.MELAYU.total; cinaTotal = stateData.CINA.total; indiaTotal = stateData.INDIA.total; lainTotal = stateData.LAIN_LAIN.total; }
    }
    setRaceChartData({
        labels: ["Melayu", "Cina", "India", "Lain-lain"],
        datasets: [{ data: [melayuTotal, cinaTotal, indiaTotal, lainTotal], backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"], hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"] }],
    });
    setIsRaceLoading(false);
  }, [selectedRaceState, allRaceStats]);

  // --- Data Processing for Age Group Chart ---
  useEffect(() => {
    if (!allAgeGroupStats) return;
    setIsAgeGroupLoading(true);
    let age0_17 = 0, age18_24 = 0, age25_39 = 0, age40_59 = 0, age60_plus = 0;
    if (selectedAgeGroupState === "ALL") {
      Object.values(allAgeGroupStats).forEach(stateData => {
        age0_17 += stateData.AGE_0_17.total; age18_24 += stateData.AGE_18_24.total; age25_39 += stateData.AGE_25_39.total; age40_59 += stateData.AGE_40_59.total; age60_plus += stateData.AGE_60_PLUS.total;
      });
    } else {
      const lookupKey = selectedAgeGroupState.replace(/_/g, ' ');
      const stateData = allAgeGroupStats[lookupKey];
      if (stateData) {
        age0_17 = stateData.AGE_0_17.total; age18_24 = stateData.AGE_18_24.total; age25_39 = stateData.AGE_25_39.total; age40_59 = stateData.AGE_40_59.total; age60_plus = stateData.AGE_60_PLUS.total;
      }
    }
    setAgeGroupChartData({
        labels: ["0-17", "18-24", "25-39", "40-59", "60+"],
        datasets: [{ label: "Population", data: [age0_17, age18_24, age25_39, age40_59, age60_plus], backgroundColor: "#11cdef" }],
    });
    setIsAgeGroupLoading(false);
  }, [selectedAgeGroupState, allAgeGroupStats]);

  return (
    <>
      <Container fluid>
        {/* ROW 1: REPLACED WITH DYNAMIC PROJECTION CHART */}
        <Row>
          <Col xl="8">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Jangkaan</h6>
                    <h2 className="mb-0">Populasi 10 Tahun Akan Datang</h2>
                  </div>
                  <div className="col text-right">
                    <Input type="select" bsSize="sm" style={{ maxWidth: '200px', float: 'right' }} value={selectedProjectionState} onChange={e => setSelectedProjectionState(e.target.value)}>
                      <option value="ALL">All Malaysia</option>
                      {projectionDataSource.map(s => (<option key={s.state} value={s.state}>{s.state.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>))}
                    </Input>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                {isProjectionLoading ? (<div className="d-flex justify-content-center align-items-center" style={{height: "350px"}}>Calculating...</div>) : 
                (<div className="chart" style={{ height: "350px" }}><Line data={projectionChartData} options={{...annualOverviewChart.options, maintainAspectRatio: false}} /></div>)}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
             <Card className="card-stats mb-4 mb-xl-0 shadow h-100">
                <CardBody>
                    <Row>
                        <div className="col">
                            <CardTitle tag="h5" className="text-uppercase text-muted mb-0">
                                Jangkaan Purata Umur (10 Tahun)
                            </CardTitle>
                            <span className="h2 font-weight-bold mb-0">
                                {isProjectionLoading ? '...' : projectedAverageAge ? projectedAverageAge.toFixed(1) + ' Tahun' : 'N/A'}
                            </span>
                        </div>
                        <Col className="col-auto">
                            <div className="icon icon-shape bg-info text-white rounded-circle shadow">
                                <i className="fas fa-users" />
                            </div>
                        </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                        <span className="text-nowrap">Projeksi linear berdasarkan data semasa</span>
                    </p>
                </CardBody>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS (Unchanged) */}
        <Row className="mt-5">
            {/* Age Group Chart */}
            <Col xl="4" className="mb-5 mb-xl-0">
                <Card className="shadow h-100">
                <CardHeader className="bg-transparent">
                    <div className="d-flex justify-content-between align-items-center">
                    <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Kumpulan Umur</h2></div>
                    <div>
                        <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedAgeGroupState} onChange={e => setSelectedAgeGroupState(e.target.value)}>
                        <option value="ALL">All Malaysia</option>
                        {Object.keys(stateNameMapping).sort().map(prettyName => (<option key={stateNameMapping[prettyName]} value={stateNameMapping[prettyName]}>{prettyName}</option>))}
                        </Input>
                    </div>
                    </div>
                </CardHeader>
                <CardBody>
                    {isAgeGroupLoading ? (<div className="d-flex justify-content-center align-items-center h-100">Loading...</div>) : 
                    (<div className="chart" style={{ height: "300px" }}><Bar data={ageGroupChartData} options={{ ...ageGroupChart.options, maintainAspectRatio: false }} /></div>)}
                </CardBody>
                </Card>
            </Col>
            {/* Gender Chart */}
            <Col xl="4" className="mb-5 mb-xl-0">
                <Card className="shadow h-100">
                <CardHeader className="bg-transparent">
                    <div className="d-flex justify-content-between align-items-center">
                    <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Ratio Jantina</h2></div>
                    <div>
                        <Input type="select" bsSize="sm" style={{ maxWidth: '150px' }} value={selectedGenderState} onChange={e => setSelectedGenderState(e.target.value)}>
                        <option value="ALL">All Malaysia</option>
                        {Object.keys(stateNameMapping).sort().map(prettyName => (<option key={stateNameMapping[prettyName]} value={stateNameMapping[prettyName]}>{prettyName}</option>))}
                        </Input>
                    </div>
                    </div>
                </CardHeader>
                <CardBody>
                    {isGenderLoading ? (<div className="d-flex justify-content-center align-items-center h-100">Loading...</div>) : 
                    (<div className="chart" style={{ height: "300px" }}><Pie data={genderChartData} options={{ ...genderDistributionChart.options, maintainAspectRatio: false }} /></div>)}
                </CardBody>
                </Card>
            </Col>
            {/* Race Chart */}
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
        
        {/* ROW 3: HEATMAP AND DATA TABLE (Unchanged) */}
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

export default Kependudukan;