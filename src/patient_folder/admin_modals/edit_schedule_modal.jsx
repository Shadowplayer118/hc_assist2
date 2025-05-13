import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditScheduleModal({ onClose, scheduleData = null }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    sched_id: "",
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
    const staff_id = user ? user.staff_id : "";

    setFormData((prev) => ({
      ...prev,
      staff_id,
    }));

    if (scheduleData) {
      setFormData((prev) => ({
        ...prev,
        ...scheduleData,
      }));
    }
  }, [scheduleData]);

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
        "http://localhost/hc_assist2/src/zbackend_folder/edit_schedule.php",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Schedule record updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating schedule record:", error);
      alert("Failed to update schedule record.");
    }
  };

  const handleResolve = async () => {
    try {
      const updatedData = { ...formData, status: "done" };
      const formPayload = new FormData();
      Object.keys(updatedData).forEach((key) => {
        formPayload.append(key, updatedData[key]);
      });

      await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/edit_schedule.php", // This is the same endpoint, but it handles status updates too
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Schedule status updated to 'done'!");
      onClose();
    } catch (error) {
      console.error("Error resolving schedule:", error);
      alert("Failed to resolve schedule.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  // Get today's date in the format YYYY-MM-DD for min date validation
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
        <h3>Edit Schedule</h3>

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
            min={today} // Prevent past dates
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
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
          <button onClick={handleResolve} style={{ marginLeft: 10 }}>
            Resolve
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditScheduleModal;
