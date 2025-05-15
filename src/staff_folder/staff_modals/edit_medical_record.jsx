import React, { useState, useEffect } from "react";
import axios from "axios";

function EditMedicalRecordModal({ onClose, medicalRecordData = null }) {
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    blood_pressure: "",
    heart_rate: "",
    temperature: "",
    record_id: "",
    staff_id:"",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const staff_id = user ? user.staff_id : ""; // Get staff_id from the user object in localStorage
    setFormData((prev) => ({
      ...prev,
      staff_id, // Add staff_id to the formData
    }));
    
    if (medicalRecordData) {
      setFormData((prev) => ({
        ...prev,
        ...medicalRecordData, // Prefill values
      }));
    }
  }, [medicalRecordData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key]);
      });

      await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/edit_medical_record.php",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Medical record updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating medical record:", error);
      alert("Failed to update medical record.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
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
        <h3>Edit Medical Record</h3>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="weight">Weight (kg)</label>
          <input
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            placeholder="e.g. 70"
            type="number"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="height">Height (cm)</label>
          <input
            name="height"
            value={formData.height}
            onChange={handleChange}
            placeholder="e.g. 170"
            type="number"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="blood_pressure">Blood Pressure</label>
          <input
            name="blood_pressure"
            value={formData.blood_pressure}
            onChange={handleChange}
            placeholder="e.g. 120/80"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="heart_rate">Heart Rate (bpm)</label>
          <input
            name="heart_rate"
            value={formData.heart_rate}
            onChange={handleChange}
            placeholder="e.g. 75"
            type="number"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="temperature">Temperature (°C)</label>
          <input
            name="temperature"
            value={formData.temperature}
            onChange={handleChange}
            placeholder="e.g. 36.6"
            type="number"
            step="0.1"
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMedicalRecordModal;
