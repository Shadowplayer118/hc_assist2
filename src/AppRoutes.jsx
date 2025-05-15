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
import MedicalRecordsTableStaff from "./staff_folder/medical_record_table";
import DiseaseTableStaff from "./staff_folder/disease_table";
import ImmunizationTableStaff from "./staff_folder/immuni_table";
import ReferralTableStaff from "./staff_folder/referral_table";
import ScheduleTableStaff from "./staff_folder/schedule_table";
import MedTableStaff from "./staff_folder/med_table";
import CalendarStaff from "./staff_folder/calendar";


import PatientTableMidwife from "./midwife_folder/patient_table";



import StaffBoard from "./patient_folder/available_staff";
import MedBoard from "./patient_folder/available_meds";
import PatientCalendar from "./patient_folder/calendar";
import MedicalRecordsTablePatient from "./patient_folder/medical_record_table";
import DiseaseTablePatient from "./patient_folder/disease_table";
import ImmunizationTablePatient from "./patient_folder/immuni_table";
import ReferralTablePatient from "./patient_folder/referral_table";
import ScheduleTablePatient from "./patient_folder/schedule_table";

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
    { path: "/staff_folder/medical_record_table", element: <MedicalRecordsTable /> },
    { path: "/staff_folder/medical_record_table/:patientId", element: <MedicalRecordsTableStaff /> },
    { path: "/staff_folder/disease_table", element: <DiseaseTableStaff /> },
    { path: "/staff_folder/disease_table/:patientId", element: <DiseaseTableStaff /> },
    { path: "/staff_folder/immuni_table", element: <ImmunizationTableStaff /> },
    { path: "/staff_folder/immuni_table/:patientId", element: <ImmunizationTableStaff /> },
    { path: "/staff_folder/referral_table", element: <ReferralTableStaff /> },
    { path: "/staff_folder/referral_table/:patientId", element: <ReferralTableStaff /> },
    { path: "/staff_folder/schedule_table", element: <ScheduleTableStaff /> },
    { path: "/staff_folder/schedule_table/:patientId", element: <ScheduleTableStaff /> },
    { path: "/staff_folder/med_table", element: <MedTableStaff /> },
    { path: "/staff_folder/calendar", element: <CalendarStaff /> },



    // Midwife Routes
    { path: "/midwife_folder/patient_table", element: <PatientTableMidwife /> },

    // Patient Routes

    { path: "/patient_folder/available_staff", element: <StaffBoard /> },
    { path: "/patient_folder/available_meds", element: <MedBoard /> },
    { path: "/patient_folder/calendar", element: <PatientCalendar /> },
    { path: "/patient_folder/medical_record_table", element: <MedicalRecordsTablePatient /> },
    { path: "/patient_folder/disease_table", element: <DiseaseTablePatient /> },
    { path: "/patient_folder/immuni_table", element: <ImmunizationTablePatient /> },
    { path: "/patient_folder/referral_table", element: <ReferralTablePatient /> },
    { path: "/patient_folder/schedule_table", element: <ScheduleTablePatient /> },
    
    
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
