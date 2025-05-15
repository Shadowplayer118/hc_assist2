import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import AddMedicalRecordModal from "./staff_modals/add_medical_record";
import EditMedicalRecordModal from "./staff_modals/edit_medical_record";
import RecordsHeader from "./AAA_records_header";
function MedicalRecordsTableStaff() {
  const { patientId } = useParams();
  const [records, setRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState(""); // Start date for filtering
  const [endDate, setEndDate] = useState(""); // End date for filtering
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Fetch medical records and patient info
  useEffect(() => {
    fetchMedicalData();
  }, [patientId, startDate, endDate, records]); // Fetch when patientId, startDate or endDate changes

  const fetchMedicalData = async () => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/load_medical_records.php", {
        patient_id: patientId,
        start_date: startDate,
        end_date: endDate,
      });

      setRecords(response.data.records || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch medical records:", err);
    }
  };

  // Handle Date Filter Changes
  const handleStartDateChange = (e) => {
    setStartDate(e.target.value);
  };

  const handleEndDateChange = (e) => {
    setEndDate(e.target.value);
  };

  // Handle Edit
  const handleEdit = (medicalId) => {
    const recordToEdit = records.find(record => record.medical_id === medicalId);
    if (recordToEdit) {
      setSelectedRecord(recordToEdit); // Open modal with selected record's data
    }
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchMedicalData(); // Refresh after edit
  };

  const handleDelete = async (recordId) => {

    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;


    try {
      const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
      const staffId = user ? user.staff_id : "";// wherever you're storing the logged-in staff
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_medical_record.php", {
        record_id: recordId,
        staff_id: staffId
      });
      alert("Record deleted.");
      // refresh list here
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

        <RecordsHeader patientId={patientId} />

      <h2>Medical Records</h2>

      {/* Patient Info with image and name */}
      {patientInfo && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={`http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            onError={(e) => {
              e.target.onerror = null; // Prevent infinite loop
              e.target.src = "http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
            style={{ width: "100px", height: "100px", borderRadius: "50%", marginRight: "20px" }}
          />
          <div>
            <h3>{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="startDate">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={handleStartDateChange}
        />
        <label htmlFor="endDate" style={{ marginLeft: "10px" }}>End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={handleEndDateChange}
        />
      </div>

      {/* Edit Medical Record Modal */}
      {selectedRecord && (
        <EditMedicalRecordModal
          medicalRecordData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Add Medical Record Modal */}
      <button onClick={() => setShowModal(true)} style={{ marginBottom: "15px" }}>
        Add Medical Record
      </button>

      {showModal && (
        <AddMedicalRecordModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchMedicalData}
        />
      )}

      {/* Medical Records Table */}
      <table border="1" cellPadding="8">
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
                <button onClick={() => handleEdit(record.medical_id)}>Edit</button>
                <button onClick={() => handleDelete(record.medical_id)} style={{ marginLeft: "8px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default MedicalRecordsTableStaff;
