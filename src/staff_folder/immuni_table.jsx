import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddImmunizationModal from "./staff_modals/add_immu_modal";
import EditImmunizationModal from "./staff_modals/edit_immu_modal";

function ImmunizationTableStaff() {
  const { patientId } = useParams();
  const [immunizations, setImmunizations] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchImmunizations();
  }, [patientId, startDate, endDate, immunizations]); 

  const fetchImmunizations = async () => {
    try {
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_immu.php", {
        patient_id: patientId,
        start_date: startDate,
        end_date: endDate,
      });

      setImmunizations(response.data.immunizations || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch immunizations:", err);
    }
  };

  const handleEdit = (immuId) => {
    const recordToEdit = immunizations.find(record => record.immu_id === immuId);
    if (recordToEdit) {
      setSelectedRecord(recordToEdit);
    }
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchImmunizations(); // Correct function name
  };

    const handleDelete = async (recordId) => {
  
      const confirmed = window.confirm("Are you sure you want to delete this record?");
      if (!confirmed) return;
  
  
      try {
        const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
        const staffId = user ? user.staff_id : "";// wherever you're storing the logged-in staff
        await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_immu.php", {
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
      <h2>Immunization Records</h2>

      {patientInfo && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={`https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
            style={{ width: "100px", height: "100px", borderRadius: "50%", marginRight: "20px" }}
          />
          <div>
            <h3>{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="startDate">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="endDate" style={{ marginLeft: "10px" }}>End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {selectedRecord && (
        <EditImmunizationModal
          immunizationData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

            {/* Add Modal Button */}
            <button onClick={() => setShowModal(true)} style={{ marginBottom: "15px" }}>
        Add New Record
      </button>

      {/* Add Modal */}
      {showModal && (
        <AddImmunizationModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchImmunizations}
        />
      )}

      <table border="1" cellPadding="8">
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
                <button onClick={() => handleEdit(record.immu_id)}>Edit</button>
                <button onClick={() => handleDelete(record.immu_id)} style={{ marginLeft: "8px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ImmunizationTableStaff;
