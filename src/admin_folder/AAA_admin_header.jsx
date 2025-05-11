import React from "react";
import { Link } from "react-router-dom";

function AdminHeader() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <header>
      <nav>
        <ul>
          {/* Only show links if the user is logged in */}
          {user ? (
            <>
              <li>
                <Link to="/admin_folder/admin">Dashboard</Link>
              </li>
              <li>
                <Link to="/admin_folder/staff_table">Staff</Link>
              </li>
              <li>
                <Link to="/admin_folder/patient_table">Patient</Link>
              </li>

              <li>
                <Link to="/admin_folder/med_table">Medicine</Link>
              </li>

              <li>
                <Link to="/admin_folder/workflow_board">Workflow</Link>
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

export default AdminHeader;
