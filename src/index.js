import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import "assets/plugins/nucleo/css/nucleo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import "assets/scss/argon-dashboard-react.scss";

import AdminLayout from "layouts/Admin.js";
import CitizenLayout from "layouts/Citizen.js";


const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/admin/*" element={<AdminLayout />} />
      <Route path="/citizen/*" element={<CitizenLayout />} />
      
      {/* <Route 
          path="/*" element={<PublicLayout />} >
          <Route path="setting" element={<Setting />} />
      </Route> */}

      <Route path="*" element={<Navigate to="/citizen/login" replace />} />
    </Routes>
  </BrowserRouter>
);
