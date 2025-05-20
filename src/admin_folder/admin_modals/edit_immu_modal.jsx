import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditImmunizationModal({ onClose, immunizationData = null }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    immu_id: "",
    immu_name: "",
    date_administered: "",
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

    if (immunizationData) {
      setFormData((prev) => ({
        ...prev,
        ...immunizationData,
      }));
    }
  }, [immunizationData]);

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
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/edit_immu.php",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Immunization record updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating immunization record:", error);
      alert("Failed to update immunization record.");
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
        <h3>Edit Immunization</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Immunization Name</label>
          <input
            name="immu_name"
            value={formData.immu_name}
            onChange={handleChange}
            placeholder="e.g. Hepatitis B"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Date Administered</label>
          <input
            type="date"
            name="date_administered"
            value={formData.date_administered}
            onChange={handleChange}
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

export default EditImmunizationModal;
