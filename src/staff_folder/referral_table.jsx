import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddReferralModal from "./staff_modals/add_referral_modal";
import EditReferralModal from "./staff_modals/edit_referral_modal";

function ReferralTableStaff() {
  const { patientId } = useParams();
  const [referrals, setReferrals] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [approvalStatusFilter, setApprovalStatusFilter] = useState(""); // New state for filtering

  useEffect(() => {
    fetchReferralData();
  }, [patientId, startDate, endDate, approvalStatusFilter]); // Added approvalStatusFilter to dependencies

  const fetchReferralData = async () => {
    try {
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_referral.php", {
        patient_id: patientId,
        start_date: startDate,
        end_date: endDate,
        approval_status: approvalStatusFilter, // Pass approval status filter
      });

      setReferrals(response.data.referrals || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch referral data:", err);
    }
  };

  const handleEdit = (referralId) => {
    const recordToEdit = referrals.find(record => record.referral_id === referralId);
    if (recordToEdit) {
      setSelectedRecord(recordToEdit);
    }
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchReferralData();
  };

  const handleDelete = async (recordId) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user ? user.staff_id : "";
      await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_referral.php", {
        record_id: recordId,
        staff_id: staffId
      });
      alert("Record deleted.");
      fetchReferralData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <RecordsHeader patientId={patientId} />
      <h2>Referral Records</h2>

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

      {/* Filter for approval status */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="approvalStatus">Filter by Approval Status: </label>
        <select
          id="approvalStatus"
          value={approvalStatusFilter}
          onChange={(e) => setApprovalStatusFilter(e.target.value)}
        >
          <option value="">All</option>
          <option value="Approved">Approved</option>
          <option value="Not Approved">Not Approved</option>
        </select>
      </div>

      {selectedRecord && (
        <EditReferralModal
          referralData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}

      <button onClick={() => setShowModal(true)} style={{ marginBottom: "15px" }}>
        Add New Referral
      </button>

      {showModal && (
        <AddReferralModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchReferralData}
        />
      )}

      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Description</th>
            <th>Referral Date</th>
            <th>
              Approval Status
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((record, index) => (
            <tr key={index}>
              <td>{record.description}</td>
              <td>{record.referral_date}</td>
              <td>{record.approval_status}</td>
              <td>
                <button onClick={() => handleEdit(record.referral_id)}>Edit</button>
                <button onClick={() => handleDelete(record.referral_id)} style={{ marginLeft: "8px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReferralTableStaff;
