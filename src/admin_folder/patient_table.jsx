import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from './AAA_admin_header';
import AddPatientModal from './admin_modals/add_patient_modal';

function PatientTable() {
  const [patients, setPatients] = useState([]);
  const [name, setName] = useState(""); // For name search
  const [bloodType, setBloodType] = useState(""); // For blood type filter
  const [age, setAge] = useState(""); // For age filter
  const [purok, setPurok] = useState(""); // For purok filter
  const [household, setHousehold] = useState(""); // For household filter

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  // Fetch patients based on current filters
  const fetchPatients = async (filters = {}) => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/admin_folder/admin_php/load_patients.php", filters);
      setPatients(response.data.patients);
      setFilterOptions(response.data.filters);
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };
  const [filterOptions, setFilterOptions] = useState({
    blood_types: [],
    ages: [],
    puroks: [],
    households: [],
  });

  // Automatically fetch patients when any filter changes
  useEffect(() => {
    const filters = {
      name,
      blood_type: bloodType,
      age,
      purok,
      household,
    };
    fetchPatients(filters); // Fetch with applied filters
  }, [name, bloodType, age, purok, household, patients]); // Trigger effect when any of these values change

  const handleView = (patientId) => {
    console.log("View patient", patientId);
    // Navigate or display modal, etc.
  };

  const handleDelete = (patientId) => {
    console.log("Delete patient", patientId);
    // Confirm and call delete API here
  };

  return (
    <div>
      <AdminHeader />
      <h2>Patient List</h2>

      <button onClick={() => setIsAddModalOpen(true)}>Add New Patient</button>

        {isAddModalOpen && (
          <AddPatientModal
          onClose={() => setIsAddModalOpen(false)}
          // onSubmit={handleAddPatient}
          />
        )}


      {/* Filter Section: Name Search */}
      <div style={{ marginBottom: "20px" }}>
        {/* Name Search Bar */}
        <input
          type="text"
          placeholder="Search by Name"
          value={name}
          onChange={(e) => setName(e.target.value)} // Trigger filter on change
        />
      </div>

      {/* Patient Table with Filters in Headers */}
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
                <option value="">BloodType</option>
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
                <button onClick={() => handleView(patient.patient_id)}>View</button>
                <button onClick={() => handleDelete(patient.patient_id)} style={{ marginLeft: "8px" }}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PatientTable;
