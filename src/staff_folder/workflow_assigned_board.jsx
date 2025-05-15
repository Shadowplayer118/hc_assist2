import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffHeader from './AAA_staff_header';
import { Link } from "react-router-dom";
import ViewAssignedWorkflowModal from "./staff_modals/view_assigned_workflow";
import './Admin_CSS/AssignedWorkflow.css';  // Import the CSS

function WorkflowAssignBoard() {
  const [assignedWorkflows, setAssignedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

const user = JSON.parse(localStorage.getItem("user"));
const staffId = user ? user.staff_id : "";

useEffect(() => {
  if (staffId) {
    fetchAssignedWorkflows();
  }
}, [staffId]);

const fetchAssignedWorkflows = async () => {
  setLoading(true);
  setMessage(null);
  try {
    const response = await axios.get(
      `http://localhost/hc_assist2/src/zbackend_folder/load_workflow_assign_staff.php`,
      {
        params: { staff_id: staffId }
      }
    );

    if (response.data.success && Array.isArray(response.data.assignedWorkflows)) {
      setAssignedWorkflows(response.data.assignedWorkflows);
    } else {
      console.error("No workflows found in the response.");
    }
  } catch (err) {
    console.error("Error fetching assigned workflows:", err);
    setMessage({ type: "error", text: "Error fetching assigned workflows." });
  } finally {
    setLoading(false);
  }
};


  const handleViewWorkflow = (assignId) => {
    const selected = assignedWorkflows.find(wf => wf.assign_id === assignId);
    if (selected) setSelectedWorkflow(selected);
  };

  const handleCloseViewModal = () => {
    setSelectedWorkflow(null);
    fetchAssignedWorkflows();
  };

  const deleteAssignedWorkflow = async (workflow) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const staffId = user ? user.staff_id : "";

    if (window.confirm(`Are you sure you want to delete the assigned workflow "${workflow.workflow_title}"?`)) {
      const payload = {
        assign_id: workflow.assign_id,
        staff_id: staffId,
      };

      try {
        const response = await axios.post(
          "http://localhost/hc_assist2/src/zbackend_folder/delete_assign_workflow.php",
          payload
        );
        fetchAssignedWorkflows();
      } catch (err) {
        console.error("Failed to delete workflow:", err);
      }
    }
  };

  return (
    <div className="workflow-board-container">
      <StaffHeader />
      <h2 className="workflow-header">Assigned Workflows</h2>

      <Link to="/staff_folder/workflow_board" className="workflow-link">Workflow List</Link>

      {message && (
        <div className={`workflow-message ${message.type}`}>
          {message.text}
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div className="workflow-cards">
          {Array.isArray(assignedWorkflows) && assignedWorkflows.length > 0 ? (
            assignedWorkflows.map(workflow => (
              <div key={workflow.assign_id} className="workflow-card">
                <h3>{workflow.workflow_title}</h3>
                <p>{workflow.workflow_description}</p>
                <p><strong>Assigned Staff:</strong> {workflow.staff_name}</p>
                <p><strong>Position:</strong> {workflow.staff_position}</p>
                <p><strong>Deadline:</strong> {workflow.deadline}</p>
                <p><strong>Status:</strong> {workflow.status}</p>
                <button className="workflow-view-button" onClick={() => handleViewWorkflow(workflow.assign_id)}>View</button>
                <button className="workflow-delete-button" onClick={() => deleteAssignedWorkflow(workflow)}>Delete</button>
              </div>
            ))
          ) : (
            <p>No assigned workflows found.</p>
          )}
        </div>
      )}

      {selectedWorkflow && (
        <ViewAssignedWorkflowModal
          workflow={selectedWorkflow}
          onClose={handleCloseViewModal}
        />
      )}
    </div>
  );
}

export default WorkflowAssignBoard;
