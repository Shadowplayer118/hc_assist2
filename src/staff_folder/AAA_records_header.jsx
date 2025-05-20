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
  FaTimesCircle,
  FaSignInAlt
} from "react-icons/fa";

function RecordHeader({ patientId }) {
  const user = JSON.parse(localStorage.getItem("user"));
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
                <Link to={`/staff_folder/medical_record_table/${patientId}`}>
                  <FaFileMedical /> Medical
                </Link>
              </li>
              <li>
                <Link to={`/staff_folder/disease_table/${patientId}`}>
                  <FaHeartbeat /> Disease Record
                </Link>
              </li>
              <li>
                <Link to={`/staff_folder/immuni_table/${patientId}`}>
                  <FaSyringe /> Immunization Record
                </Link>
              </li>
              <li>
                <Link to={`/staff_folder/referral_table/${patientId}`}>
                  <FaShareAlt /> Referrals
                </Link>
              </li>
              <li>
                <Link to={`/staff_folder/schedule_table/${patientId}`}>
                  <FaCalendarAlt /> Schedules
                </Link>
              </li>
              {gender === "Female" && (
                <li>
                  <Link to={`/staff_folder/pregnant_table/${patientId}`}>
                    <FaBaby /> Pregnant
                  </Link>
                </li>
              )}
              <li>
                <button className="logout-button" onClick={() => window.close()}>
                  <FaTimesCircle /> Close
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

export default RecordHeader;
