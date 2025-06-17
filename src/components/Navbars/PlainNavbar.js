// src/components/Navbars/PlainNavbar.js

import React from "react";
import { Link } from "react-router-dom";
// reactstrap components
import {
  Navbar,
  Container,
  Nav,
  NavItem,
  NavLink,
  NavbarBrand,
} from "reactstrap";

const PlainNavbar = () => {
  return (
    // We use a "transparent" color navbar and expand on "lg" (large) screens
    <Navbar className="navbar-top navbar-horizontal navbar-dark" expand="lg">
      <Container className="px-4">
        <NavbarBrand to="/plain/dashboard" tag={Link}>
          {/* You can put your app name or logo here */}
          Sistem Informasi
        </NavbarBrand>
        {/* This is the part that will collapse on smaller screens */}
        <div className="navbar-collapse-header">
          {/* You might want a smaller logo for the collapsed menu */}
        </div>
        {/* The main navigation links */}
        <Nav className="ml-auto" navbar>
          <NavItem>
            {/* We use the "tag" prop to make reactstrap's NavLink behave like react-router's Link */}
            <NavLink
              className="nav-link-icon"
              to="/plain/kependudukan"
              tag={Link}
            >
              <span className="nav-link-inner--text">Data Kependudukan</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className="nav-link-icon"
              to="/plain/data-permohonan-kp"
              tag={Link}
            >
              <span className="nav-link-inner--text">
                Data Permohonan Kad Pengenalan
              </span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className="nav-link-icon"
              to="/plain/kelahiran"
              tag={Link}
            >
              <span className="nav-link-inner--text">Data Kelahiran Bayi</span>
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              className="nav-link-icon"
              to="/plain/kematian"
              tag={Link}
            >
              <span className="nav-link-inner--text">Data Kematian</span>
            </NavLink>
          </NavItem>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default PlainNavbar;