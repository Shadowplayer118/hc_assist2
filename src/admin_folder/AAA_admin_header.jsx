import React from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserMd,
  FaUsers,
  FaPills,
  FaProjectDiagram,
  FaCalendarAlt,
  FaSignOutAlt,
  FaSignInAlt,
} from "react-icons/fa";
import "./Admin_CSS/Header.css";

function AdminHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="admin-header">
      <nav className="nav-container">
        <ul className="nav-list">
          {user ? (
            <>
              <li><Link to="/admin_folder/admin"><FaTachometerAlt /> Dashboard</Link></li>
              <li><Link to="/admin_folder/staff_table"><FaUserMd /> Staff</Link></li>
              <li><Link to="/admin_folder/patient_table"><FaUsers /> Patient</Link></li>
              <li><Link to="/admin_folder/med_table"><FaPills /> Medicine</Link></li>
              <li><Link to="/admin_folder/workflow_board"><FaProjectDiagram /> Workflow</Link></li>
              <li><Link to="/admin_folder/calendar"><FaCalendarAlt /> Calendar</Link></li>
              <li>
                <button
                  className="logout-button"
                  onClick={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/";
                  }}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </>
          ) : (
            <li><Link to="/"><FaSignInAlt /> Login</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default AdminHeader;
