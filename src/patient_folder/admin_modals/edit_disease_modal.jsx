import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditDiseaseModal({ onClose, diseaseData = null }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    disease_id: "",
    disease_name: "",
    disease_status: "",
    staff_id: "",
    patient_id: patientId || "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const staff_id = user ? user.staff_id : "";

    setFormData((prev) => ({
      ...prev,
      staff_id,
    }));

    if (diseaseData) {
      setFormData((prev) => ({
        ...prev,
        ...diseaseData,
      }));
    }
  }, [diseaseData]);

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
        "http://localhost/hc_assist2/src/zbackend_folder/edit_disease.php",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Disease record updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating disease record:", error);
      alert("Failed to update disease record.");
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
        <h3>Edit Disease</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Disease Name</label>
          <input
            name="disease_name"
            value={formData.disease_name}
            onChange={handleChange}
            placeholder="e.g. Diabetes"
          />
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

export default EditDiseaseModal;
