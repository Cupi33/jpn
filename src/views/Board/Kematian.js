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

import geoData from "../../data/malaysia-states.json";

// --- MOCK / HARDCODED DATA ---
// Only the annual overview chart remains hardcoded as per the requirements.
const annualDeathsData = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Deaths", data: [170, 180, 195, 225, 205, 210, 220], borderColor: "#f5365c", backgroundColor: "#f5365c", pointBackgroundColor: "#f5365c", pointRadius: 3, pointHoverRadius: 5,
    },
  ],
};

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
  // State for Map/Table data
  const [deathTableData, setDeathTableData] = useState([]);
  const [deathMapData, setDeathMapData] = useState({});
  const [isMapDataLoading, setIsMapDataLoading] = useState(true);

  // State for Gender chart
  const [allGenderData, setAllGenderData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("ALL");
  const [isGenderLoading, setIsGenderLoading] = useState(true);
  const [genderChartData, setGenderChartData] = useState({
    labels: ["Lelaki", "Perempuan"],
    datasets: [{ data: [0, 0], backgroundColor: ["#5e72e4", "#f5365c"], hoverBackgroundColor: ["#5e72e4", "#f5365c"] }],
  });
  
  // State for Age Group chart
  const [ageGroupChartData, setAgeGroupChartData] = useState({
    labels: ["0-17", "18-24", "25-39", "40-59", "60+"],
    datasets: [{ label: "Deaths", data: [0, 0, 0, 0, 0], backgroundColor: "#11cdef" }],
  });
  const [isAgeGroupLoading, setIsAgeGroupLoading] = useState(true);

  // State for Average Age of Death display
  const [avgAgeData, setAvgAgeData] = useState({ male: 0, female: 0 });
  const [isAvgAgeLoading, setIsAvgAgeLoading] = useState(true);


  // --- Data Fetching and Initial Processing ---
  useEffect(() => {
    if (window.Chart) { parseOptions(Chart, chartOptions()); }

    const fetchAllData = async () => {
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
                    const mapKey = stateName.replace(/ /g, '_').toUpperCase();
                    formattedMapData[mapKey] = { total: data.total_death, percentage: data.percentage };
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
                const { stats } = response.data;
                const dataArray = [ stats['0-17'] || 0, stats['18-24'] || 0, stats['25-39'] || 0, stats['40-59'] || 0, stats['60+'] || 0 ];
                setAgeGroupChartData(prev => ({ ...prev, datasets: [{ ...prev.datasets[0], data: dataArray }] }));
            }
        } catch (error) { console.error("Error fetching age group death data:", error); } 
        finally { setIsAgeGroupLoading(false); }

        // Fetch data for Gender Chart
        setIsGenderLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/deathStat/genderDeath5year");
            if (response.data?.success) {
                setAllGenderData(response.data.stats);
            }
        } catch (error) { console.error("Error fetching gender death data:", error); }
        finally { setIsGenderLoading(false); }

        // Fetch data for Average Age display
        setIsAvgAgeLoading(true);
        try {
            const response = await axios.get("http://localhost:5000/deathStat/avgAgeOfDeath");
            if (response.data?.success) {
                setAvgAgeData(response.data.stats);
            }
        } catch (error) { console.error("Error fetching average age of death data:", error); }
        finally { setIsAvgAgeLoading(false); }
    };

    fetchAllData();
  }, []);

  // --- Data Processing for Gender Chart ---
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
      const yearData = allGenderData.find(d => d.year === selectedYear);
      if (yearData) {
        maleTotal = yearData.male;
        femaleTotal = yearData.female;
      }
    }
    setGenderChartData(prevData => ({ ...prevData, datasets: [{ ...prevData.datasets[0], data: [maleTotal, femaleTotal] }] }));
  }, [selectedYear, allGenderData]);


  return (
    <>
      <Container className="pt-4" fluid>
        {/* ROW 1: ANNUAL DEATHS CHART */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent"><Row className="align-items-center"><div className="col"><h6 className="text-uppercase text-muted ls-1 mb-1">Gambaran Keseluruhan</h6><h2 className="mb-0">Statistik Kematian Tahunan</h2></div></Row></CardHeader>
              <CardBody><div className="chart" style={{ height: "350px" }}><Line data={annualDeathsData} options={{ ...annualDeathsChart.options, maintainAspectRatio: false }} /></div></CardBody>
            </Card>
          </Col>
        </Row>

        {/* ROW 2: DEMOGRAPHIC BREAKDOWN DISPLAYS */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div><h6 className="text-uppercase text-muted ls-1 mb-1">Demografik</h6><h2 className="mb-0">Kematian Mengikut Umur</h2></div>
              </CardHeader>
              <CardBody>
                {isAgeGroupLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : (
                  <div className="chart" style={{ height: "300px" }}><Bar data={ageGroupChartData} options={{ ...deathsByAgeGroupChart.options, maintainAspectRatio: false }} /></div>
                )}
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
                {isGenderLoading ? (
                   <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
                ) : (
                  <div className="chart" style={{ height: "300px" }}><Pie data={genderChartData} options={{ ...deathsByGenderChart.options, maintainAspectRatio: false }} /></div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <div>
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Jangka Hayat</h6>
                    <h2 className="mb-0">Purata Umur Kematian</h2>
                </div>
              </CardHeader>
              <CardBody>
                {isAvgAgeLoading ? (
                  <div className="d-flex justify-content-center align-items-center h-100">Loading...</div>
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
        
        {/* ROW 3: HEATMAP AND DATA TABLE */}
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

export default Kematian;