import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";


function ActivityLogTable() {
  const [activityLogs, setActivityLogs] = useState([]);
  const [filterDate, setFilterDate] = useState("");
  const [filterUser, setFilterUser] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterTable, setFilterTable] = useState("");

  const [filterOptions, setFilterOptions] = useState({
    actions: [],
    target_tables: [],
  });


  useEffect(() => {
    const filters = {
      date: filterDate,
      user: filterUser,
      action: filterAction,
      target_table: filterTable,
    };
    fetchActivityLogs(filters);
  }, [filterDate, filterUser, filterAction, filterTable]);


  const fetchActivityLogs = async (filters = {}) => {
    try {
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/activity_log.php", filters);
      setActivityLogs(response.data.logs);
      setFilterOptions(response.data.filters);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    }
  };


  // Inside the component, add:
const deleteLog = async (auditId) => {
  if (!window.confirm("Are you sure you want to delete this log?")) return;

  try {
    await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_log.php", {
      audit_id: auditId,
    });
    fetchActivityLogs({ date: filterDate, user: filterUser, action: filterAction, target_table: filterTable });
  } catch (err) {
    console.error("Failed to delete log:", err);
  }
};

const deleteFilteredLogs = async () => {
  if (!window.confirm("Are you sure you want to delete all filtered logs?")) return;

  try {
    await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_log.php", {
      date: filterDate,
      user: filterUser,
      action: filterAction,
      target_table: filterTable,
    });
    fetchActivityLogs({ date: filterDate, user: filterUser, action: filterAction, target_table: filterTable });
  } catch (err) {
    console.error("Failed to delete filtered logs:", err);
  }
};


  return (
    <div>

      <li>
        <Link to="/admin_folder/activity_log">Activity Log</Link>
      </li>

      <li>
        <Link to="/admin_folder/deleted_backup">Trash</Link>
      </li>
      
      <h2>Activity Logs</h2>

      {/* Delete filtered logs button */}
      <button onClick={deleteFilteredLogs} style={{ marginBottom: "10px", background: "red", color: "white" }}>
        Delete Filtered Logs
      </button>


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
      </div>

      {/* Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>User</th>
            <th>
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                <option value="">Action</option>
                {filterOptions.actions.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </th>
            <th>Description</th>
            <th>
              <select value={filterTable} onChange={(e) => setFilterTable(e.target.value)}>
                <option value="">Target Table</option>
                {filterOptions.target_tables.map((val) => (
                  <option key={val} value={val}>{val}</option>
                ))}
              </select>
            </th>
            <th>Date Recorded</th>
          </tr>
        </thead>
        <tbody>
          {activityLogs.map((log) => (
            <tr key={log.audit_id}>
              <td>{log.username}</td>
              <td>{log.action}</td>
              <td>{log.description}</td>
              <td>{log.target_table}</td>
              <td>{new Date(log.date_recorded).toLocaleString()}</td>

              <td>
              <button onClick={() => deleteLog(log.audit_id)} style={{ background: "red", color: "white" }}>
              Clear
              </button>
              </td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ActivityLogTable;
