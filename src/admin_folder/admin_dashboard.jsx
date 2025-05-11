import React from 'react';
import AdminHeader from './AAA_admin_header';
import { Link } from 'react-router-dom';
import GeneralReport from '../components/general_report';
import ComparativeData from '../components/comparative_data';
import Monitoring from '../components/monitoring';


const Admin = () => {
  return (
    <div>
      <AdminHeader />
      <h1 className="text-3xl font-bold my-4 text-center">Admin Page</h1>

      <ul className="mb-4 ml-6 list-disc">
        <li>
          <Link to="/admin_folder/activity_log" target="_blank" className="text-blue-600 underline">
            Activity Log
          </Link>
        </li>
      </ul>

      {/* ✅ Embed the GeneralReport component */}
      <GeneralReport />
      <ComparativeData />
      <Monitoring />
    </div>
  );
};

export default Admin;
