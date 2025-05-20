import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PatientHeader from './AAA_patient_header';
import { Link, useNavigate } from "react-router-dom";
import './Admin_CSS/Dashboard.css';

const Patient = () => {
  const [patient, setPatient] = useState(null);
  const [latestRecord, setLatestRecord] = useState(null);
  const [hasAccepted, setHasAccepted] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user?.patient_id;

  useEffect(() => {
    if (!patientId) {
      console.error("No patient_id found in localStorage");
      return;
    }

    const fetchAcceptance = async () => {
      try {
        const response = await axios.post(
          "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/check_acceptance.php",
          { patient_id: patientId }
        );

        setHasAccepted(response.data.has_accepted === "true");
      } catch (err) {
        console.error("Error checking acceptance:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAcceptance();
  }, [patientId]);

  useEffect(() => {
    const fetchData = async () => {
      if (!hasAccepted || !patientId) return;

      try {
        const response = await axios.post(
          "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_logged_patient.php",
          { patient_id: patientId }
        );

        setPatient(response.data.patient);
        setLatestRecord(response.data.latest_medical_record);
      } catch (err) {
        console.error("Failed to fetch patient data:", err);
      }
    };

    fetchData();
  }, [hasAccepted, patientId]);

  const handleAccept = async () => {
    try {
      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/update_acceptance.php",
        { patient_id: patientId }
      );
      setHasAccepted(true);
    } catch (err) {
      console.error("Failed to update acceptance:", err);
    }
  };

  const handleDecline = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loader"></div>
        <p>Loading patient information...</p>
      </div>
    );
  }

  if (!hasAccepted) {
    return (
      <div className="full-screen-consent">
        <div className="consent-box">
          <h2>Confidentiality Agreement</h2>
          <div className="consent-icon">
            <i className="fas fa-shield-alt"></i>
          </div>
          <p>
            Before accessing your health records, you must acknowledge that you
            understand the importance of confidentiality and the laws protecting
            your health data.
          </p>
          <p>
            Do you accept the confidentiality agreement and agree to use this system
            responsibly?
          </p>
          <div className="consent-actions">
            <button className="btn-accept" onClick={handleAccept}>I Accept</button>
            <button className="btn-decline" onClick={handleDecline}>I Do Not Accept</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <PatientHeader />
      
      <div className="nav-section">
        <Link to="/patient_folder/medical_record_table" className="records-link">
          <i className="fas fa-file-medical"></i> View All Medical Records
        </Link>
        
      </div>

      {!patient ? (
        <div className="loading-card">
          <p>Loading patient data...</p>
        </div>
      ) : (
        <div className="patient-content">

          
          <div className="profile-container">
            <div className="profile-card">
              <div className="profile-header">
                <h2>Personal Information</h2>
              </div>
              
              <div className="profile-body">
                <div className="profile-image">
                  <img
                    src={`https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/${patient.patient_image}`}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
                    }}
                    alt="Patient"
                    className="patient-photo"
                  />
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <span className="detail-label">Full Name:</span>
                    <span className="detail-value">{patient.first_name} {patient.last_name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">{patient.age}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Gender:</span>
                    <span className="detail-value">{patient.gender}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Purok:</span>
                    <span className="detail-value">{patient.purok}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Blood Type:</span>
                    <span className="detail-value">{patient.blood_type}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Household:</span>
                    <span className="detail-value">{patient.household}</span>
                  </div>
                </div>
              </div>
            </div>

            {latestRecord && (
              <div className="medical-card">
                <div className="medical-header">
                  <h2>Latest Medical Record</h2>
                  <span className="record-date">{latestRecord.date_recorded}</span>
                </div>
                
                <div className="medical-body">
                  <div className="medical-metrics">
                    <div className="metric-item">
                      <div className="metric-value">{latestRecord.height}</div>
                      <div className="metric-label">Height (cm)</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{latestRecord.weight}</div>
                      <div className="metric-label">Weight (kg)</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{latestRecord.blood_pressure}</div>
                      <div className="metric-label">Blood Pressure</div>
                    </div>
                    <div className="metric-item">
                      <div className="metric-value">{latestRecord.temperature}</div>
                      <div className="metric-label">Temp (°C)</div>
                    </div>
                  </div>
                  
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Patient;