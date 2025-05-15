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


function PatientHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header className="admin-header">
      <nav className="nav-container">
        <ul className="nav-list">
          <img src="" alt="" />
          <li>HC-Assist</li>
          {user ? (
            <>
              <li><Link to="/patient_folder/patient"><FaTachometerAlt />Dashboard</Link></li>
              <li><Link to="/patient_folder/available_staff"><FaUserMd />Staff</Link></li>
              <li><Link to="/patient_folder/available_meds"><FaPills />Medicine</Link></li>
              <li><Link to="/patient_folder/calendar"><FaCalendarAlt />Calendar</Link></li>
              
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

export default PatientHeader;
