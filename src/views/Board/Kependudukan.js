import { useEffect, useState } from "react";
import axios from "axios";
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
import { ComposableMap, Geographies, Geography, ZoomableGroup } from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";
import { 
  Card, CardHeader, CardBody, Table, Container, Row, Col, Progress, Button, Input, CardTitle
} from "reactstrap";
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

// Import the external modal component
import ProjectionInsightsModal from "../../components/Modals/ProjectInsightsModal";


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

// --- MAIN KEPENDUDUKAN COMPONENT ---
const Kependudukan = (props) => {
  // --- STATE MANAGEMENT ---
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
  
  // Projection Chart State
  const [projectionDataSource, setProjectionDataSource] = useState([]);
  const [selectedProjectionState, setSelectedProjectionState] = useState("ALL");
  const [isProjectionLoading, setIsProjectionLoading] = useState(true);
  const [projectionChartData, setProjectionChartData] = useState({ labels: [], datasets: [] });
  const [projectedAverageAge, setProjectedAverageAge] = useState(null);
  
  // Insights Modal State
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [projectionInsights, setProjectionInsights] = useState(null);
  const toggleInsightsModal = () => setIsInsightsModalOpen(!isInsightsModalOpen);

  // Helper function for formatting
  const formatStateName = (name) => name ? name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'N/A';

  // --- DATA FETCHING & PROCESSING ---

  // Initial Data Fetching
  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }

    const fetchAllData = async () => {
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
          axios.get("http://localhost:5000/board/kependudukan10tahun")
        ]);

        if (popResponse.data.success) {
          const stats = popResponse.data.stats;
          setPopulationMapData(stats);
          const formattedTableData = Object.entries(stats)
            .map(([stateName, data]) => ({ state: stateName.replace(/_/g, " "), population: data.total }))
            .sort((a, b) => b.population - a.population);
          setPopulationTableData(formattedTableData);
        }

        if (projectionResponse.data.success) setProjectionDataSource(projectionResponse.data.stats);
        if (genderResponse.data.success) setAllGenderStats(genderResponse.data.stats);
        if (raceResponse.data.success) setAllRaceStats(raceResponse.data.stats);
        if (ageResponse.data.success) setAllAgeGroupStats(ageResponse.data.stats);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchAllData();
  }, []);

  // Data Processing for 10-Year Projection Chart
  useEffect(() => {
    if (projectionDataSource.length === 0 || populationTableData.length === 0) return;
    setIsProjectionLoading(true);

    let currentPopulation = 0, totalNewborns_5y = 0, totalDeaths_5y = 0, currentAverageAge = 0;

    if (selectedProjectionState === "ALL") {
      currentPopulation = populationTableData.reduce((sum, state) => sum + state.population, 0);
      totalNewborns_5y = projectionDataSource.reduce((sum, state) => sum + state.total_newborn, 0);
      totalDeaths_5y = projectionDataSource.reduce((sum, state) => sum + state.total_death, 0);
      
      const totalWeightedAge = projectionDataSource.reduce((sum, stateData) => {
        const popData = populationTableData.find(p => p.state.toUpperCase() === stateData.state.replace(/_/g, ' '));
        return sum + (stateData.avg_age * (popData ? popData.population : 0));
      }, 0);
      currentAverageAge = currentPopulation > 0 ? totalWeightedAge / currentPopulation : 0;
    } else {
      const stateTrendData = projectionDataSource.find(s => s.state === selectedProjectionState);
      const statePopulationData = populationTableData.find(s => s.state.toUpperCase() === selectedProjectionState);
      if (stateTrendData && statePopulationData) {
        currentPopulation = statePopulationData.population;
        totalNewborns_5y = stateTrendData.total_newborn;
        totalDeaths_5y = stateTrendData.total_death;
        currentAverageAge = stateTrendData.avg_age;
      }
    }

    const annualChange = (totalNewborns_5y / 5) - (totalDeaths_5y / 5);
    const futureLabels = [], futureDataPoints = [];
    const currentYear = new Date().getFullYear();

    for (let i = 0; i <= 10; i++) {
      futureLabels.push(currentYear + i);
      futureDataPoints.push(Math.round(currentPopulation + (annualChange * i)));
    }
    
    setProjectionChartData({
      labels: futureLabels,
      datasets: [{ label: "Jangkaan Populasi", data: futureDataPoints, borderColor: "#5e72e4", backgroundColor: "transparent" }]
    });
    setProjectedAverageAge(currentAverageAge + 10);
    setIsProjectionLoading(false);
  }, [selectedProjectionState, projectionDataSource, populationTableData]);

  // Calculate Insights for Modal
  useEffect(() => {
    if (projectionDataSource.length === 0) return;

    let oldest = { name: 'N/A', age: -1 }, youngest = { name: 'N/A', age: 999 };
    let topIncrease = { name: 'N/A', change: -Infinity }, topDecline = { name: 'N/A', change: Infinity };
    let totalChange = 0;

    projectionDataSource.forEach(state => {
      const projectedAge = state.avg_age + 10;
      if (projectedAge > oldest.age) oldest = { name: state.state, age: projectedAge };
      if (projectedAge < youngest.age) youngest = { name: state.state, age: projectedAge };
      const annualChange = (state.total_newborn / 5) - (state.total_death / 5);
      if (annualChange > topIncrease.change) topIncrease = { name: state.state, change: annualChange };
      if (annualChange < topDecline.change) topDecline = { name: state.state, change: annualChange };
      totalChange += annualChange;
    });

    if (topIncrease.change <= 0) topIncrease = { name: 'Tiada', change: 0 };
    if (topDecline.change >= 0) topDecline = { name: 'Tiada', change: 0 };
    
    let outlookText = '';
    if (totalChange > 1000) outlookText = 'Negara dijangka mengalami pertumbuhan populasi yang sihat, didorong oleh kadar kelahiran yang melebihi kematian. Ini menunjukkan potensi perkembangan ekonomi dan sosial, namun ia juga memerlukan perancangan teliti dalam penyediaan infrastruktur dan perkhidmatan awam.';
    else if (totalChange > 0) outlookText = 'Populasi negara dijangka meningkat secara perlahan. Walaupun stabil, perhatian perlu diberikan kepada polisi untuk menggalakkan pertumbuhan dan memastikan populasi usia produktif kekal mampan.';
    else outlookText = 'Negara berisiko menghadapi penyusutan populasi, di mana jumlah kematian melebihi kelahiran. Ini boleh memberi cabaran kepada tenaga kerja dan sistem sokongan sosial pada masa hadapan. Polisi pro-kelahiran dan pengurusan sumber manusia yang cekap adalah kritikal.';
    
    setProjectionInsights({ oldest, youngest, topIncrease, topDecline, outlookText });
  }, [projectionDataSource]);

  // Data Processing for Other Charts
  useEffect(() => {
    if (!allGenderStats) return; setIsGenderLoading(true);
    let maleTotal = 0, femaleTotal = 0;
    if (selectedGenderState === "ALL") {
      Object.values(allGenderStats).forEach(d => { maleTotal += d.LELAKI.total; femaleTotal += d.PEREMPUAN.total; });
    } else if (allGenderStats[selectedGenderState.replace(/_/g, ' ')]) { 
        const d = allGenderStats[selectedGenderState.replace(/_/g, ' ')]; 
        maleTotal = d.LELAKI.total; femaleTotal = d.PEREMPUAN.total; 
    }
    setGenderChartData({ labels: ["Lelaki", "Perempuan"], datasets: [{ data: [maleTotal, femaleTotal], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }]}); 
    setIsGenderLoading(false);
  }, [selectedGenderState, allGenderStats]);

  useEffect(() => {
    if (!allRaceStats) return; setIsRaceLoading(true);
    let m = 0, c = 0, i = 0, l = 0;
    if (selectedRaceState === "ALL") {
      Object.values(allRaceStats).forEach(d => { m += d.MELAYU.total; c += d.CINA.total; i += d.INDIA.total; l += d.LAIN_LAIN.total; });
    } else if(allRaceStats[selectedRaceState.replace(/_/g, ' ')]) { 
      const d = allRaceStats[selectedRaceState.replace(/_/g, ' ')]; 
      m = d.MELAYU.total; c = d.CINA.total; i = d.INDIA.total; l = d.LAIN_LAIN.total; 
    }
    setRaceChartData({ labels: ["Melayu", "Cina", "India", "Lain-lain"], datasets: [{ data: [m, c, i, l], backgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"], hoverBackgroundColor: ["#2dce89", "#fb6340", "#5e72e4", "#adb5bd"] }]}); 
    setIsRaceLoading(false);
  }, [selectedRaceState, allRaceStats]);

  useEffect(() => {
    if (!allAgeGroupStats) return; setIsAgeGroupLoading(true);
    let g1=0, g2=0, g3=0, g4=0, g5=0;
    if (selectedAgeGroupState === "ALL") {
      Object.values(allAgeGroupStats).forEach(d => { g1 += d.AGE_0_17.total; g2 += d.AGE_18_24.total; g3 += d.AGE_25_39.total; g4 += d.AGE_40_59.total; g5 += d.AGE_60_PLUS.total; });
    } else if (allAgeGroupStats[selectedAgeGroupState.replace(/_/g, ' ')]) { 
      const d = allAgeGroupStats[selectedAgeGroupState.replace(/_/g, ' ')]; 
      g1 = d.AGE_0_17.total; g2 = d.AGE_18_24.total; g3 = d.AGE_25_39.total; g4 = d.AGE_40_59.total; g5 = d.AGE_60_PLUS.total; 
    }
    setAgeGroupChartData({ labels: ["0-17", "18-24", "25-39", "40-59", "60+"], datasets: [{ label: "Population", data: [g1, g2, g3, g4, g5], backgroundColor: "#11cdef" }]}); 
    setIsAgeGroupLoading(false);
  }, [selectedAgeGroupState, allAgeGroupStats]);

  // --- RENDER ---
  return (
    <>
      <Container fluid>
        {/* ROW 1: DYNAMIC PROJECTION CHART */}
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
                      {projectionDataSource.map(s => (<option key={s.state} value={s.state}>{formatStateName(s.state)}</option>))}
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
             <Card className="card-stats mb-4 mb-xl-0 shadow h-100 d-flex flex-column">
                <CardBody className="flex-grow-1">
                    <Row>
                      <div className="col">
                        <CardTitle tag="h5" className="text-uppercase text-muted mb-0">Jangkaan Purata Umur (10 Tahun)</CardTitle>
                        <span className="h2 font-weight-bold mb-0">{isProjectionLoading ? '...' : projectedAverageAge ? projectedAverageAge.toFixed(1) + ' Tahun' : 'N/A'}</span>
                      </div>
                      <Col className="col-auto">
                        <div className="icon icon-shape bg-info text-white rounded-circle shadow"><i className="fas fa-users" /></div>
                      </Col>
                    </Row>
                    <p className="mt-3 mb-0 text-muted text-sm">
                      <span className="text-nowrap">Projeksi linear berdasarkan data semasa</span>
                    </p>
                </CardBody>
                <div className="card-footer bg-transparent border-0 pt-0 text-right">
                    <Button color="primary" size="sm" onClick={toggleInsightsModal} disabled={!projectionInsights}>Lanjut</Button>
                </div>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN CHARTS */}
        <Row className="mt-5">
            <Col xl="4" className="mb-5 mb-xl-0">
              <Card className="shadow h-100">
                <CardHeader className="bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                      <h2 className="mb-0">Kumpulan Umur</h2>
                    </div>
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
            <Col xl="4" className="mb-5 mb-xl-0">
              <Card className="shadow h-100">
                <CardHeader className="bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                      <h2 className="mb-0">Ratio Jantina</h2>
                    </div>
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
            <Col xl="4">
              <Card className="shadow h-100">
                <CardHeader className="bg-transparent">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6>
                      <h2 className="mb-0">Komposisi Kaum</h2>
                    </div>
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
                  <thead className="thead-light">
                    <tr>
                      <th scope="col">Negeri</th>
                      <th scope="col">Populasi</th>
                      <th scope="col">Peratusan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {populationTableData.length > 0 ? (populationTableData.map((item, index) => { 
                      const popTotal = populationTableData.reduce((sum, i) => sum + i.population, 0);
                      const percentage = popTotal > 0 ? (item.population / popTotal) * 100 : 0;
                      return (
                        <tr key={index}>
                          <th scope="row" style={{ textTransform: 'capitalize' }}>{item.state.toLowerCase()}</th>
                          <td>{item.population.toLocaleString()}</td>
                          <td>
                            <div className="d-flex align-items-center">
                              <span className="mr-2">{percentage.toFixed(2)}%</span>
                              <div><Progress max="100" value={percentage} barClassName="bg-gradient-primary" /></div>
                            </div>
                          </td>
                        </tr>
                      );
                    })) : (
                      <tr><td colSpan="3" className="text-center">Loading data...</td></tr>
                    )}
                  </tbody>
                </Table>
              </Card>
            </Col>
        </Row>
      </Container>
      <ReactTooltip id="map-tooltip" />
      
      {/* RENDER THE EXTERNAL MODAL COMPONENT */}
      <ProjectionInsightsModal 
        isOpen={isInsightsModalOpen}
        toggle={toggleInsightsModal}
        insights={projectionInsights}
      />
    </>
  );
};

export default Kependudukan;