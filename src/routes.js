import Index from "views/Index.js";
import Profile from "views/Citizen/Profile.js";
import Maps from "views/Citizen/Maps.js";
import Register from "views/Citizen/Register.js";
import Login from "views/Citizen/Login.js";
import Tables from "views/Citizen/Tables.js";
import Icons from "views/Citizen/Icons.js";
import MenuUtama from "views/Citizen/MenuUtama";

var routes = [
  {
    path: "/MenuUtama",
    name: "Menu Utama",
    icon: "ni ni-shop text-green",
    component: <MenuUtama />,
    layout: "/auth",
  },
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/icons",
    name: "Icons",
    icon: "ni ni-planet text-blue",
    component: <Icons />,
    layout: "/admin",
  },
  {
    path: "/maps",
    name: "Maps",
    icon: "ni ni-pin-3 text-orange",
    component: <Maps />,
    layout: "/admin",
  },
  {
    path: "/user-profile",
    name: "User Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
  },
  {
    path: "/tables",
    name: "Tables",
    icon: "ni ni-bullet-list-67 text-red",
    component: <Tables />,
    layout: "/admin",
  },
  {
    path: "/login",
    name: "Login",
    icon: "ni ni-key-25 text-info",
    component: <Login />,
    layout: "/auth",
  },
  {
    path: "/register",
    name: "Register",
    icon: "ni ni-circle-08 text-pink",
    component: <Register />,
    layout: "/auth",
  },
];
export default routes;
