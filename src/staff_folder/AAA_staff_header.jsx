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

function StaffHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <header className="admin-header">
      <nav className="nav-container">
        <ul className="nav-list">
          {user ? (
            <div className="nav-list-inner">
              <li>
                <Link to="/staff_folder/staff">
                  <FaTachometerAlt /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/staff_folder/patient_table">
                  <FaUsers /> Patient
                </Link>
              </li>
              <li>
                <Link to="/staff_folder/med_table">
                  <FaPills /> Medicine
                </Link>
              </li>
              <li>
                <Link to="/staff_folder/workflow_board">
                  <FaProjectDiagram /> Workflow
                </Link>
              </li>
              <li>
                <Link to="/staff_folder/calendar">
                  <FaCalendarAlt /> Calendar
                </Link>
              </li>
              <li>
                
                <button className="logout-button" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </li>
            </div>
          ) : (
            <li>
              <Link to="/"><FaSignInAlt /> Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default StaffHeader;
