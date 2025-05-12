import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from './AAA_admin_header';
import AddStaffModal from './admin_modals/add_staff_modal';
import EditStaffModal from './admin_modals/edit_staff_modal';
import { FaEdit, FaTrash } from "react-icons/fa";
import './Admin_CSS/StaffTable.css';

function StaffTable() {
  const [staffList, setStaffList] = useState([]);
  const [name, setName] = useState("");
  const [purok, setPurok] = useState("");
  const [position, setPosition] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [filterOptions, setFilterOptions] = useState({ puroks: [], positions: [] });

  useEffect(() => {
    const filters = { name, purok_assigned: purok, position };
    fetchStaff(filters);
  }, [name, purok, position]);

  const fetchStaff = async (filters = {}) => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/load_staff.php", filters);
      setStaffList(response.data.staff);
      setFilterOptions(response.data.filters);
    } catch (err) {
      console.error("Error fetching staff:", err);
    }
  };

  const handleEdit = (staffId) => {
    const staffToEdit = staffList.find(s => s.staff_id === staffId);
    if (staffToEdit) setSelectedStaff(staffToEdit);
  };

  const handleCloseEditModal = () => {
    setSelectedStaff(null);
    fetchStaff();
  };

  const handleDelete = async (staffId) => {
    if (!window.confirm("Are you sure you want to delete this staff member?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const currentAdminId = user ? user.staff_id : "";
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_staff.php", {
        staff_id: staffId,
        admin_id: currentAdminId,
      });

      alert("Staff deleted successfully.");
      fetchStaff();
    } catch (err) {
      console.error("Error deleting staff:", err);
      alert("Failed to delete staff.");
    }
  };

  return (
    <div className="staff-container">
      <AdminHeader />
      <div className="staff-header">
      </div>

      <div className="actions-row">
        <button className="add-button" onClick={() => setIsAddModalOpen(true)}>Add New Staff</button>
        <input
          type="text"
          className="search-input"
          placeholder="Search by Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      {isAddModalOpen && <AddStaffModal onClose={() => setIsAddModalOpen(false)} />}
      {selectedStaff && <EditStaffModal staffData={selectedStaff} onClose={handleCloseEditModal} />}

      <div className="table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Full Name</th>
              <th>
                <select value={purok} onChange={(e) => setPurok(e.target.value)}>
                  <option value="">Purok Assigned</option>
                  {filterOptions.puroks.map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </th>
              <th>Contact</th>
              <th>
                <select value={position} onChange={(e) => setPosition(e.target.value)}>
                  <option value="">Position</option>
                  {filterOptions.positions.map((val) => (
                    <option key={val} value={val}>{val}</option>
                  ))}
                </select>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff) => (
              <tr key={staff.staff_id}>
                <td>{staff.first_name + ' ' + staff.last_name}</td>
                <td>{staff.purok_assigned}</td>
                <td>{staff.contact}</td>
                <td>{staff.position}</td>
                <td>
                  <button className="icon-button edit-button" onClick={() => handleEdit(staff.staff_id)}>
                    <FaEdit />
                  </button>
                  <button className="icon-button delete-button" onClick={() => handleDelete(staff.staff_id)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffTable;
