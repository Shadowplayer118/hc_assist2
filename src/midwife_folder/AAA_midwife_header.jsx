import React from "react";
import { Link } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUsers,
  FaSignOutAlt,
  FaSignInAlt
} from "react-icons/fa";

function MidwifeHeader() {
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
                <Link to="/midwife_folder/midwife">
                  <FaTachometerAlt /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/midwife_folder/patient_table">
                  <FaUsers /> Patient
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

export default MidwifeHeader;
