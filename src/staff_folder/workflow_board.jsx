import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffHeader from "./AAA_staff_header";
import ViewWorkflowModal from "./staff_modals/view_workflow";
import { Link } from "react-router-dom";

function WorkflowBoardStaff() {
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
      const response = await axios.get("http://localhost/hc_assist2/src/zbackend_folder/load_workflow.php");
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
          "http://localhost/hc_assist2/src/zbackend_folder/delete_workflow.php",
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
    <div>
      <StaffHeader />
      <h2>Workflow Manager</h2>

      <Link to="/staff_folder/workflow_assigned_board">Assigned Workflow</Link>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginTop: "20px" }}>
        {workflows.map(workflow => (
          <div
            key={workflow.workflow_id}
            style={{
              border: '1px solid #ccc',
              padding: '16px',
              width: '300px',
              borderRadius: '8px',
              boxShadow: '2px 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            <h3>{workflow.title}</h3>
            <p>{workflow.description}</p>
            <button onClick={() => handleViewWorkflow(workflow.workflow_id)}>View</button>

          </div>
        ))}
      </div>

      {selectedWorkflow && (
        <ViewWorkflowModal
          workflowData={selectedWorkflow}
          onClose={handleCloseViewModal}
        />
      )}

    </div>
  );
}

export default WorkflowBoardStaff;
