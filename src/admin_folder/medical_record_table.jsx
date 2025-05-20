import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AddMedicalRecordModal from "./admin_modals/add_medical_record";
import EditMedicalRecordModal from "./admin_modals/edit_medical_record";
import RecordsHeader from "./AAA_records_header";
import "./Admin_CSS/PatientRecords.css";

function MedicalRecordsTable() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchMedicalData();
  }, [patientId, startDate, endDate, records]);

  const fetchMedicalData = async () => {
    try {
      const response = await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_medical_records.php",
        {
          patient_id: patientId,
          start_date: startDate,
          end_date: endDate,
        }
      );
      setRecords(response.data.records || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch medical records:", err);
    }
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const handleEdit = (medicalId) => {
    const recordToEdit = records.find((record) => record.medical_id === medicalId);
    if (recordToEdit) setSelectedRecord(recordToEdit);
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchMedicalData();
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user?.staff_id || "";

      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_medical_record.php",
        {
          record_id: recordId,
          staff_id: staffId,
        }
      );
      alert("Record deleted.");
      fetchMedicalData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="admin_patient_container">
      <RecordsHeader patientId={patientId} />
      <h2 className="admin_patient_title">Medical Records</h2>

      {patientInfo && (
        <div className="admin_patient_info">
          <img
            src={`https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            className="admin_patient_image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
          />
          <div className="admin_patient_name">
            <h3>{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      <div className="admin_patient_filters">
        <label htmlFor="startDate">Start Date:</label>
        <input type="date" id="startDate" value={startDate} onChange={handleStartDateChange} />
        <label htmlFor="endDate">End Date:</label>
        <input type="date" id="endDate" value={endDate} onChange={handleEndDateChange} />
      </div>

      {selectedRecord && (
        <EditMedicalRecordModal
          medicalRecordData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

      <button onClick={() => setShowModal(true)} className="admin_patient_add_button">
        Add Medical Record
      </button>

      {showModal && (
        <AddMedicalRecordModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchMedicalData}
        />
      )}

      <div className="admin_patient_table_wrapper">
        <table className="admin_patient_table">
          <thead>
            <tr>
              <th>Weight (kg)</th>
              <th>Height (cm)</th>
              <th>Blood Pressure</th>
              <th>Heart Rate (bpm)</th>
              <th>Temperature (°C)</th>
              <th>Date Recorded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr key={index}>
                <td>{record.weight}</td>
                <td>{record.height}</td>
                <td>{record.blood_pressure}</td>
                <td>{record.heart_rate}</td>
                <td>{record.temperature}</td>
                <td>{record.date_recorded}</td>
                <td>
                  <button
                    onClick={() => handleEdit(record.medical_id)}
                    className="admin_patient_action_button edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(record.medical_id)}
                    className="admin_patient_action_button delete"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedicalRecordsTable;
