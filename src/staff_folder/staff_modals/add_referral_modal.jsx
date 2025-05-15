import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function AddReferralModal({ onClose, onRecordAdded }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    description: "",
    referral_date: "",
    approval_status: "Not Approved",
    patient_id: patientId || "",
    staff_id: "",
    full_name: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData((prev) => ({
        ...prev,
        staff_id: user.staff_id || "",
        full_name: `${user.first_name} ${user.last_name}`,
      }));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/add_referral.php", formData);
      alert("Referral record added successfully!");
      if (onRecordAdded) onRecordAdded(); // Optional callback to refresh list
      onClose();
    } catch (err) {
      console.error("Failed to add referral record:", err);
      alert("Error occurred while saving referral record.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          width: 400,
        }}
      >
        <h3>Add Referral Record</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Referral Date</label>
          <input
            type="date"
            name="referral_date"
            value={formData.referral_date}
            onChange={handleChange}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Status</label>
          <select name="approval_status" value={formData.approval_status} onChange={handleChange}>
            <option value="Not Approved">Not Approved</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div style={{ marginTop: 20 }}>
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddReferralModal;
