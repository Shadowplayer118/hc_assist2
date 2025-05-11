import axios from 'axios';
import { useState, useEffect } from 'react';
import './Calendar.css';
import AdminHeader from './AAA_admin_header';

const Calendar = () => {
  const today = new Date();
  const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const [schedules, setSchedules] = useState([]);
  const [selectedDay, setSelectedDay] = useState(formattedToday);
  const [selectedDaySchedules, setSelectedDaySchedules] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  useEffect(() => {
    axios.get('http://localhost/hc_assist2/src/zbackend_folder/load_calendar.php')
      .then(response => {
        setSchedules(response.data.schedules);

        const todaySchedules = response.data.schedules.filter(
          s => s.sched_date === formattedToday
        );
        setSelectedDaySchedules(todaySchedules);
      })
      .catch(error => {
        console.error('Error fetching schedules', error);
      });
  }, []);

  const scheduleTypes = {
    pregnant: { label: "Pregnant", color: "red" },
    immu: { label: "Immunization", color: "blue" },
    disease: { label: "Disease", color: "green" },
    check_up: { label: "Check-up", color: "yellow" },
  };

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();

  const generateCalendar = () => {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
    const totalCells = firstDayOfMonth + daysInMonth;

    const scheduleByDate = {};
    schedules.forEach(schedule => {
      if (!scheduleByDate[schedule.sched_date]) scheduleByDate[schedule.sched_date] = [];
      scheduleByDate[schedule.sched_date].push(schedule);
    });

    const calendarDays = [];

    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="empty-cell"></div>);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const day = String(i).padStart(2, '0');
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${day}`;
      const daySchedules = scheduleByDate[dateStr] || [];

      const boxesForDay = Object.keys(scheduleTypes).map(type => {
        const hasSchedule = daySchedules.some(schedule => schedule.sched_type === type);
        const boxClass = hasSchedule ? `${type}-active` : `${type}-inactive`;
        return (
          <div
            className={`box ${boxClass}`}
            style={{ backgroundColor: hasSchedule ? scheduleTypes[type].color : '#e0e0e0' }}
            key={type}
          ></div>
        );
      });

      const isSelected = dateStr === selectedDay ? 'selected' : ''; // Add this check

      calendarDays.push(
        <div
          className={`calendar-day ${isSelected}`} // Apply the selected class
          key={day}
          onClick={() => handleDayClick(dateStr)}
        >
          <div className="date">{i}</div>
          <div className="boxes">{boxesForDay}</div>
        </div>
      );
    }

    const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
    for (let i = 0; i < remainingCells; i++) {
      calendarDays.push(<div key={`empty-end-${i}`} className="empty-cell"></div>);
    }

    return calendarDays;
  };

  const handleDayClick = (fullDate) => {
    const filtered = schedules.filter(schedule => schedule.sched_date === fullDate);
    setSelectedDay(fullDate);
    setSelectedDaySchedules(filtered);
  };

  const changeMonth = (direction) => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'next') {
      if (currentMonth === 11) {
        newMonth = 0;
        newYear += 1;
      } else {
        newMonth += 1;
      }
    } else {
      if (currentMonth === 0) {
        newMonth = 11;
        newYear -= 1;
      } else {
        newMonth -= 1;
      }
    }

    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    setSelectedDay(null);
    setSelectedDaySchedules([]);
  };

  return (
    <div>
      <AdminHeader />
      <div className="calendar-container">
        <div className="left-panel">
          <div className="calendar-nav">
            <button onClick={() => changeMonth('prev')}>Previous</button>
            <h2>{`${new Date(currentYear, currentMonth).toLocaleString('default', { month: 'long' })} ${currentYear}`}</h2>
            <button onClick={() => changeMonth('next')}>Next</button>
          </div>
          <div className="calendar">{generateCalendar()}</div>
        </div>

        <div className="sidebar">
          <h3>
            {selectedDay
              ? `Details for ${selectedDay}`
              : 'Select a day'}
          </h3>

          {selectedDay && selectedDaySchedules.length === 0 && (
            <p>No schedules for this day.</p>
          )}

          {selectedDaySchedules.map(schedule => (
            <div key={schedule.sched_id} className="schedule-details">
              <div className="patient-image">
                <img
                  src={`http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/${schedule.patient_image || 'PatientDefault.jpg'}`}
                  alt={`${schedule.first_name} ${schedule.last_name}`}
                />
              </div>

              <div className="schedule-info">
                <p>{schedule.first_name} {schedule.last_name}</p>
                <p>{schedule.activity}</p>
                <p>{schedule.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calendar;
