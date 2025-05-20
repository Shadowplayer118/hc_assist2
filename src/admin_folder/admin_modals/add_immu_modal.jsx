import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function AddImmunizationModal({ onClose }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    immu_name: "",
    date_administered: "",
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
      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/add_immu.php",
        formData
      );
      alert("Immunization record added successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to add immunization record:", err);
      alert("Error occurred while saving immunization record.");
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
        <h3>Add Immunization Record</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Immunization Name</label>
          <input
            name="immu_name"
            value={formData.immu_name}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Date Administered</label>
          <input
            type="date"
            name="date_administered"
            value={formData.date_administered}
            onChange={handleChange}
          />
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

export default AddImmunizationModal;
