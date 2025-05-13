import React, { useEffect, useState } from 'react';
import axios from 'axios';
import PatientHeader from './AAA_patient_header';
import { Link, useNavigate } from "react-router-dom";

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
          "http://localhost/hc_assist2/src/zbackend_folder/check_acceptance.php",
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
          "http://localhost/hc_assist2/src/zbackend_folder/load_logged_patient.php",
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
        "http://localhost/hc_assist2/src/zbackend_folder/update_acceptance.php",
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

  if (loading) return <p>Loading...</p>;

  if (!hasAccepted) {
    return (
      <div className="full-screen-consent">
        <div className="consent-box">
          <h2>Confidentiality Agreement</h2>
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
            <button onClick={handleAccept}>I Accept</button>
            <button onClick={handleDecline}>I Do Not Accept</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="staff-container">
      <PatientHeader />
      <li><Link to="/patient_folder/medical_record_table"> Medical Records</Link></li>
      <h1>My Profile & Medical Info</h1>

      {!patient ? (
        <p>Loading patient data...</p>
      ) : (
        <>
          <div className="profile-card">
            <h2>Personal Details</h2>
            <p><strong>Full Name:</strong> {patient.first_name} {patient.last_name}</p>
            <p><strong>Age:</strong> {patient.age}</p>
            <p><strong>Gender:</strong> {patient.gender}</p>
            <p><strong>Purok:</strong> {patient.purok}</p>
            <p><strong>Blood Type:</strong> {patient.blood_type}</p>
            <p><strong>Household:</strong> {patient.household}</p>
          </div>

          {latestRecord && (
            <div className="profile-card" style={{ marginTop: "30px" }}>
              <h2>Latest Medical Record</h2>
              <p><strong>Date Recorded:</strong> {latestRecord.date_recorded}</p>
              <p><strong>Height:</strong> {latestRecord.height} cm</p>
              <p><strong>Weight:</strong> {latestRecord.weight} kg</p>
              <p><strong>Blood Pressure:</strong> {latestRecord.bp}</p>
              <p><strong>Temperature:</strong> {latestRecord.temperature} °C</p>
              <p><strong>Remarks:</strong> {latestRecord.remarks}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Patient;
