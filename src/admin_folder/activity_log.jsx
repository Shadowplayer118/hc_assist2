import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminHeader from './AAA_admin_header';

function ActivityLogTable() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");

  const fetchActivityLogs = async (filters = {}) => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/admin_folder/admin_php/activity_log.php", filters);
      setActivityLogs(response.data.logs);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    }
  };

  useEffect(() => {
    const filters = {
      date: filterDate,
      user: filterUser,
      action: filterAction,
    };
    fetchActivityLogs(filters);
  }, [filterDate, filterUser, filterAction]);

  return (
    <div>
      <AdminHeader />
      <h2>Activity Logs</h2>

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
            <th>Date Recorded</th>
          </tr>
        </thead>
        <tbody>
          {activityLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.description}</td>
              <td>{log.target_table}</td>
              <td>{new Date(log.date_recorded).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityLogTable;
