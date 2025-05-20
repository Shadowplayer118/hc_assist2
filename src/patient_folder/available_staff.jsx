import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientHeader from './AAA_patient_header';
import "./Admin_CSS/StaffBoard.css";

function StaffBoard() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_active_staff.php"
      );
      setStaffList(response.data.staff);
    } catch (err) {
      console.error("Error fetching staff list:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="staff-board-container">
      <PatientHeader />
      
      <div className="staff-board-header">
        <h1>Staff Directory</h1>
        <p className="staff-count">Total staff: {staffList.length}</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading staff information...</p>
        </div>
      ) : (
        <>
          {staffList.length === 0 ? (
            <div className="no-staff-message">
              <p>No staff members found.</p>
            </div>
          ) : (
            <div className="staff-grid">
              {staffList.map((staff, index) => (
                <div
                  key={index}
                  className={`staff-card ${staff.is_active === "false" ? "true" : ""}`}
                >
                  <div className="staff-card-inner">
                    <div className="staff-image-container">
                      <img
                        src={
                          staff.staff_image
                            ? `https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Staff_Images/${staff.staff_image}`
                            : `https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Staff_Images/StaffDefault.jpg`
                        }
                        alt={`${staff.first_name} ${staff.last_name}`}
                        className="staff-image"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Staff_Images/StaffDefault.jpg";
                        }}
                      />
                      <span className={`status-indicator ${staff.is_active === "true" ? "active" : "inactive"}`}></span>
                    </div>
                    
                    <div className="staff-details">
                      <h3 className="staff-name">{staff.first_name} {staff.last_name}</h3>
                      
                      <div className="staff-info">
                        <div className="info-item">
                          <span className="info-label">Contact</span>
                          <span className="info-value">{staff.contact}</span>
                        </div>
                        
                        <div className="info-item">
                          <span className="info-label">Purok Assigned</span>
                          <span className="info-value">{staff.purok_assigned}</span>
                        </div>
                        
                        <div className="info-item">
                          <span className="info-label">Status</span>
                          <span className={`info-value status-badge ${staff.is_active === "true" ? "active-badge" : "inactive-badge"}`}>
                            {staff.is_active === "true" ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default StaffBoard;