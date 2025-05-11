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
import MedTable from "./admin_folder/med_table";
import ExpiredStockViewer from "./admin_folder/expired_stock_table";
import MedicalRecordsTable from "./admin_folder/medical_record_table";
import DiseaseTable from "./admin_folder/disease_table";
import ImmunizationTable from "./admin_folder/immuni_table";
import ReferralTable from "./admin_folder/referral_table";
import ScheduleTable from "./admin_folder/schedule_table";
import PregnantTable from "./admin_folder/pregnant_table";
import WorkflowBoard from "./admin_folder/workflow_board";
import WorkflowAssignBoard from "./admin_folder/workflow_assigned_board";
import ScheduleCalendar from "./admin_folder/calendar";

import PatientTableStaff from "./staff_folder/patient_table";
import WorkflowBoardStaff from "./staff_folder/workflow_board";
import WorkflowAssignBoardStaff from "./staff_folder/workflow_assigned_board";

import PatientTableMidwife from "./midwife_folder/patient_table";

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
    { path: "/admin_folder/med_table", element: <MedTable /> },
    { path: "/admin_folder/expired_stock_table", element: <ExpiredStockViewer /> },
    { path: "/admin_folder/medical_record_table", element: <MedicalRecordsTable /> },
    { path: "/admin_folder/medical_record_table/:patientId", element: <MedicalRecordsTable /> },
    { path: "/admin_folder/disease_table", element: <DiseaseTable /> },
    { path: "/admin_folder/disease_table/:patientId", element: <DiseaseTable /> },
    { path: "/admin_folder/immuni_table", element: <ImmunizationTable /> },
    { path: "/admin_folder/immuni_table/:patientId", element: <ImmunizationTable /> },
    { path: "/admin_folder/referral_table", element: <ReferralTable /> },
    { path: "/admin_folder/referral_table/:patientId", element: <ReferralTable /> },
    { path: "/admin_folder/schedule_table", element: <ScheduleTable /> },
    { path: "/admin_folder/schedule_table/:patientId", element: <ScheduleTable /> },
    { path: "/admin_folder/pregnant_table", element: <PregnantTable /> },
    { path: "/admin_folder/pregnant_table/:patientId", element: <PregnantTable /> },
    { path: "/admin_folder/workflow_board", element: <WorkflowBoard /> },
    { path: "/admin_folder/workflow_assigned_board", element: <WorkflowAssignBoard /> },
    { path: "/admin_folder/calendar", element: <ScheduleCalendar /> },

    // Staff Routes
    { path: "/staff_folder/patient_table", element: <PatientTableStaff /> },
    { path: "/staff_folder/workflow_board", element: <WorkflowBoardStaff /> },
    { path: "/staff_folder/workflow_assigned_board", element: <WorkflowAssignBoardStaff /> },


    // Midwife Routes
    { path: "/midwife_folder/patient_table", element: <PatientTableMidwife /> },
    
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
