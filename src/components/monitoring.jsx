import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Monitoring = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState('today'); // Default to 'today'

  // Format time from 'YYYY-MM-DD HH:mm:ss' to 'hh:mm AM/PM'
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
      const response = await axios.post('http://localhost/hc_assist2/src/zbackend_folder/load_monitoring.php', {
        range,
      });
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
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Schedules</h2>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border px-3 py-1 rounded"
        >
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : schedules.length === 0 ? (
        <p>No schedules for this {range}.</p>
      ) : (
        <ul className="space-y-3">
          {schedules.map((sched) => (
            <li
              key={sched.sched_id}
              className="p-3 border rounded-lg shadow-sm hover:bg-gray-50 transition flex gap-4 items-center"
            >
              <img
                src={sched.patient_image 
                      ? `http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${sched.patient_image}` 
                      : 'http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg'}
                alt={`${sched.first_name} ${sched.last_name}`}
                className="w-16 h-16 rounded-full object-cover border"
              />
              <div>
                <div className="font-medium">{sched.first_name} {sched.last_name}</div>
                <div className="text-sm text-gray-600 capitalize">Type: {sched.sched_type}</div>
                <div className="text-sm text-gray-600">Activity: {sched.activity}</div>
                <div className="text-sm text-gray-500">
                  Scheduled Time: {formatTime(sched.sched_date)}
                </div>
                <div className="text-sm text-gray-500">Status: {sched.status}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Monitoring;
