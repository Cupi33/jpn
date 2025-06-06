import React from "react";
// reactstrap components
import { Card, Container, Row } from "reactstrap";
// core components
import Header from "components/Headers/Header.js";

// *** 1. JPN Office Locations Data ***
// A list of JPN offices with their name, address, and coordinates.
// For a real application, you would fetch this data from your backend/API.
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
    let google = window.google;
    let map = mapRef.current;

    // *** 2. Center the map on Malaysia and adjust zoom ***
    const mapOptions = {
      zoom: 6, // Zoom out to see the whole of Malaysia
      center: new google.maps.LatLng(4.2105, 101.9758), // Center of Malaysia
      scrollwheel: false,
      zoomControl: true,
      styles: [
        {
          featureType: "administrative",
          elementType: "labels.text.fill",
          stylers: [{ color: "#444444" }],
        },
        {
          featureType: "landscape",
          elementType: "all",
          stylers: [{ color: "#f2f2f2" }],
        },
        {
          featureType: "poi",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "road",
          elementType: "all",
          stylers: [{ saturation: -100 }, { lightness: 45 }],
        },
        {
          featureType: "road.highway",
          elementType: "all",
          stylers: [{ visibility: "simplified" }],
        },
        {
          featureType: "road.arterial",
          elementType: "labels.icon",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "transit",
          elementType: "all",
          stylers: [{ visibility: "off" }],
        },
        {
          featureType: "water",
          elementType: "all",
          stylers: [{ color: "#5e72e4" }, { visibility: "on" }],
        },
      ],
    };

    map = new google.maps.Map(map, mapOptions);

    // *** 3. Loop through locations to create markers and info windows ***
    jpnLocations.forEach((office) => {
      // Create a marker for each office
      const marker = new google.maps.Marker({
        position: new google.maps.LatLng(office.lat, office.lng),
        map: map,
        animation: google.maps.Animation.DROP,
        title: office.name, // Text that appears on hover
      });

      // Create an InfoWindow for each marker
      const contentString =
        `<div class="info-window-content">` +
        `<h4>${office.name}</h4>` +
        `<p>${office.address}</p>` +
        `</div>`;

      const infowindow = new google.maps.InfoWindow({
        content: contentString,
      });

      // Add a click listener to each marker to open its InfoWindow
      google.maps.event.addListener(marker, "click", function () {
        infowindow.open(map, marker);
      });
    });
  }, []); // The empty array ensures this effect runs only once

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