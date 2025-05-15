import React, { useState, useEffect } from "react";
import axios from "axios";

function AddAssignedWorkflowModal({ workflow, onClose }) {
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState("");
  const [steps, setSteps] = useState([{ step: "" }]);
  const [staffList, setStaffList] = useState([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [deadline, setDeadline] = useState(""); // New state for deadline

  useEffect(() => {
    if (workflow) {
      setWorkflowTitle(workflow.title);
      setWorkflowDescription(workflow.description);
      setSteps(workflow.steps.map(step => ({ step: step.step_title })));
    }

    fetchMidwifeStaff(); // Fetch midwife staff list
  }, [workflow]);

  const fetchMidwifeStaff = async () => {
    try {
      const response = await axios.get("http://localhost/hc_assist2/src/zbackend_folder/get_midwifestaff.php");
      setStaffList(response.data.staff || []);
    } catch (err) {
      console.error("Error fetching staff:", err);
      alert("Failed to load staff list.");
    }
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...steps];
    updatedSteps[index].step = value;
    setSteps(updatedSteps);
  };

  const handleAddStep = () => {
    setSteps([...steps, { step: "" }]);
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleSubmit = async () => {
    if (!workflowTitle || !workflowDescription || !selectedStaffId || !deadline) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const payload = {
        title: workflowTitle,
        description: workflowDescription,
        steps: steps.map(s => s.step),
        staff_id: selectedStaffId,
        workflow_id: workflow.workflow_id,
        deadline, // Include deadline in payload
      };

      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/add_assign_workflow.php", payload);

      alert("Assigned workflow added successfully!");
      onClose();
    } catch (error) {
      console.error("Error assigning workflow:", error);
      alert("Failed to assign workflow.");
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
        <h3>Assign New Workflow</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Workflow Title</label>
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            placeholder="Workflow Title"
            style={{ width: "100%" }}
            readOnly
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Description</label>
          <textarea
            value={workflowDescription}
            onChange={(e) => setWorkflowDescription(e.target.value)}
            placeholder="Workflow Description"
            rows={3}
            style={{ width: "100%" }}
            readOnly
          />
        </div>

        <h4>Steps</h4>
        {steps.map((step, index) => (
          <div key={index} style={{ marginBottom: "10px", display: "flex", alignItems: "center" }}>
            <input
              type="text"
              value={step.step}
              onChange={(e) => handleStepChange(index, e.target.value)}
              placeholder={`Step ${index + 1}`}
              style={{ flex: 1 }}
              readOnly
            />
          </div>
        ))}

        <div style={{ marginBottom: "10px" }}>
          <label>Select Staff</label>
          <select
            value={selectedStaffId}
            onChange={(e) => setSelectedStaffId(e.target.value)}
            style={{ width: "100%" }}
          >
            <option value="">-- Select Staff --</option>
            {staffList.map((staff) => (
              <option key={staff.staff_id} value={staff.staff_id}>
                {staff.full_name} - {staff.position}
              </option>
            ))}
          </select>
        </div>

        {/* New Input Field for Deadline */}
        <div style={{ marginBottom: "10px" }}>
          <label>Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>Submit</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddAssignedWorkflowModal;
