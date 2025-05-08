import React from "react";
import { Link } from "react-router-dom";

function MidwifeHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header>
      <nav>
        <ul>
          {/* Only show links if the user is logged in */}
          {user ? (
            <>
              <li>
                <Link to="/midwife_folder/midwife">Dashboard</Link>
              </li>
              
              <li>
                <Link to="/midwife_folder/patient_table">Patient</Link>
              </li>
             
              <li>
                <button
                  onClick={() => {
                    // Log out by removing the user from localStorage
                    localStorage.removeItem("user");
                    window.location.href = "/"; // Redirect to login page after logout
                  }}
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            // If not logged in, show login link
            <li>
              <Link to="/">Login</Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}

export default MidwifeHeader;
