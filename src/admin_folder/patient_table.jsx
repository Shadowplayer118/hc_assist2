import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaEdit, FaTrash, FaEye } from "react-icons/fa"; // Import the icons from react-icons
import AdminHeader from './AAA_admin_header';
import AddPatientModal from './admin_modals/add_patient_modal';
import EditPatientModal from "./admin_modals/edit_patient_modal";
import './Admin_CSS/StaffTable.css';


function PatientTable() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState("");
  const [bloodType, setBloodType] = useState("");
  const [age, setAge] = useState("");
  const [purok, setPurok] = useState("");
  const [household, setHousehold] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);

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
  }, [name, bloodType, age, purok, household]);

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
      setSelectedPatient(patientToEdit);
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
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user ? user.staff_id : "";
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_patients.php", {
        patient_id: patientId,
        staff_id: staffId
      });
      alert("Patient deleted.");
      fetchPatients(); // Refresh list after deletion
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete patient.");
    }
  };

  return (
    <div className="staff-container">
      <AdminHeader />

      <button className="add-button" onClick={() => setIsAddModalOpen(true)}>Add New Patient</button>
      {isAddModalOpen && <AddPatientModal onClose={() => setIsAddModalOpen(false)} />}

      {selectedPatient && (
        <EditPatientModal
          patientData={selectedPatient}
          onClose={handleCloseEditModal}
        />
      )}

      <div style={{ marginBottom: "20px" }}>
        <input
          className="search-input"
          type="text"
          placeholder="Search by Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div className="table-wrapper">
        <table className="staff-table">
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
                  {/* Edit Button with FaEdit Icon */}
                  <button className="icon-button edit-button" onClick={() => handleEdit(patient.patient_id)}>
                    <FaEdit />
                  </button>

                  {/* Delete Button with FaTrash Icon */}
                  <button className="icon-button delete-button" onClick={() => handleDelete(patient.patient_id)} style={{ marginLeft: "8px" }}>
                    <FaTrash />
                  </button>

                  {/* View Button with FaEye Icon */}
                  <a href={`/admin_folder/medical_record_table/${patient.patient_id}`} target="_blank" rel="noopener noreferrer">
                    <button className="icon-button view-button" style={{ marginLeft: "8px" }}>
                      <FaEye />
                    </button>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PatientTable;
