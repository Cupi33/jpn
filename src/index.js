import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AuthCitizenLayout from "layouts/AuthCitizen.js";
import ApplicationCitizen from "layouts/ApplicationCitizen";
import CitizenMenu from "layouts/CitizenMenu.js";
import AuthAdmin from "layouts/AuthAdmin";
import AdminMenu from "layouts/AdminMenu";
import AdminApplication from "layouts/AdminApplication";
import PlainCitizen from "layouts/PlainCitizen"


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/citizenMenu/*" element={<CitizenMenu />} />
      <Route path="/authCitizen/*" element={<AuthCitizenLayout />} />
      <Route path="/applicationCitizen/*" element={<ApplicationCitizen />}/>
      <Route path="/authAdmin/*" element={<AuthAdmin />} />
      <Route path="/adminMenu/*" element={<AdminMenu />} />
      <Route path="/adminApplication/*" element={<AdminApplication />} />
      <Route path="/plainCitizen/*" element={<PlainCitizen />} />

      <Route path="*" element={<Navigate to="/authCitizen/login" replace />} />
    </Routes>
  </BrowserRouter>
);
