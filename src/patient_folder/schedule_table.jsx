import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddScheduleModal from "./admin_modals/add_schedule_modal";
import EditScheduleModal from "./admin_modals/edit_schedule_modal";

function ScheduleTablePatient() {
  const user = JSON.parse(localStorage.getItem("user"));
  const patientId = user ? user.patient_id : "";
  const [scheduleRecords, setScheduleRecords] = useState([]);
  const [patientInfo, setPatientInfo] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filteredStatus, setFilteredStatus] = useState("");
  const [filteredType, setFilteredType] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchScheduleData();
  }, [patientId, startDate, endDate]);

  const fetchScheduleData = async () => {
    try {
      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/load_schedule.php", {
        patient_id: patientId,
        start_date: startDate,
        end_date: endDate,
      });

      setScheduleRecords(response.data.schedule || []);
      setPatientInfo(response.data.patient_info || {});
    } catch (err) {
      console.error("Failed to fetch schedule data:", err);
    }
  };

  const handleCloseEditModal = () => {
    setSelectedRecord(null);
    fetchScheduleData();
  };

  const handleDelete = async (recordId) => {
    const confirmed = window.confirm("Are you sure you want to delete this record?");
    if (!confirmed) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const staffId = user ? user.staff_id : "";
      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/delete_schedule.php", {
        record_id: recordId,
        staff_id: staffId
      });
      alert("Record deleted.");
      fetchScheduleData();
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete record.");
    }
  };

  const uniqueSchedTypes = [...new Set(scheduleRecords.map(rec => rec.sched_type))];
  const uniqueStatuses = [...new Set(scheduleRecords.map(rec => rec.status))];

  return (
    <div style={{ padding: "20px" }}>
      <RecordsHeader patientId={patientId} />
      <h2>Schedule Records</h2>



      {/* Patient Info */}
      {patientInfo && (
        <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
          <img
            src={`http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
            style={{ width: "100px", height: "100px", borderRadius: "50%", marginRight: "20px" }}
          />
          <div>
            <h3>{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="startDate">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <label htmlFor="endDate" style={{ marginLeft: "10px" }}>End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* Schedule Table */}
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>
              <br />
              <select
                value={filteredType}
                onChange={(e) => setFilteredType(e.target.value)}
              >
                <option value="">Schedule Type</option>
                {uniqueSchedTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </th>
            <th>
              <br />
              <select
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
              >
                <option value="">Status</option>
                {uniqueStatuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </th>
            <th>Date Scheduled</th>
            <th>Activity</th>
          </tr>
        </thead>
        <tbody>
          {scheduleRecords
            .filter(record =>
              (!filteredType || record.sched_type === filteredType) &&
              (!filteredStatus || record.status === filteredStatus)
            )
            .map((record, index) => (
              <tr key={index}>
                <td>{record.sched_type}</td>
                <td>{record.status}</td>
                <td>{record.sched_date}</td>
                <td>{record.activity}</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Add/Edit Modals */}
      {selectedRecord && (
        <EditScheduleModal
          scheduleData={selectedRecord}
          onClose={handleCloseEditModal}
        />
      )}
      {showModal && (
        <AddScheduleModal
          patientId={patientId}
          onClose={() => setShowModal(false)}
          onRecordAdded={fetchScheduleData}
        />
      )}
    </div>
  );
}

export default ScheduleTablePatient;
