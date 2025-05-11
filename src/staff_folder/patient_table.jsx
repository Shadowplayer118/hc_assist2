import React, { useEffect, useState } from "react";
import axios from "axios";

import AddPatientModal from './staff_modals/add_patient_modal';
import EditPatientModal from "./staff_modals/edit_patient_modal";
import StaffHeader from "./AAA_staff_header";

function PatientTableStaff() {
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
      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/load_patients.php", filters);
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

  const handleDelete = async (patientId) => {

    const confirmed = window.confirm("Are you sure you want to delete this patient?");
    if (!confirmed) return;


    try {
      const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
      const staffId = user ? user.staff_id : ""; // wherever you're storing the logged-in staff
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_patients.php", {
        patient_id: patientId,
        staff_id: staffId
      });
      alert("Patient deleted.");
      // refresh list here
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete patient.");
    }
  };

  return (
    <div>

<StaffHeader />
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
                <button onClick={() => handleEdit(patient.patient_id)}>Edit</button>
                <button onClick={() => handleDelete(patient.patient_id)} style={{ marginLeft: "8px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTableStaff;