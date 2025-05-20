import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  FaFileMedical,
  FaHeartbeat,
  FaSyringe,
  FaShareAlt,
  FaCalendarAlt,
  FaBaby,
  FaSignInAlt
} from "react-icons/fa";

function AdminHeader() {
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user ? user.patient_id : "";
  const [gender, setGender] = useState("");

  useEffect(() => {
    const fetchPatientGender = async () => {
      try {
        const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/get_gender.php", {
          patient_id: patientId,
        });

        if (response.data && response.data.gender) {
          setGender(response.data.gender);
        }
      } catch (error) {
        console.error("Failed to fetch patient gender:", error);
      }
    };

    if (patientId) {
      fetchPatientGender();
    }
  }, [patientId]);

  return (
    <header className="admin-header">
      <nav className="nav-container">
        <ul className="nav-list">
          {user ? (
            <div className="nav-list-inner">
              <li>
                <Link to={`/patient_folder/medical_record_table`}>
                  <FaFileMedical /> Medical
                </Link>
              </li>
              <li>
                <Link to={`/patient_folder/disease_table`}>
                  <FaHeartbeat /> Disease Record
                </Link>
              </li>
              <li>
                <Link to={`/patient_folder/immuni_table`}>
                  <FaSyringe /> Immunization Record
                </Link>
              </li>
              <li>
                <Link to={`/patient_folder/referral_table`}>
                  <FaShareAlt /> Referrals
                </Link>
              </li>
              <li>
                <Link to={`/patient_folder/schedule_table`}>
                  <FaCalendarAlt /> Schedules
                </Link>
              </li>
              {gender === "Female" && (
                <li>
                  <Link to={`/admin_folder/pregnant_table`}>
                    <FaBaby /> Pregnant
                  </Link>
                </li>
              )}
              <li>
                <Link to="/patient_folder/patient" className="logout-button">
                  <FaSignInAlt /> Back
                </Link>
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

export default AdminHeader;
