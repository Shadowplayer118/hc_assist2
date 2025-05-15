import React from 'react';
import StaffHeader from './AAA_staff_header';
import { Link } from 'react-router-dom';
import GeneralReport from '../components/general_report';
import ComparativeData from '../components/comparative_data';
import Monitoring from '../components/monitoring';
import DiseaseMonitoring from '../components/disease_monitor';
import './Admin_CSS/Dashboard.css'

const Staff = () => {
  return (
    <div>
      <StaffHeader />

    <li>
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

export default Staff;
