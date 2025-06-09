// AdminStatistic.js

import { useEffect, useState } from "react";
import axios from "axios";
// javascipt plugin for creating charts
import Chart from "chart.js";
// react plugin used to create charts
import { Line, Pie, Bar, Doughnut } from "react-chartjs-2";
// Map and Tooltip Imports
// FIX: Import ZoomableGroup to enable zoom/pan functionality
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip as ReactTooltip } from "react-tooltip";

// reactstrap components
import {
  Card,
  CardHeader,
  CardBody,
  Table,
  Container,
  Row,
  Col,
  Progress,
  Button, // Import Button for our zoom controls
} from "reactstrap";

// core components
import {
  chartOptions,
  parseOptions,
  annualOverviewChart,
  genderDistributionChart,
  ageGroupChart,
  maritalStatusChart,
} from "variables/chartAdmin";

import Header from "components/Headers/AdminStatHeader";
// Import the local GeoJSON file from your data folder
import geoData from "../../data/malaysia-states.json";

// --- MOCK DATA (for charts) ---
const annualOverviewData = {
  labels: ["2018", "2019", "2020", "2021", "2022", "2023", "2024"],
  datasets: [
    {
      label: "Births",
      data: [490, 510, 485, 530, 550, 540, 565],
      borderColor: "#2dce89",
      backgroundColor: "#2dce89",
      pointBackgroundColor: "#2dce89",
      pointRadius: 3,
      pointHoverRadius: 5,
    },
    {
      label: "Deaths",
      data: [170, 180, 195, 185, 205, 210, 220],
      borderColor: "#f5365c",
      backgroundColor: "#f5365c",
      pointBackgroundColor: "#f5365c",
      pointRadius: 3,
      pointHoverRadius: 5,
    },
  ],
};
const genderData = {
  labels: ["Male", "Female"],
  datasets: [
    {
      data: [16890440, 15980120],
      backgroundColor: ["#5e72e4", "#f5365c"],
      hoverBackgroundColor: ["#5e72e4", "#f5365c"],
    },
  ],
};
const ageGroupData = {
  labels: ["0-17", "18-24", "25-39", "40-59", "60+"],
  datasets: [
    {
      label: "Population",
      data: [8900100, 4500250, 9800500, 6450800, 3218910],
      backgroundColor: "#11cdef",
    },
  ],
};
const maritalStatusData = {
  labels: ["Single", "Married", "Divorced", "Widowed"],
  datasets: [
    {
      data: [10250340, 19870400, 890120, 1859700],
      backgroundColor: ["#fb6340", "#2dce89", "#f5365c", "#adb5bd"],
      hoverBackgroundColor: ["#fb6340", "#2dce89", "#f5365c", "#adb5bd"],
    },
  ],
};

// --- DATA MAPPING & MAP COMPONENT ---

const stateNameMapping = {
  "Johor": "JOHOR", "Kedah": "KEDAH", "Kelantan": "KELANTAN", "Kuala Lumpur": "KUALA_LUMPUR",
  "Labuan": "LABUAN", "Melaka": "MELAKA", "Negeri Sembilan": "NEGERI_SEMBILAN", "Pahang": "PAHANG",
  "Perak": "PERAK", "Perlis": "PERLIS", "Pulau Pinang": "PULAU_PINANG", "Putrajaya": "PUTRAJAYA",
  "Sabah": "SABAH", "Sarawak": "SARAWAK", "Selangor": "SELANGOR", "Terengganu": "TERENGGANU",
};

// --- UPDATED MAPCHART COMPONENT WITH ZOOM/PAN ---
const MapChart = ({ data }) => {
  // State to manage map position and zoom
  const [position, setPosition] = useState({ coordinates: [108, 4], zoom: 1 });

  // Handlers for zoom buttons
  const handleZoomIn = () => {
    if (position.zoom >= 4) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom * 1.5 }));
  };
  const handleZoomOut = () => {
    if (position.zoom <= 1) return;
    setPosition((pos) => ({ ...pos, zoom: pos.zoom / 1.5 }));
  };

  // Handler for when the map is moved (panned or zoomed)
  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  const populationValues = Object.values(data).map((d) => d.total);
  const minPop = Math.min(...populationValues, 0);
  const maxPop = Math.max(...populationValues, 1);
  const colorScale = (value) => {
    if (value === undefined || value === null) return "#DDD";
    const normalized = (value - minPop) / (maxPop - minPop);
    const r = 255;
    const g = 255 - Math.floor(normalized * 200);
    const b = 100 - Math.floor(normalized * 100);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    // We add a wrapper div with relative positioning to contain the absolute positioned buttons
    <div style={{ position: "relative" }}>
      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 1800 }} // Scale sets the initial "fit"
        style={{ width: "100%", height: "auto" }}
      >
        {/* ZoomableGroup handles the zooming and panning logic */}
        <ZoomableGroup
          zoom={position.zoom}
          center={position.coordinates}
          onMoveEnd={handleMoveEnd}
        >
          <Geographies geography={geoData}>
            {({ geographies }) =>
              geographies.map((geo) => {
                const geoJsonName = geo.properties.name;
                const apiName = stateNameMapping[geoJsonName];
                const stateData = data[apiName];

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    data-tooltip-id="map-tooltip"
                    data-tooltip-content={
                      stateData ? `${geoJsonName}: ${stateData.total.toLocaleString()} people` : `${geoJsonName}: No data`
                    }
                    style={{
                      default: {
                        fill: stateData ? colorScale(stateData.total) : "#F5F5F5",
                        outline: "none", stroke: "#FFF", strokeWidth: 0.5,
                      },
                      hover: { fill: "#f5365c", outline: "none" },
                      pressed: { fill: "#E42B4F", outline: "none" },
                    }}
                  />
                );
              })
            }
          </Geographies>
        </ZoomableGroup>
      </ComposableMap>
      
      {/* Zoom control buttons */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button color="primary" onClick={handleZoomIn} className="btn-icon btn-sm mb-1">
          <span className="btn-inner--icon">
            <i className="fas fa-plus" />
          </span>
        </Button>
        <Button color="primary" onClick={handleZoomOut} className="btn-icon btn-sm">
          <span className="btn-inner--icon">
            <i className="fas fa-minus" />
          </span>
        </Button>
      </div>
    </div>
  );
};

// --- MAIN ADMIN STATISTIC COMPONENT ---
const AdminStatistic = (props) => {
  const [populationTableData, setPopulationTableData] = useState([]);
  const [populationMapData, setPopulationMapData] = useState({});

  useEffect(() => {
    if (window.Chart) {
      parseOptions(Chart, chartOptions());
    }
    const fetchPopulationData = async () => {
      try {
        const response = await axios.get("http://localhost:5000/adminstat/citizenPlacement");
        if (response.data.success) {
          const stats = response.data.stats;
          setPopulationMapData(stats);
          const formattedTableData = Object.entries(stats)
            .map(([stateName, data]) => ({
              state: stateName.replace(/_/g, " "),
              population: data.total,
              percentage: data.percentage,
            }))
            .sort((a, b) => b.population - a.population);
          setPopulationTableData(formattedTableData);
        }
      } catch (error) {
        console.error("Error fetching population data:", error);
      }
    };
    fetchPopulationData();
  }, []);

  return (
    <>
      <Header />
      <Container className="mt--7" fluid>
        {/* Row 1 */}
        <Row>
          <Col xl="12">
            <Card className="shadow">
              <CardHeader className="bg-transparent">
                <Row className="align-items-center">
                  <div className="col">
                    <h6 className="text-uppercase text-muted ls-1 mb-1">Overview</h6>
                    <h2 className="mb-0">Annual Population Dynamics</h2>
                  </div>
                </Row>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "350px" }}>
                  <Line data={annualOverviewData} options={{...annualOverviewChart.options, maintainAspectRatio: false,}}/>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Row 2 */}
        <Row className="mt-5">
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6>
                <h2 className="mb-0">Age Groups</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Bar data={ageGroupData} options={{...ageGroupChart.options, maintainAspectRatio: false,}}/>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6>
                <h2 className="mb-0">Gender Distribution</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Pie data={genderData} options={{...genderDistributionChart.options, maintainAspectRatio: false,}}/>
                </div>
              </CardBody>
            </Card>
          </Col>
          <Col xl="4">
            <Card className="shadow h-100">
              <CardHeader className="bg-transparent">
                <h6 className="text-uppercase text-muted ls-1 mb-1">Demographics</h6>
                <h2 className="mb-0">Marital Status</h2>
              </CardHeader>
              <CardBody>
                <div className="chart" style={{ height: "300px" }}>
                  <Doughnut data={maritalStatusData} options={{...maritalStatusChart.options, maintainAspectRatio: false,}}/>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Row 3 */}
        <Row className="mt-5">
          <Col xl="7" className="mb-5 mb-xl-0">
            <Card className="shadow h-100">
              <CardHeader className="border-0">
                <h3 className="mb-0">Peta Kependudukan Di Malaysia</h3>
              </CardHeader>
              <CardBody>
                {Object.keys(populationMapData).length > 0 ? (
                  <MapChart data={populationMapData} />
                ) : (
                  <div className="text-center">Loading map data...</div>
                )}
              </CardBody>
            </Card>
          </Col>
          <Col xl="5">
            <Card className="shadow">
              <CardHeader className="border-0">
                <h3 className="mb-0">Carta Kependudukan di Malaysia</h3>
              </CardHeader>
              <Table className="align-items-center table-flush" responsive>
                <thead className="thead-light">
                  <tr>
                    <th scope="col">Negeri</th>
                    <th scope="col">Populasi</th>
                    <th scope="col">Peratusan</th>
                  </tr>
                </thead>
                <tbody>
                  {populationTableData.length > 0 ? (
                    populationTableData.map((item, index) => (
                      <tr key={index}>
                        <th scope="row" style={{ textTransform: 'capitalize' }}>
                          {item.state.toLowerCase()}
                        </th>
                        <td>{item.population.toLocaleString()}</td>
                        <td>
                          <div className="d-flex align-items-center">
                            <span className="mr-2">{item.percentage}%</span>
                            <div>
                              <Progress max="100" value={item.percentage} barClassName="bg-gradient-primary"/>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="text-center">Loading data...</td>
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

export default AdminStatistic;