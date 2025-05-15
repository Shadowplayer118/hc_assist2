import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddImmunizationModal from "./admin_modals/add_immu_modal";
import EditImmunizationModal from "./admin_modals/edit_immu_modal";
import "./Admin_CSS/PatientRecords.css";

function ImmunizationTable() {
  const { patientId } = useParams();
  const [immunizations, setImmunizations] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchImmunizations();
  }, [patientId, startDate, endDate]);

  const fetchImmunizations = async () => {
    try {
      const response = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/load_immu.php",
        {
          patient_id: patientId,
          start_date: startDate,
          end_date: endDate,
        }
      );
      setImmunizations(response.data.immunizations || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch immunizations:", err);
    }
  };

  const handleEdit = (immuId) => {
    const recordToEdit = immunizations.find(record => record.immu_id === immuId);
    if (recordToEdit) setSelectedRecord(recordToEdit);
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchImmunizations();
  };

  const handleDelete = async (recordId) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user?.staff_id || "";
      await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/delete_immu.php",
        {
          record_id: recordId,
          staff_id: staffId,
        }
      );
      alert("Record deleted.");
      fetchImmunizations();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div className="admin_patient_container">
      <RecordsHeader patientId={patientId} />
      <h2 className="admin_patient_title">Immunization Records</h2>

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
        <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <label htmlFor="endDate">End Date:</label>
        <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {selectedRecord && (
        <EditImmunizationModal
          immunizationData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

      <button onClick={() => setShowModal(true)} className="admin_patient_add_button">
        Add New Record
      </button>

      {showModal && (
        <AddImmunizationModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchImmunizations}
        />
      )}

      <div className="admin_patient_table_wrapper">
        <table className="admin_patient_table">
          <thead>
            <tr>
              <th>Immunization Name</th>
              <th>Date Administered</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {immunizations.map((record, index) => (
              <tr key={index}>
                <td>{record.immu_name}</td>
                <td>{record.date_administered}</td>
                <td>
                  <button
                    onClick={() => handleEdit(record.immu_id)}
                    className="admin_patient_action_button edit"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(record.immu_id)}
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

export default ImmunizationTable;
