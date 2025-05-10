import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function AddScheduleModal({ onClose, onRecordAdded }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    sched_type: "",
    status: "pending",
    sched_date: "",
    activity: "",
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
        "http://localhost/hc_assist2/src/zbackend_folder/add_schedule.php",
        formData
      );
      alert("Schedule record added successfully!");
      onRecordAdded(); // refresh table
      onClose();        // close modal
    } catch (err) {
      console.error("Failed to add schedule record:", err);
      alert("Error occurred while saving schedule record.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Get today's date in the format YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0];

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
        <h3>Add Schedule Record</h3>

        <div style={{ marginBottom: 10 }}>
          <label>Schedule Type</label>
          <select
            name="sched_type"
            value={formData.sched_type}
            onChange={handleChange}
          >
            <option value="">Select Type</option>
            <option value="check_up">Check-up</option>
            <option value="disease">Disease</option>
            <option value="immu">Immunization</option>
          </select>
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Date Scheduled</label>
          <input
            type="date"
            name="sched_date"
            value={formData.sched_date}
            onChange={handleChange}
            min={today} // Set max date to today
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <label>Activity</label>
          <textarea
            name="activity"
            value={formData.activity}
            onChange={handleChange}
            rows={3}
            style={{ width: "100%" }}
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

export default AddScheduleModal;
