import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientHeader from './AAA_patient_header';


function StaffBoard() {
  const [staffList, setStaffList] = useState([]);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const response = await axios.get("http://localhost/hc_assist2/src/zbackend_folder/load_active_staff.php");
      setStaffList(response.data.staff);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    }
  };

  return (
    <div className="staff-board-container">
      <PatientHeader />
      <h1>Staff Directory</h1>

      <div className="staff-card-container">
        {staffList.map((staff, index) => (
          <div
            key={index}
            className={`staff-card ${staff.is_active === "false" ? "inactive" : ""}`}
          >
                <img
                src={
                    staff.staff_image
                    ? `http://localhost/hc_assist2/src/zbackend_folder/uploads/${staff.staff_image}`
                    : `http://localhost/hc_assist2/src/zbackend_folder/uploads/Staff_Images/StaffDefault.jpg`
                }
                alt={`${staff.first_name} ${staff.last_name}`}
                className="staff-image"
                />

            <div className="staff-details">
              <h3>{staff.first_name} {staff.last_name}</h3>
              <p><strong>Contact:</strong> {staff.contact}</p>
              <p><strong>Purok:</strong> {staff.purok_assigned}</p>
              <p><strong>Status:</strong> {staff.is_active === "true" ? "Active" : "Inactive"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StaffBoard;
