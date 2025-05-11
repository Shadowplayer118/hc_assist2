import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewAssignedWorkflowModal({ workflow, onClose }) {
  const {
    workflow_id,
    workflow_title,
    workflow_description,
    steps,
    staff_id,
    staff_name,
    staff_position,
    deadline,
    status,
    assign_id,
  } = workflow;

  const [updatedDeadline, setUpdatedDeadline] = useState(deadline);
  const [selectedStaff, setSelectedStaff] = useState(staff_id);
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost/hc_assist2/src/zbackend_folder/get_midwifestaff.php");
      if (response.data.success && Array.isArray(response.data.staff)) {
        setStaffList(response.data.staff);
      }
    } catch (err) {
      console.error("Failed to load staff list:", err);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const payload = {
        assign_id,
        staff_id: selectedStaff,
        deadline: updatedDeadline,
      };

      const response = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/edit_assign_workflow.php",
        payload
      );

      if (response.data.success) {
        alert("Workflow updated successfully.");
        onClose();
      } else {
        alert("Update failed.");
      }
    } catch (err) {
      console.error("Error updating workflow:", err);
      alert("An error occurred while saving changes.");
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
      <div style={{ background: "white", padding: 20, borderRadius: 8, width: 500 }}>
        <h3>Assigned Workflow Details</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Workflow Title</label>
          <input type="text" value={workflow_title} style={{ width: "100%" }} readOnly />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Description</label>
          <textarea value={workflow_description} rows={3} style={{ width: "100%" }} readOnly />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Assigned Staff</label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            style={{ width: "100%" }}
          >
            {staffList.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name} - {staff.position}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Status</label>
          <input type="text" value={status} style={{ width: "100%" }} readOnly />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Deadline</label>
          <input
            type="date"
            value={updatedDeadline}
            onChange={(e) => setUpdatedDeadline(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <h4>Steps</h4>
        {Array.isArray(steps) && steps.length > 0 ? (
          steps.map((step, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <input
                type="text"
                value={`${index + 1}. ${step.step_title} (${step.is_completed === "true" ? "✅ Completed" : "⏳ Pending"})`}
                style={{ width: "100%" }}
                readOnly
              />
            </div>
          ))
        ) : (
          <p>No steps available.</p>
        )}

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose}>Close</button>
          <button onClick={handleSaveChanges} style={{ backgroundColor: "#4CAF50", color: "white" }}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewAssignedWorkflowModal;
