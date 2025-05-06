import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from './AAA_admin_header';

function PatientTable() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios
      .get("http://localhost/hc_assist2/src/admin_folder/admin_php/load_patients.php")
      .then((res) => {
        setPatients(res.data);
      })
      .catch((err) => {
        console.error("Error fetching patients:", err);
      });
  }, []);

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
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Purok</th>
            <th>Household</th>
            <th>Age</th>
            <th>Blood Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.patient_id}>
              <td>{patient.first_name + ' '+ patient.last_name }</td>
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
