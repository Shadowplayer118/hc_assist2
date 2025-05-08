// admin_folder/Admin.jsx

import React from 'react';
import AdminHeader from './AAA_admin_header';
import { Link } from 'react-router-dom';

const Admin = () => {
  return (
    <div>

          <li>
            <Link to="/admin_folder/activity_log" target='_blank'>Activity Log</Link>
          </li>

      <AdminHeader />
      <h1>Admin Page</h1>
    </div>
  );
};

export default Admin;  // Default export
