import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Component_CSS/Monitoring.css';

const Monitoring = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today');

  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
  };

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await axios.post(
        'https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_monitoring.php',
        { range }
      );
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [range]);

  return (
    <div className="monitoring-container">
      <div className="monitoring-header">
        <h2>Schedules</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="monitoring-select"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <p className="monitoring-empty">Loading...</p>
      ) : schedules.length === 0 ? (
        <p className="monitoring-empty">No schedules for this {range}.</p>
      ) : (
        <ul className="schedule-list">
          {schedules.map((sched) => (
            <li key={sched.sched_id} className="schedule-item">
              <img
                src={
                  sched.patient_image
                    ? `https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/${sched.patient_image}`
                    : 'https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg'
                }
                alt={`${sched.first_name} ${sched.last_name}`}
                className="schedule-img"
              />
              <div className="schedule-details">
                <div className="schedule-name">
                  {sched.first_name} {sched.last_name}
                </div>
                  <div className="schedule-info-monitoring">
                    <div className="schedule-text-monitoring">
                    <span className="text-bold">{sched.sched_type}</span>
                    </div>
                    <div className="schedule-text-monitoring">
                    <span className="text-bold">{sched.activity}</span>
                    </div>
                  </div>

              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Monitoring;
