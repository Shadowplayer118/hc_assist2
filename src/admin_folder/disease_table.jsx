import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddDiseaseModal from "./admin_modals/add_disease_modal";
import EditDiseaseModal from "./admin_modals/edit_disease_modal";
import "./Admin_CSS/PatientRecords.css";

function DiseaseTable() {
  const { patientId } = useParams();
  const [diseaseRecords, setDiseaseRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchDiseaseData();
  }, [patientId, startDate, endDate]);

  const fetchDiseaseData = async () => {
    try {
      const response = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/load_disease.php",
        {
          patient_id: patientId,
          start_date: startDate,
          end_date: endDate,
        }
      );

      setDiseaseRecords(response.data.disease || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch disease data:", err);
    }
  };

  const handleStartDateChange = (e) => setStartDate(e.target.value);
  const handleEndDateChange = (e) => setEndDate(e.target.value);

  const handleEdit = (diseaseId) => {
    const recordToEdit = diseaseRecords.find((record) => record.disease_id === diseaseId);
    if (recordToEdit) setSelectedRecord(recordToEdit);
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchDiseaseData();
  };

  const handleDelete = async (recordId) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user?.staff_id || "";

      await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/delete_disease.php",
        {
          record_id: recordId,
          staff_id: staffId,
        }
      );
      alert("Record deleted.");
      fetchDiseaseData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="admin_patient_container">
      <RecordsHeader patientId={patientId} />
      <h2 className="admin_patient_title">Disease Records</h2>

      {patientInfo && (
        <div className="admin_patient_info">
          <img
            src={`http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            className="admin_patient_image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
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
        <EditDiseaseModal
          diseaseData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

      <button onClick={() => setShowModal(true)} className="admin_patient_add_button">
        Add Disease Record
      </button>

      {showModal && (
        <AddDiseaseModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchDiseaseData}
        />
      )}

      <div className="admin_patient_table_wrapper">
        <table className="admin_patient_table">
          <thead>
            <tr>
              <th>Disease Name</th>
              <th>Status</th>
              <th>Date Recorded</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {diseaseRecords.map((record, index) => (
              <tr key={index}>
                <td>{record.disease_name}</td>
                <td>{record.disease_status}</td>
                <td>{record.date_recorded}</td>
                <td>
                  <button
                    onClick={() => handleEdit(record.disease_id)}
                    className="admin_patient_action_button edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(record.disease_id)}
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

export default DiseaseTable;
