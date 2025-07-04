import Index from "views/Index.js";
import Profile from "views/Citizen/Profile.js";
import Maps from "views/Citizen/Maps.js";
import Register from "views/Citizen/Register.js";
import Login from "views/Citizen/Login.js";
import MenuUtama from "views/Citizen/MenuUtama.js";
import Statistic from "views/Citizen/Statistic.js"
import DeathApplication from "views/Citizen/DeathApplication.js";
import NewbornApplication from "views/Citizen/NewbornApplication";
import ICApplication from "views/Citizen/ICApplication";
import AdminLogin from "views/Admin/loginAdmin";
import DashboardAdmin from "views/Admin/dashboardAdmin"
import CheckApplication from "views/Admin/CheckApplication";
import NewbornCheck from "views/Admin/checkAdmin/NewbornCheck";
import TableNewborn from "views/Admin/checkAdmin/TableNewborn";
import DeathCheck from "views/Admin/checkAdmin/DeathCheck";
import TableDeath from "views/Admin/checkAdmin/TableDeath";
import ICCheck from "views/Admin/checkAdmin/ICCheck";
import TableIC from "views/Admin/checkAdmin/TableIC";
import LaporanHarian from "views/Admin/LaporanHarian";
import AdminStatistic from "views/Admin/AdminStatistic"
import AdminStatisticNewborn from "views/Admin/AdminStatisticNewborn"
import AdminStatisticDeath from "views/Admin/AdminStatisticDeath";
import DigitalIDCard from "views/Citizen/DigitalCard";
import OcrUploader from "views/Citizen/OcrUploader";
import Kependudukan from "views/Board/Kependudukan";
import Kematian from "views/Board/Kematian";
import KelahiranBayi from "views/Board/KelahiranBayi";
import KadPengenalan from "views/Board/KadPengenalan";



// Route groups by layout
const routeGroups = {
  citizenMenu: {
    layout: "/citizenMenu",
    routes: [
      {
        path: "/index",
        name: "Dashboard",
        icon: "ni ni-tv-2 text-primary",
        component: <Index />,
      },
      {
        path: "/maps",
        name: "Pejabat JPN",
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
        path: "/statistic",
        name: "Statistik",
        icon: "ni ni-sound-wave text-lilac",
        component: <Statistic />,
      }
    ],
  },
  authCitizen: {
    layout: "/authCitizen",
    routes: [
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
  PlainCitizen: {
    layout: "/plainCitizen",
    routes: [
      {
        path: "/MenuUtama",
        name: "Menu Utama",
        icon: "ni ni-shop text-green",
        component: <MenuUtama />,
      },
    ],
  },
  Plain: {
    layout: "/plain",
    routes: [
      {
        path: "/card",
        name: "Digital Card",
        icon: "ni ni-card text-lilac",
        component: <DigitalIDCard />,
      },
      {
        path: "/ocr",
        name: "OCR UPLOADER",
        icon: "ni ni-card text-lilac",
        component: <OcrUploader />,
      },
      {
        path: "/kependudukan",
        name: "Kependudukan",
        icon: "ni ni-card text-lilac",
        component: <Kependudukan />,
      },
      {
        path: "/kematian",
        name: "Kematian",
        icon: "ni ni-card text-lilac",
        component: <Kematian />,
      },
      {
        path: "/kelahiran",
        name: "Kelahiran",
        icon: "ni ni-card text-lilac",
        component: <KelahiranBayi />,
      },
      {
        path: "/kadpengenalan",
        name: "Kad Pengenalan",
        icon: "ni ni-card text-lilac",
        component: <KadPengenalan />,
      },
    ],
  },
  applicationCitizen: {
    layout: "/applicationCitizen",
    routes: [
      {
        path: "/DeathApplication",
        name: "Pendaftaran Kematian",
        // icon: "ni ni-skull",
        component: <DeathApplication />,
      },
      {
        path: "/NewbornApplication",
        name: "Pendaftaran Bayi",
        // icon: "ni ni-infant",
        component: <NewbornApplication />,
      },
      {
        path: "/ICApplication",
        name: "Permohonan Kad Pengenalan",
        // icon: "ni ni-infant",
        component: <ICApplication />,
      },
    ],
  },
  authAdmin: {
    layout: "/authAdmin",
    routes: [
      {
        path: "/loginAdmin",
        name: "Log Keluar",
         icon: "ni ni-user-run",
        component: <AdminLogin />,
      },
    ],
  },
  StatisticAdmin: {
    layout: "/statistic",
    routes: [
      {
        path: "/statAdmin",
        name: "Statistik",
        icon: "ni ni-sound-wave text-green",
        component: <AdminStatistic />,
      },
      {
        path: "/statAdminNewborn",
        name: "Statistik",
        icon: "ni ni-sound-wave text-green",
        component: <AdminStatisticNewborn />,
      },
      {
        path: "/statAdminDeath",
        name: "Statistik",
        icon: "ni ni-sound-wave text-green",
        component: <AdminStatisticDeath />,
      }
    ],
  },

  adminMenu: {
    layout: "/adminMenu",
    routes: [
      {
        path: "/dashboard",
        name: "Dashboard",
         icon: "ni ni-laptop text-green",
        component: <DashboardAdmin />,
      },
      {
        path: "/laporan",
        name: "Laporan",
         icon: "ni ni-book-bookmark text-pink",
        component: <LaporanHarian />,
      },
    ],
  },

  adminApplication: {
    layout: "/adminApplication",
    routes: [
      {
        path: "/checkApplication",
        name: "Semak Permohonan",
         icon: "ni ni-check-bold text-blue",
        component: <CheckApplication />,
      },
      {
        path: "/checkNewborn",
        name: "Semak Permohonan Bayi",
         icon: "ni ni-check-bold text-blue",
        component: <NewbornCheck />,
      },
      {
        path: "/tableNewborn",
        name: "Senarai Permohonan Bayi",
         icon: "ni ni-check-bold text-blue",
        component: <TableNewborn />,
      },
      {
        path: "/checkDeath",
        name: "Senarai Permohonan Kematian",
         icon: "ni ni-check-bold text-blue",
        component: <DeathCheck />,
      },
      {
        path: "/tableDeath",
        name: "Senarai Permohonan Kematian",
         icon: "ni ni-check-bold text-blue",
        component: <TableDeath />,
      },
      {
        path: "/checkIC",
        name: "Senarai Permohonan IC",
         icon: "ni ni-check-bold text-blue",
        component: <ICCheck />,
      },
      {
        path: "/tableIC",
        name: "Senarai Permohonan IC",
         icon: "ni ni-check-bold text-blue",
        component: <TableIC />,
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