import React from 'react';
import AdminHeader from './AAA_admin_header';
import { Link } from 'react-router-dom';
import GeneralReport from '../components/general_report';
import ComparativeData from '../components/comparative_data';
import Monitoring from '../components/monitoring';
import DiseaseMonitoring from '../components/disease_monitor';
import './Admin_CSS/Dashboard.css'

const Admin = () => {
  return (
    <div>
      <AdminHeader />

    <li>
      <Link to="/admin_folder/activity_log" target="_blank" className="activity-log-button">
        Activity Log
      </Link>
    </li>

      <div className="horizontal-container">
  <GeneralReport />
  <ComparativeData />
  <Monitoring />
  <DiseaseMonitoring />
</div>

      {/* ✅ Embed the GeneralReport component */}
      
    </div>
  );
};

export default Admin;
