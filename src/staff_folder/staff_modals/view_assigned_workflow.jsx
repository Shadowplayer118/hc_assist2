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
  const [localSteps, setLocalSteps] = useState([]);

  useEffect(() => {
    setLocalSteps(steps);
    fetchStaff();
  }, [steps]);

  const fetchStaff = async () => {
    try {
      const response = await axios.get("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/get_midwifestaff.php");
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
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/edit_assign_workflow.php",
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

  const handleCheckboxToggle = async (index) => {
    const step = localSteps[index];

    // Prevent checking if previous step is not completed
    if (index > 0 && localSteps[index - 1].is_completed !== "true") {
      alert("You must complete the previous step first.");
      return;
    }

    const newStatus = step.is_completed === "true" ? "false" : "true";

    try {
      await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/edit_progress.php", {
        prog_id: step.prog_id,
        is_completed: newStatus,
      });

      const updatedSteps = [...localSteps];
      updatedSteps[index].is_completed = newStatus;
      setLocalSteps(updatedSteps);
    } catch (err) {
      console.error("Failed to update step progress:", err);
      alert("Failed to update step progress.");
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
            readOnly
          />
        </div>

        <h4>Steps</h4>
        {Array.isArray(localSteps) && localSteps.length > 0 ? (
          localSteps.map((step, index) => (
            <div key={step.prog_id} style={{ marginBottom: "10px" }}>
              <label>
                <input
                  type="checkbox"
                  checked={step.is_completed === "true"}
                  disabled={index > 0 && localSteps[index - 1].is_completed !== "true"}
                  onChange={() => handleCheckboxToggle(index)}
                />{" "}
                {step.step_title} ({step.is_completed === "true" ? "✅ Completed" : "⏳ Pending"})
              </label>
            </div>
          ))
        ) : (
          <p>No steps available.</p>
        )}

        <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <button onClick={onClose}>Close</button>

        </div>
      </div>
    </div>
  );
}

export default ViewAssignedWorkflowModal;
