import React from "react";
import { useLocation, Route, Routes, Navigate } from "react-router-dom";
import { Container } from "reactstrap";

// core components
import AdminFooter from "components/Footers/AdminFooter.js";
import AdminSidebar from "components/Sidebar/AdminSidebar";

import routes from "routes.js";

const AdminMenu = (props) => {
  const mainContent = React.useRef(null);
  const location = useLocation();

  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }
  }, [location]);

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/adminMenu") {
        return (
          <Route path={prop.path} element={prop.component} key={key} exact />
        );
      }
      return null;
    });
  };


  return (
    <>
            <AdminSidebar
            {...props}
            routes={routes}
            logo={{
              innerLink: "/adminMenu/dashboard",
              imgSrc: require("../assets/img/icons/common/logo.png"),
              imgAlt: "...",
              imgProps: {
                style: {
                  width: "150px", // Adjust this value as needed
                  height: "auto" // Maintain aspect ratio
                }
              }
            }}
          />
      <div
        className="main-content"
        ref={mainContent}
        style={{ minHeight: "100vh", overflowY: "auto", paddingBottom: "2rem" }}
      >
        {/* <AdminNavbar
          {...props}
          brandText={getBrandText(props?.location?.pathname)}
        /> */}
        <Routes>
          {getRoutes(routes)}
          <Route path="*" element={<Navigate to="/adminMenu/dashboard" replace />} />
        </Routes>
        <Container fluid>
          <AdminFooter />
        </Container>
      </div>
    </>
  );
};

export default AdminMenu;
