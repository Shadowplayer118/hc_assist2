import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Admin from "./admin_folder/admin_dashboard";
import Staff from "./staff_folder/staff_dashboard";
import Midwife from "./midwife_folder/midwife_dashboard";
import Patient from "./patient_folder/patient_dashboard";


import StaffTable from "./admin_folder/staff_table";
import PatientTable from "./admin_folder/patient_table";
import ActivityLogTable from "./admin_folder/activity_log";
import DeletedBackupTable from "./admin_folder/deleted_backup";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  const user = JSON.parse(localStorage.getItem("user"));

  const getRedirectPath = () => {
    if (!user?.role) return null;
    switch (user.role) {
      case "admin": return "/admin_folder/admin";
      case "staff": return "/staff_folder/staff";
      case "midwife": return "/midwife_folder/midwife";
      case "patient": return "/patient_folder/patient";
      default: return null;
    }
  };

  const protectedRoutes = [
    { path: "/admin_folder/admin", element: <Admin /> },
    { path: "/staff_folder/staff", element: <Staff /> },
    { path: "/midwife_folder/midwife", element: <Midwife /> },
    { path: "/patient_folder/patient", element: <Patient /> },

    // Admin Routes
    { path: "/admin_folder/deleted_backup", element: <DeletedBackupTable /> },
    { path: "/admin_folder/activity_log", element: <ActivityLogTable /> },
    { path: "/admin_folder/staff_table", element: <StaffTable /> },
    { path: "/admin_folder/patient_table", element: <PatientTable /> },
    
  ];

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={user?.role ? <Navigate to={getRedirectPath()} replace /> : <Login />}
        />
        {protectedRoutes.map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={<PrivateRoute>{element}</PrivateRoute>}
          />
        ))}
      </Routes>
    </Router>
  );
}

export default AppRoutes;
