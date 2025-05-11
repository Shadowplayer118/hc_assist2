import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import axios from 'axios';
import './Component_CSS/ComparativeData.css';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const ComparativeData = () => {
  const [selectedCategory, setSelectedCategory] = useState('purok');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
    }],
  });

  const [patientData, setPatientData] = useState([]);

  const fetchPatientData = async (category) => {
    try {
      const response = await axios.post(
        'http://localhost/hc_assist2/src/zbackend_folder/load_comparative_data.php',
        { category }
      );
      setPatientData(response.data);
    } catch (error) {
      console.error('Error fetching patient data:', error);
    }
  };

  const handleCategoryChange = (event) => {
    const newCategory = event.target.value;
    setSelectedCategory(newCategory);
    fetchPatientData(newCategory);
  };

  const updateChartData = (data) => {
    const labels = data.map(item => item.label);
    const counts = data.map(item => item.count);
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFBD33', '#6A33FF', '#33FFF0'];

    setChartData({
      labels,
      datasets: [{
        data: counts,
        backgroundColor: colors.slice(0, labels.length),
        hoverBackgroundColor: colors.slice(0, labels.length),
      }],
    });
  };

  useEffect(() => {
    fetchPatientData(selectedCategory);
  }, []);

  useEffect(() => {
    updateChartData(patientData);
  }, [patientData]);

  return (
    <div className="comparative-data-container">
      <h2 className="comparative-title">Patient Data Comparison</h2>

      <div className="comparative-controls">
        <label>Select Category:</label>
        <select className="comparative-dropdown" value={selectedCategory} onChange={handleCategoryChange}>
          <option value="purok">Purok</option>
          <option value="pregnant">Pregnant</option>
          <option value="disease">Disease</option>
          <option value="children">Children</option>
        </select>
      </div>

      <div>
        <Pie data={chartData} />
        <div className="comparative-legend">
          <h4>Legend:</h4>
          <ul>
            {chartData.labels.map((label, index) => (
              <li key={index} style={{ color: chartData.datasets[0].backgroundColor[index] }}>
                {label}: {chartData.datasets[0].data[index]}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComparativeData;
