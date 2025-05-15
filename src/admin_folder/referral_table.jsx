import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddReferralModal from "./admin_modals/add_referral_modal";
import EditReferralModal from "./admin_modals/edit_referral_modal";
import "./Admin_CSS/Referral.css";

function ReferralTable() {
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
      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/load_referral.php", {
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
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_referral.php", {
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
    <div className="admin_patient_referral_container">
      <RecordsHeader patientId={patientId} />
      <h2>Referral Records</h2>

      {patientInfo && (
        <div className="admin_patient_referral_header">
          <img
            className="admin_patient_referral_image"
            src={`http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
          />
          <div>
            <h3 className="admin_patient_referral_patient_name">{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      <div className="admin_patient_referral_filter_section">
        <label className="admin_patient_referral_filter_label" htmlFor="startDate">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label className="admin_patient_referral_filter_label" htmlFor="endDate">End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Filter for approval status */}
      <div className="admin_patient_referral_filter_section">
        <label className="admin_patient_referral_filter_label" htmlFor="approvalStatus">Filter by Approval Status: </label>
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

      <button
        className="admin_patient_referral_add_button"
        onClick={() => setShowModal(true)}
      >
        Add New Referral
      </button>

      {showModal && (
        <AddReferralModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchReferralData}
        />
      )}

      <table className="admin_patient_referral_table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Referral Date</th>
            <th>Approval Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {referrals.map((record, index) => (
            <tr key={index}>
              <td>{record.description}</td>
              <td>{record.referral_date}</td>
              <td>{record.approval_status}</td>
              <td className="admin_patient_referral_actions">
                <button className="admin_patient_referral_edit_button" onClick={() => handleEdit(record.referral_id)}>Edit</button>
                <button className="admin_patient_referral_delete_button" onClick={() => handleDelete(record.referral_id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ReferralTable;
