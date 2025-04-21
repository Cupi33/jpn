// components/Sidebar/CitizenSidebar.js
import React from "react";
import { NavLink as NavLinkRRD } from "react-router-dom";
import { NavItem, NavLink, Nav } from "reactstrap";

const CitizenSidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-wrapper">
        <Nav>
        <NavItem>
            <NavLink to="/Citizen/MenuUtama" tag={NavLinkRRD} activeClassName="active">
            <i className="ni ni-shop" /> Menu Utama
            </NavLink>
        </NavItem>
        <NavItem>
            <NavLink to="/Citizen/profile" tag={NavLinkRRD} activeClassName="active">
            <i className="ni ni-single-02" /> Profil
            </NavLink>
        </NavItem>
        </Nav>
      </div>
    </div>
  );
};

export default CitizenSidebar;