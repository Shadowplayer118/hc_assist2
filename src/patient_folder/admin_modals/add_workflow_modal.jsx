import React, { useState, useEffect } from "react";
import axios from "axios";

function AddWorkflowModal({ onClose }) {
  const [workflowTitle, setWorkflowTitle] = useState("");
  const [workflowDescription, setWorkflowDescription] = useState(""); // NEW
  const [steps, setSteps] = useState([{ step: "" }]);
  const [staffId, setStaffId] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFullName(`${user.first_name} ${user.last_name}`);
      setStaffId(user.staff_id);
    }
  }, []);

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
    try {
      const payload = {
        title: workflowTitle,
        description: workflowDescription, // NEW
        steps: steps.map((s) => s.step),
        created_by: fullName,
        staff_id: staffId,
      };

      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/add_workflow.php", payload);

      alert("Workflow added successfully!");
      onClose();
    } catch (error) {
      console.error("Error adding workflow:", error);
      alert("Failed to add workflow.");
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
        <h3>Add New Workflow</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Workflow Title</label>
          <input
            type="text"
            value={workflowTitle}
            onChange={(e) => setWorkflowTitle(e.target.value)}
            placeholder="Workflow Title"
            style={{ width: "100%" }}
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
            />
            {steps.length > 1 && (
              <button onClick={() => handleRemoveStep(index)} style={{ marginLeft: 8 }}>
                Remove
              </button>
            )}
          </div>
        ))}

        <button onClick={handleAddStep} style={{ marginBottom: 10 }}>
          Add Step
        </button>

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

export default AddWorkflowModal;
