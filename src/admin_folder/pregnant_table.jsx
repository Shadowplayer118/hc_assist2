import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddPregnantModal from "./admin_modals/add_pregnant_modal";
import EditPregnantModal from "./admin_modals/edit_pregnant_modal";

function PregnantTable() {
  const { patientId } = useParams();
  const [pregnantRecords, setPregnantRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchPregnantData();
  }, [patientId, startDate, endDate. pregnant]);

  const fetchPregnantData = async () => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/load_pregnant.php", {
        patient_id: patientId,
        start_date: startDate,
        end_date: endDate,
      });

      setPregnantRecords(response.data.pregnant || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch pregnant data:", err);
    }
  };

  const handleEdit = (pregnantId) => {
    const recordToEdit = pregnantRecords.find(record => record.pregnant_id === pregnantId);
    if (recordToEdit) {
      setSelectedRecord(recordToEdit);
    }
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchPregnantData();
  };

  const handleDelete = async (recordId) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user ? user.staff_id : "";
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_pregnant.php", {
        record_id: recordId,
        staff_id: staffId,
      });
      alert("Record deleted.");
      fetchPregnantData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  // Check if there's an active pregnancy (not 'born')
  const hasActivePregnancy = pregnantRecords.some(
    (record) => record.status.toLowerCase() !== "born"
  );

  return (
    <div style={{ padding: "20px" }}>
      <RecordsHeader patientId={patientId} />
      <h2>Pregnant Records</h2>

      {/* Patient Info */}
      {patientInfo && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={`http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
            style={{ width: "100px", height: "100px", borderRadius: "50%", marginRight: "20px" }}
          />
          <div>
            <h3>{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      {/* Add Modal Button or Notice */}
      {!hasActivePregnancy ? (
        <button onClick={() => setShowModal(true)} style={{ marginBottom: "15px" }}>
          Add New Record
        </button>
      ) : (
        <p style={{ color: "red", marginBottom: "15px" }}>
          Cannot add a new pregnancy record while one is still active.
        </p>
      )}

            {/* Edit Modal */}
            {selectedRecord && (
              <EditPregnantModal
                pregnantData={selectedRecord}
                onClose={handleCloseEditModal}
              />
            )}

      {/* Add Modal */}
      {showModal && (
        <AddPregnantModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchPregnantData}
        />
      )}

      {/* Pregnancy Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Start Date</th>
            <th>Due Date</th>
            <th>Status</th>
            <th>Father</th>
            <th>Father Contact</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pregnantRecords.map((record, index) => (
            <tr key={index}>
              <td>{record.start_date}</td>
              <td>{record.due_date}</td>
              <td>{record.status}</td>
              <td>{record.father}</td>
              <td>{record.father_contact}</td>
              <td>
                <button onClick={() => handleEdit(record.pregnant_id)}>Edit</button>
                <button onClick={() => handleDelete(record.pregnant_id)} style={{ marginLeft: "8px" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PregnantTable;
