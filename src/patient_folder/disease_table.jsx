import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddDiseaseModal from "./admin_modals/add_disease_modal";
import EditDiseaseModal from "./admin_modals/edit_disease_modal";

function DiseaseTablePatient() {
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user ? user.patient_id : "";
  const [diseaseRecords, setDiseaseRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchDiseaseData();
  }, [patientId, startDate, endDate, diseaseRecords]);

  const fetchDiseaseData = async () => {
    try {
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_disease.php", {
        patient_id: patientId,
        start_date: startDate,
        end_date: endDate,
      });

      setDiseaseRecords(response.data.disease || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch disease data:", err);
    }
  };

  const handleEdit = (diseaseId) => {
    const recordToEdit = diseaseRecords.find(record => record.disease_id === diseaseId);
    if (recordToEdit) {
      setSelectedRecord(recordToEdit);
    }
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchDiseaseData(); // Correct function name
  };

  const handleDelete = async (recordId) => {

    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;


    try {
      const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
      const staffId = user ? user.staff_id : "";// wherever you're storing the logged-in staff
      await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_disease.php", {
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
      <h2>Disease Records</h2>

      {/* Patient Info */}
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

      {/* Date Filter */}
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

      {/* Edit Modal */}
      {selectedRecord && (
        <EditDiseaseModal
          diseaseData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Add Modal Button */}

      {/* Add Modal */}
      {showModal && (
        <AddDiseaseModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchDiseaseData}
        />
      )}

      {/* Disease Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Disease Name</th>
            <th>Status</th>
            <th>Date Recorded</th>

          </tr>
        </thead>
        <tbody>
          {diseaseRecords.map((record, index) => (
            <tr key={index}>
              <td>{record.disease_name}</td>
              <td>{record.disease_status}</td>
              <td>{record.date_recorded}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DiseaseTablePatient;
