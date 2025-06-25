import React from "react";
// reactstrap components
import { Card, Container, Row } from "reactstrap";
// core components
import Header from "components/Headers/Header.js";

// *** 1. JPN Office Locations Data (No changes needed here) ***
const jpnLocations = [
  {
    name: "Ibu Pejabat JPN Putrajaya",
    address: "No 20, Persiaran Perdana, Presint 2, 62551 Wilayah Persekutuan Putrajaya",
    lat: 2.9218,
    lng: 101.6877,
  },
  {
    name: "JPN UTC Pudu Sentral",
    address: "Aras 2, UTC Kuala Lumpur, Pudu Sentral, 55100 Kuala Lumpur",
    lat: 3.1448,
    lng: 101.6983,
  },
  {
    name: "JPN Cawangan Majlis Daerah Hulu Selangor",
    address: "Jalan Bukit Kerajaan, 44000 Kuala Kubu Bharu, Selangor",
    lat: 3.5645,
    lng: 101.6601,
  },
  {
    name: "JPN Negeri Sembilan",
    address: "Tingkat 1, Wisma Persekutuan, Jalan Dato' Abdul Kadir, 70000 Seremban, Negeri Sembilan",
    lat: 2.7252,
    lng: 101.9381,
  },
  {
    name: "JPN Negeri Johor",
    address: "Aras 1, Blok 2, Kompleks KDN, Taman Setia Tropika, 81200 Johor Bahru, Johor",
    lat: 1.5434,
    lng: 103.7315,
  },
  {
    name: "JPN Negeri Pulau Pinang",
    address: "Tingkat 3, Bangunan Persekutuan, Jalan Anson, 10400 George Town, Pulau Pinang",
    lat: 5.4184,
    lng: 100.3204,
  },
  {
    name: "JPN Negeri Sabah",
    address: "Aras 1, Kompleks Pentadbiran Kerajaan Persekutuan Sabah, Jalan UMS, 88400 Kota Kinabalu, Sabah",
    lat: 6.0275,
    lng: 116.1416,
  },
  {
    name: "JPN Negeri Sarawak",
    address: "Aras 1 & 2, Bangunan Tun Datuk Patinggi Tuanku Haji Bujang, Jalan Simpang Tiga, 93551 Kuching, Sarawak",
    lat: 1.5303,
    lng: 110.3542,
  },
];

const MapWrapper = () => {
  const mapRef = React.useRef(null);

  React.useEffect(() => {
    // Check if the map container is available and if Leaflet (L) is loaded
    if (!mapRef.current || !window.L) return;

    // We no longer need the apiKey for this default map style
    // const apiKey = "I76Q2zPbaR1PNnWoBq1S";

    // *** 2. Initialize the map and center it on Malaysia ***
    const map = window.L.map(mapRef.current).setView([4.2105, 101.9758], 6);

    // *** 3. Add the OpenStreetMap Tile Layer (THE FIX IS HERE) ***
    // We are switching to the standard, detailed OpenStreetMap tile server.
    // This provides the classic "street map" look and doesn't require an API key.
    window.L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19, // The default map has a max zoom of 19
      }
    ).addTo(map);

    // *** 4. Loop through locations to create markers and popups (No changes here) ***
    jpnLocations.forEach((office) => {
      // Create a marker for each office
      const marker = window.L.marker([office.lat, office.lng]).addTo(map);

      // Create the popup content
      const popupContent =
        `<div class="info-window-content">` +
        `<h4>${office.name}</h4>` +
        `<p>${office.address}</p>` +
        `</div>`;
        
      // Bind the popup to the marker. It will open on click.
      marker.bindPopup(popupContent);
    });

    // Cleanup function to remove the map instance when the component unmounts
    return () => {
      map.remove();
    };

  }, []);

  return (
    <>
      <div
        style={{ height: `600px` }}
        className="map-canvas"
        id="map-canvas"
        ref={mapRef}
      ></div>
    </>
  );
};

// No changes needed for the Maps component itself
const Maps = () => {
  return (
    <>
      <Header />
      {/* Page content */}
      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow border-0">
              <MapWrapper />
            </Card>
          </div>
        </Row>
      </Container>
    </>
  );
};

export default Maps;