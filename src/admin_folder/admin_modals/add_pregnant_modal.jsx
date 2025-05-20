import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function AddPregnantModal({ onClose }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    start_date: "",
    due_date: "",
    second_trimester: "",
    third_trimester: "",
    status: "",
    father: "",
    father_contact: "",
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

  const autoCompleteFields = () => {
    if (!formData.start_date) return;

    const startDate = new Date(formData.start_date);
    const dueDate = new Date(startDate);
    dueDate.setDate(startDate.getDate() + 280); // 40 weeks

    const secondTrimester = new Date(startDate);
    secondTrimester.setDate(startDate.getDate() + 91); // approx start of 2nd trimester

    const thirdTrimester = new Date(startDate);
    thirdTrimester.setDate(startDate.getDate() + 182); // approx start of 3rd trimester

    const today = new Date();
    let status = "";

    if (today < secondTrimester) {
      status = "1st Trimester";
    } else if (today < thirdTrimester) {
      status = "2nd Trimester";
    } else if (today < dueDate) {
      status = "3rd Trimester";
    } else {
      status = "Born";
    }

    setFormData((prev) => ({
      ...prev,
      due_date: dueDate.toISOString().slice(0, 10),
      second_trimester: secondTrimester.toISOString().slice(0, 10),
      third_trimester: thirdTrimester.toISOString().slice(0, 10),
      status: status,
    }));
  };

  const handleSubmit = async () => {
    try {
      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/add_pregnant.php",
        formData
      );
      alert("Pregnancy record added successfully!");
      onClose();
    } catch (err) {
      console.error("Failed to add pregnancy record:", err);
      alert("Error occurred while saving pregnancy record.");
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
        <h3>Add Pregnancy Record</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Start Date</label>
          <input
            type="date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        {formData.start_date && (
          <div style={{ marginBottom: 10 }}>
            <button onClick={autoCompleteFields}>Auto Complete</button>
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <label>Due Date</label>
          <input
            type="date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>2nd Trimester Date</label>
          <input
            type="date"
            name="second_trimester"
            value={formData.second_trimester}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>3rd Trimester Date</label>
          <input
            type="date"
            name="third_trimester"
            value={formData.third_trimester}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Status</label>
          <select name="status" value={formData.status} onChange={handleChange}>
            <option value="">Select Status</option>
            <option value="1st Trimester">1st Trimester</option>
            <option value="2nd Trimester">2nd Trimester</option>
            <option value="3rd Trimester">3rd Trimester</option>
            <option value="born">Born</option>
            <option value="Miscarriage">Miscarriage</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Father's Name</label>
          <input
            type="text"
            name="father"
            value={formData.father}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Father's Contact</label>
          <input
            type="text"
            name="father_contact"
            value={formData.father_contact}
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

export default AddPregnantModal;
