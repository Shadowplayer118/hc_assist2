import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffHeader from './AAA_staff_header';
import ViewWorkflowModal from "./staff_modals/view_workflow";
import AddWorkflowModal from "./staff_modals/add_workflow_modal";
import AddAssignedWorkflowModal from "./staff_modals/add_assign_workflow_modal";
import { Link } from "react-router-dom";
import './Admin_CSS/Workflow.css';

function WorkflowBoard() {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [workflowToAssign, setWorkflowToAssign] = useState(null);

  const STAFF_ID = 1; // Replace with actual logged-in admin ID

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await axios.get("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_workflow.php");
      setWorkflows(response.data.workflows);
    } catch (err) {
      console.error("Error fetching workflows:", err);
    }
  };

  const handleViewWorkflow = (workflowId) => {
    const selected = workflows.find(wf => wf.workflow_id === workflowId);
    if (selected) setSelectedWorkflow(selected);
  };

  const handleCloseViewModal = () => {
    setSelectedWorkflow(null);
    fetchWorkflows();
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    fetchWorkflows();
  };

  const handleCloseAssignModal = () => {
    setShowAssignModal(false);
    setWorkflowToAssign(null);
  };

  const deleteWorkflow = async (workflow) => {
    if (window.confirm(`Are you sure you want to delete workflow "${workflow.title}"?`)) {
      try {
        const payload = {
          workflow_id: workflow.workflow_id,
          staff_id: STAFF_ID,
          title: workflow.title
        };

        const response = await axios.post(
          "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_workflow.php",
          payload
        );

        if (response.data.message) {
          alert("Workflow deleted successfully.");
          fetchWorkflows();
        } else {
          alert("Delete failed: " + (response.data.error || "Unknown error."));
        }
      } catch (err) {
        console.error("Error deleting workflow:", err);
        alert("An error occurred while deleting.");
      }
    }
  };

  return (
    <div className="workflow-container">
      <StaffHeader />

      <button className="add-button" onClick={() => setShowAddModal(true)}>
        + Add New Workflow
      </button>

      <Link to="/staff_folder/workflow_assigned_board" className="link">Assigned Workflow</Link>

      <div className="workflow-card-container">
        {workflows.map(workflow => (
          <div key={workflow.workflow_id} className="workflow-card">
            <h3>{workflow.title}</h3>
            <p>{workflow.description}</p>
            <button className="workflow-view-button" onClick={() => handleViewWorkflow(workflow.workflow_id)}>View</button>
            <button className="workflow-assign-button" onClick={() => { setWorkflowToAssign(workflow); setShowAssignModal(true); }}>Assign</button>
            <button className="workflow-delete-button" onClick={() => deleteWorkflow(workflow)}>Delete</button>
          </div>
        ))}
      </div>

      {selectedWorkflow && (
        <ViewWorkflowModal workflowData={selectedWorkflow} onClose={handleCloseViewModal} />
      )}

      {showAddModal && (
        <AddWorkflowModal onClose={handleCloseAddModal} />
      )}

      {workflowToAssign && showAssignModal && (
        <AddAssignedWorkflowModal workflow={workflowToAssign} onClose={handleCloseAssignModal} />
      )}
    </div>
  );
}

export default WorkflowBoard;
