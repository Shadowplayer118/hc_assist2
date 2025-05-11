import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffHeader from "./AAA_staff_header";
import { Link } from "react-router-dom";
import ViewAssignedWorkflowModal from "./staff_modals/view_assigned_workflow";

function WorkflowAssignBoardStaff() {
  const [assignedWorkflows, setAssignedWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);  // Loading state
  const [message, setMessage] = useState(null);    // Message for success/error

  const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
  const staffId = user ? user.staff_id : "";// Replace with the actual logged-in admin ID

  useEffect(() => {
    fetchAssignedWorkflows();
  }, []);

  // Fetch workflows assigned to staff
const fetchAssignedWorkflows = async () => {
  setLoading(true);
  setMessage(null); // Clear previous message
  try {
    const response = await axios.post(
      "http://localhost/hc_assist2/src/zbackend_folder/load_workflow_assign_staff.php",
      { staff_id: staffId } // Pass staffId as payload
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
    fetchAssignedWorkflows(); // Refresh after viewing
  };

  // Soft delete workflow
const deleteAssignedWorkflow = async (workflow) => {
  const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
  const staffId = user ? user.staff_id : "";

  // Confirm the delete action
  if (window.confirm(`Are you sure you want to delete the assigned workflow "${workflow.workflow_title}"?`)) {
    const payload = {
      assign_id: workflow.assign_id, 
      staff_id: staffId, // Only pass the assign_id
    };


      const response = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/delete_assign_workflow.php", // Updated PHP file
        payload
      );


  }
};



  return (
    <div>
      <StaffHeader />
      <h2>Assigned Workflows</h2>

      <Link to="/staff_folder/workflow_board">Workflow List</Link>

      {message && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          backgroundColor: message.type === "success" ? 'green' : 'red',
          color: 'white',
          borderRadius: '5px'
        }}>
          {message.text}
        </div>
      )}

      {loading ? <p>Loading...</p> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {Array.isArray(assignedWorkflows) && assignedWorkflows.length > 0 ? (
            assignedWorkflows.map(workflow => (
              <div
                key={workflow.assign_id}
                style={{
                  border: '1px solid #ccc',
                  padding: '16px',
                  width: '300px',
                  borderRadius: '8px',
                  boxShadow: '2px 2px 6px rgba(0,0,0,0.1)'
                }}
              >
                <h3>{workflow.workflow_title}</h3>
                <p>{workflow.workflow_description}</p>
                <p><strong>Assigned Staff:</strong> {workflow.staff_name}</p>
                <p><strong>Position:</strong> {workflow.staff_position}</p>
                <p><strong>Deadline:</strong> {workflow.deadline}</p>
                <p><strong>Status:</strong> {workflow.status}</p>
                <button onClick={() => handleViewWorkflow(workflow.assign_id)}>View</button>
                <button onClick={() => deleteAssignedWorkflow(workflow)} style={{ marginLeft: "10px", color: "red" }}>
                  Delete
                </button>
              </div>
            ))
          ) : (
            <p>No assigned workflows found.</p>
          )}
        </div>
      )}

      {/* Show ViewAssignedWorkflowModal if selectedWorkflow is not null */}
      {selectedWorkflow && (
        <ViewAssignedWorkflowModal
          workflow={selectedWorkflow}
          onClose={handleCloseViewModal}
        />
      )}
    </div>
  );
}

export default WorkflowAssignBoardStaff;
