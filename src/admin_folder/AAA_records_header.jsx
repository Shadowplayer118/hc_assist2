import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

function AdminHeader({ patientId }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const [gender, setGender] = useState("");

  useEffect(() => {
    const fetchPatientGender = async () => {
      try {
        const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/get_gender.php", {
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
    <header>
      <nav>
        <ul>
          {user ? (
            <>
              <li>
                <Link to={`/admin_folder/medical_record_table/${patientId}`}>
                  Medical 
                </Link>
              </li>
              <li>
                <Link to={`/admin_folder/disease_table/${patientId}`}>
                  Disease Record
                </Link>
              </li>
              <li>
                <Link to={`/admin_folder/immuni_table/${patientId}`}>
                  Immunization Record
                </Link>
              </li>
              <li>
                <Link to={`/admin_folder/referral_table/${patientId}`}>
                  Referrals
                </Link>
              </li>
              <li>
                <Link to={`/admin_folder/schedule_table/${patientId}`}>
                  Schedules
                </Link>
              </li>
              {gender === "Female" && (
                <li>
                  <Link to={`/admin_folder/pregnant_table/${patientId}`}>
                    Pregnant
                  </Link>
                </li>
              )}
              <li>
                <button onClick={() => window.close()}>Close</button>
              </li>
            </>
          ) : (
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
