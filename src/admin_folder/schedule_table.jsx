import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import RecordsHeader from "./AAA_records_header";
import AddScheduleModal from "./admin_modals/add_schedule_modal";
import EditScheduleModal from "./admin_modals/edit_schedule_modal";
import "./Admin_CSS/Schedule.css";

function ScheduleTable() {
  const { patientId } = useParams();
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
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_schedule.php", {
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
      await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_schedule.php", {
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
    <div className="admin_patient_sched-container">
      <RecordsHeader patientId={patientId} />
      <h2 className="admin_patient_sched-heading">Schedule Records</h2>

      {/* Patient Info */}
      {patientInfo && (
        <div className="admin_patient_sched-info">
          <img
            src={`https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/${patientInfo.patient_image || "PatientDefault.jpg"}`}
            alt="Patient"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg";
            }}
            className="admin_patient_sched-img"
          />
          <div>
            <h3>{patientInfo.first_name} {patientInfo.last_name}</h3>
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="admin_patient_sched-date-filter">
        <label htmlFor="startDate" className="admin_patient_sched-label">Start Date: </label>
        <input
          type="date"
          id="startDate"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="admin_patient_sched-input"
        />
        <label htmlFor="endDate" className="admin_patient_sched-label">End Date: </label>
        <input
          type="date"
          id="endDate"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="admin_patient_sched-input"
        />
      </div>

      <button onClick={() => setShowModal(true)} className="admin_patient_sched-btn">
        Add New Record
      </button>

      {/* Schedule Table */}
      <table className="admin_patient_sched-table">
        <thead>
          <tr>
            <th>
              <select
                value={filteredType}
                onChange={(e) => setFilteredType(e.target.value)}
                className="admin_patient_sched-filter"
              >
                <option value="">Schedule Type</option>
                {uniqueSchedTypes.map((type, index) => (
                  <option key={index} value={type}>{type}</option>
                ))}
              </select>
            </th>
            <th>
              <select
                value={filteredStatus}
                onChange={(e) => setFilteredStatus(e.target.value)}
                className="admin_patient_sched-filter"
              >
                <option value="">Status</option>
                {uniqueStatuses.map((status, index) => (
                  <option key={index} value={status}>{status}</option>
                ))}
              </select>
            </th>
            <th>Date Scheduled</th>
            <th>Activity</th>
            <th>Actions</th>
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
                <td>
                  <button onClick={() => setSelectedRecord(record)} className="admin_patient_sched-edit-btn">Edit</button>
                  <button onClick={() => handleDelete(record.sched_id)} className="admin_patient_sched-delete-btn">Delete</button>
                </td>
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

export default ScheduleTable;
