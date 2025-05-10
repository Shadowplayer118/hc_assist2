import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function AddDiseaseModal({ onClose }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    disease_name: "",
    disease_status: "",
    date_recorded: "",
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
      const response = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/add_disease.php",
        formData
      );
      alert("Disease record added successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to add disease record:", err);
      alert("Error occurred while saving disease record.");
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
        <h3>Add Disease Record</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Disease Name</label>
          <input name="disease_name" value={formData.disease_name} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Disease Status</label>
          <select
            name="disease_status"
            value={formData.disease_status}
            onChange={handleChange}
          >
            <option value="">Select Status</option>
            <option value="Ongoing">Ongoing</option>
            <option value="Cured">Cured</option>
          </select>
        </div>

        {/* <div style={{ marginBottom: 10 }}>
          <label>Date Recorded</label>
          <input type="date" name="date_recorded" value={formData.date_recorded} onChange={handleChange} />
        </div> */}

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

export default AddDiseaseModal;
