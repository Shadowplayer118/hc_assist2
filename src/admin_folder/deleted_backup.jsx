import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import AdminHeader from './AAA_admin_header';
import AddPatientModal from './admin_modals/add_patient_modal';
import EditPatientModal from "./admin_modals/edit_patient_modal";

function DeletedBackupTable() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [age, setAge] = useState("");
  const [purok, setPurok] = useState("");
  const [household, setHousehold] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null); // NEW: to hold data for Edit modal

  const [filterOptions, setFilterOptions] = useState({
    blood_types: [],
    ages: [],
    puroks: [],
    households: [],
  });

  useEffect(() => {
    const filters = {
      name,
      blood_type: bloodType,
      age,
      purok,
      household,
    };
    fetchPatients(filters);
  }, [name, bloodType, age, purok, household, patients]);



  const fetchPatients = async (filters = {}) => {
    try {
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_backup_patient.php", filters);
      setPatients(response.data.patients);
      setFilterOptions(response.data.filters);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  const handleEdit = (patientId) => {
    const patientToEdit = patients.find(p => p.patient_id === patientId);
    if (patientToEdit) {
      setSelectedPatient(patientToEdit); // Open modal with selected patient's data
    }
  };
  
  const handleCloseEditModal = () => {
    setSelectedPatient(null);
    fetchPatients(); // Refresh after edit
  };

  const handleDelete = async (recordId, targetTable) => {
    const confirmed = window.confirm(`Are you sure you want to permanently delete this ${targetTable} record? This action cannot be undone.`);
    if (!confirmed) return;
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user ? user.staff_id : "";
  
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/permanent_delete.php", {
        record_id: recordId,
        staff_id: staffId,
        target_table: targetTable
      });
  
      const data = response.data;
      if (data.success) {
        alert(`${targetTable} record permanently deleted.`);
        // Refresh list
      } else {
        alert("Delete failed: " + data.message);
      }
    } catch (err) {
      console.error("Permanent delete error:", err);
      alert("Failed to delete record.");
    }
  };
  

  const handleRestore = async (recordId, targetTable) => {
    const confirmed = window.confirm(`Are you sure you want to restore this ${targetTable} record?`);
    if (!confirmed) return;
  
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user ? user.staff_id : "";
  
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/restore_deleted.php", {
        record_id: recordId,
        staff_id: staffId,
        target_table: targetTable
      });
  
      const data = response.data;
      if (data.success) {
        alert(`${targetTable} record restored successfully.`);
        // Refresh logic
      } else {
        alert("Restore failed: " + data.message);
      }
    } catch (err) {
      console.error("Restore error:", err);
      alert("Failed to restore record.");
    }
  };
  
  
  return (
    <div>
          <li>
            <Link to="/admin_folder/activity_log" target='_blank'>Activity Log</Link>
          </li>
      <h2>Patient List</h2>

      <button onClick={() => setIsAddModalOpen(true)}>Add New Patient</button>
      {isAddModalOpen && (
        <AddPatientModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {selectedPatient && (
        <EditPatientModal
          patientData={selectedPatient}
          onClose={handleCloseEditModal}
        />
      )}

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search by Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {/* Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>
              <select value={purok} onChange={(e) => setPurok(e.target.value)}>
                <option value="">Purok</option>
                {filterOptions.puroks.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </th>
            <th>
              <select value={household} onChange={(e) => setHousehold(e.target.value)}>
                <option value="">Household</option>
                {filterOptions.households.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </th>
            <th>
              <select value={age} onChange={(e) => setAge(e.target.value)}>
                <option value="">Age</option>
                {filterOptions.ages.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </th>
            <th>
              <select value={bloodType} onChange={(e) => setBloodType(e.target.value)}>
                <option value="">Blood Type</option>
                {filterOptions.blood_types.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.patient_id}>
              <td>{patient.first_name + ' ' + patient.last_name}</td>
              <td>{patient.purok}</td>
              <td>{patient.household}</td>
              <td>{patient.age}</td>
              <td>{patient.blood_type}</td>
              <td>
              <button onClick={() => handleRestore(patient.patient_id, "patient")}>Restore</button>
              <button onClick={() => handleDelete(patient.patient_id, "patient")}>Permanently Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DeletedBackupTable;