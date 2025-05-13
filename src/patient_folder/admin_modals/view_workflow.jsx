import React, { useEffect, useState } from "react";
import axios from "axios";

function ViewWorkflowModal({ onClose, workflowData = null }) {
  const [workflow, setWorkflow] = useState({
    workflow_id: "",
    title: "",
    description: "",
    steps: [],
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (workflowData) {
      setWorkflow({ ...workflowData });
    }
  }, [workflowData]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setWorkflow((prev) => ({ ...prev, [name]: value }));
  };

  const handleStepChange = (index, value) => {
    const updatedSteps = [...workflow.steps];
    updatedSteps[index].step_title = value;
    setWorkflow((prev) => ({ ...prev, steps: updatedSteps }));
  };

  const handleAddStep = () => {
    setWorkflow((prev) => ({
      ...prev,
      steps: [
        ...prev.steps,
        {
          step_id: Date.now(), // Temporary unique ID
          step_title: "",
        },
      ],
    }));
  };

  const handleRemoveStep = (index) => {
    const updatedSteps = [...workflow.steps];
    updatedSteps.splice(index, 1);
    setWorkflow((prev) => ({ ...prev, steps: updatedSteps }));
  };

const handleSave = async () => {
      const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
      const staffId = user ? user.staff_id : "";
  try {
    const payload = {
      workflow_id: workflow.workflow_id,
      title: workflow.title,
      description: workflow.description,
      staff_id: staffId, // Replace with actual staff ID from auth/session
      steps: workflow.steps.map((step) => ({
      step_title: step.step_title,
      })),
    };

    const response = await axios.put("http://localhost/hc_assist2/src/zbackend_folder/edit_workflow.php", payload);

    if (response.data?.message) {
      alert("Workflow updated successfully.");
      setIsEditing(false);
    } else if (response.data?.error) {
      alert("Update failed: " + response.data.error);
    } else {
      alert("Unknown error occurred.");
    }
  } catch (error) {
    console.error("Error updating workflow:", error);
    alert("An error occurred while updating the workflow.");
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
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          width: 500,
          maxHeight: "90vh",
          overflowY: "auto",
        }}
      >
        <h3>{isEditing ? "Edit Workflow" : "View Workflow"}</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Title</label>
          <input
            name="title"
            value={workflow.title}
            onChange={handleChange}
            readOnly={!isEditing}
            style={{ width: "100%" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Description</label>
          <textarea
            name="description"
            value={workflow.description}
            onChange={handleChange}
            readOnly={!isEditing}
            rows={3}
            style={{ width: "100%", resize: "none" }}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Steps</label>
          <ol>
            {workflow.steps.length > 0 ? (
              workflow.steps.map((step, index) => (
                <li key={step.step_id} style={{ marginBottom: "5px" }}>
                  {isEditing ? (
                    <>
                      <input
                        value={step.step_title}
                        onChange={(e) =>
                          handleStepChange(index, e.target.value)
                        }
                        style={{ width: "80%" }}
                      />
                      <button onClick={() => handleRemoveStep(index)}>❌</button>
                    </>
                  ) : (
                    step.step_title
                  )}
                </li>
              ))
            ) : (
              <p>No steps available.</p>
            )}
          </ol>
          {isEditing && (
            <button onClick={handleAddStep} style={{ marginTop: 5 }}>
              ➕ Add Step
            </button>
          )}
        </div>

        <div style={{ marginTop: 10 }}>
          {isEditing ? (
            <button onClick={handleSave}>Save</button>
          ) : (
            <button onClick={() => setIsEditing(true)}>Edit</button>
          )}
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default ViewWorkflowModal;
