import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function AddMedicalRecordModal({ onClose }) {
  const { patientId } = useParams(); // Get patient ID from the URL
  const [formData, setFormData] = useState({
    weight: "",
    height: "",
    blood_pressure: "",
    heart_rate: "",
    temperature: "",
    patient_id: patientId || "", // default if passed
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
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/add_medical_record.php", formData);
      alert("Medical record added successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to add medical record:", err);
      alert("Error occurred while saving medical record.");
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
        <h3>Add Medical Record</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Weight (kg)</label>
          <input name="weight" value={formData.weight} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Height (cm)</label>
          <input name="height" value={formData.height} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Blood Pressure</label>
          <input name="blood_pressure" value={formData.blood_pressure} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Heart Rate (bpm)</label>
          <input name="heart_rate" value={formData.heart_rate} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Temperature (°C)</label>
          <input name="temperature" value={formData.temperature} onChange={handleChange} />
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

export default AddMedicalRecordModal;
