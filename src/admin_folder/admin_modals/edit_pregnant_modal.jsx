import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditPregnantModal({ onClose, pregnantData = null }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    pregnant_id: "",
    start_date: "",
    due_date: "",
    status: "",
    father: "",
    father_contact: "",
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

    if (pregnantData) {
      setFormData((prev) => ({
        ...prev,
        ...pregnantData,
      }));
    }
  }, [pregnantData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const payload = new FormData();
      Object.keys(formData).forEach((key) => {
        payload.append(key, formData[key]);
      });

      await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/edit_pregnant.php",
        payload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Pregnancy record updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating pregnant record:", error);
      alert("Failed to update pregnancy record.");
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
        <h3>Edit Pregnancy Record</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="">Select Status</option>
            <option value="Pregnant">Pregnant</option>
            <option value="Born">Born</option>
            <option value="Miscarriage">Miscarriage</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Father's Name</label>
          <input
            name="father"
            value={formData.father}
            onChange={handleChange}
            placeholder="e.g. John Doe"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Father's Contact</label>
          <input
            name="father_contact"
            value={formData.father_contact}
            onChange={handleChange}
            placeholder="e.g. 09123456789"
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

export default EditPregnantModal;
