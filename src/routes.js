import Index from "views/Index.js";
import Profile from "views/Citizen/Profile.js";
import Maps from "views/Citizen/Maps.js";
import Register from "views/Citizen/Register.js";
import Login from "views/Citizen/Login.js";
import Tables from "views/Citizen/Tables.js";
import Icons from "views/Citizen/Icons.js";
import MenuUtama from "views/Citizen/MenuUtama.js";

// Route groups by layout
const routeGroups = {
  admin: {
    layout: "/admin",
    routes: [
      {
        path: "/index",
        name: "Dashboard",
        icon: "ni ni-tv-2 text-primary",
        component: <Index />,
      },
      {
        path: "/icons",
        name: "Icons",
        icon: "ni ni-planet text-blue",
        component: <Icons />,
      },
      {
        path: "/maps",
        name: "Maps",
        icon: "ni ni-pin-3 text-orange",
        component: <Maps />,
      },
      {
        path: "/user-profile",
        name: "Info Pengguna",
        icon: "ni ni-single-02 text-yellow",
        component: <Profile />,
      },
      {
        path: "/tables",
        name: "Tables",
        icon: "ni ni-bullet-list-67 text-red",
        component: <Tables />,
      },
    ],
  },
  authCitizen: {
    layout: "/authCitizen",
    routes: [
      {
        path: "/MenuUtama",
        name: "Menu Utama",
        icon: "ni ni-shop text-green",
        component: <MenuUtama />,
      },
      {
        path: "/login",
        name: "Login",
        icon: "ni ni-key-25 text-info",
        component: <Login />,
      },
      {
        path: "/register",
        name: "Register",
        icon: "ni ni-circle-08 text-pink",
        component: <Register />,
      },
    ],
  },
};

// Combine all routes with their respective layouts
const routes = Object.entries(routeGroups).flatMap(([group, config]) => 
  config.routes.map(route => ({
    ...route,
    layout: config.layout,
    group, // optional: adds group identifier to each route
  }))
);

export default routes;