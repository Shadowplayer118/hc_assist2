import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from './AAA_admin_header';

function DeletedBackupTable() {
  const [deletedRecords, setDeletedRecords] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const fetchDeletedRecords = async (filters = {}) => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/admin_folder/admin_php/load_deleted_backup.php", filters);
      setDeletedRecords(response.data.records);
    } catch (err) {
      console.error("Error fetching deleted records:", err);
    }
  };

  useEffect(() => {
    const filters = {
      date: filterDate,
      user: filterUser,
      action: filterAction,
    };
    fetchDeletedRecords(filters);
  }, [filterDate, filterUser, filterAction]);

  const handleRestore = async (recordId) => {
    const confirmed = window.confirm("Are you sure you want to restore this record?");
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
      const staffId = user ? user.staff_id : ""; // Get the logged-in staff id
      await axios.post("http://localhost/hc_assist2/src/admin_folder/admin_php/restore_deleted_record.php", {
        record_id: recordId,
        staff_id: staffId
      });
      alert("Record restored.");
      fetchDeletedRecords(); // Refresh the list
    } catch (err) {
      console.error("Restore failed:", err);
      alert("Failed to restore record.");
    }
  };

  return (
    <div>
      <AdminHeader />
      <h2>Deleted Records Backup</h2>

      {/* Filters */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by User"
          value={filterUser}
          onChange={(e) => setFilterUser(e.target.value)}
        />
        <input
          type="text"
          placeholder="Search by Action"
          value={filterAction}
          onChange={(e) => setFilterAction(e.target.value)}
        />
      </div>

      {/* Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>Action</th>
            <th>Description</th>
            <th>Target Table</th>
            <th>Date Deleted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {deletedRecords.map((record) => (
            <tr key={record.id}>
              <td>{record.username}</td>
              <td>{record.action}</td>
              <td>{record.description}</td>
              <td>{record.target_table}</td>
              <td>{new Date(record.date_deleted).toLocaleString()}</td>
              <td>
                <button onClick={() => handleRestore(record.id)}>Restore</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DeletedBackupTable;
