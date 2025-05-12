import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js';
import axios from 'axios';
import './Component_CSS/DiseaseMonitoring.css';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale);

const DiseaseMonitoring = () => {
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [],
      hoverBackgroundColor: [],
    }],
  });

  const [ongoingPercentage, setOngoingPercentage] = useState(0);
  const [nonOngoingPercentage, setNonOngoingPercentage] = useState(0);

  const fetchDiseaseData = async () => {
    try {
      const response = await axios.post(
        'http://localhost/hc_assist2/src/zbackend_folder/disease_monitor.php'
      );

      const { ongoing_diseases, ongoing_percentage, non_ongoing_percentage } = response.data;

      const labels = ongoing_diseases.map(item => item.disease_name);
      const counts = ongoing_diseases.map(item => parseInt(item.ongoing_count));
      const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFBD33', '#6A33FF', '#33FFF0'];

      setChartData({
        labels,
        datasets: [{
          data: counts,
          backgroundColor: colors.slice(0, labels.length),
          hoverBackgroundColor: colors.slice(0, labels.length),
        }],
      });

      setOngoingPercentage(parseFloat(ongoing_percentage));
      setNonOngoingPercentage(parseFloat(non_ongoing_percentage));

    } catch (error) {
      console.error('Error fetching disease data:', error);
    }
  };

  useEffect(() => {
    fetchDiseaseData();
  }, []);

  const getFlagImage = (percentage) => {
    const p = parseFloat(percentage);
    if (isNaN(p)) return '/flags/gray-flag.png';

    if (p >= 90) return 'http://localhost/hc_assist2/src/components/flags/redFlag.png';
    if (p >= 60) return 'http://localhost/hc_assist2/src/components/flags/yellowFlag.png';
    return 'http://localhost/hc_assist2/src/components/flags/greenFlag.png';
  };

  return (
    <div className="disease-monitoring-container">
      <h2>Disease Monitoring</h2>

      <div className="health-flag-wrapper">
        <img src={getFlagImage(ongoingPercentage)} alt="Alert Flag" />
        <span>{ongoingPercentage.toFixed(1)}% Ongoing</span>
      </div>

      <div className="pie-chart-wrapper">
        <div className="pie-chart-canvas">
          <Pie
            data={chartData}
            options={{
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  enabled: false,
                },
              },
            }}
          />
        </div>

        <div className="legend-header">LEGEND :</div>
        <ul>
          {chartData.labels.map((label, index) => (
            <li key={index}>
              <span className="color-circle" style={{ backgroundColor: chartData.datasets[0].backgroundColor[index] }}></span>
              <span className="label">{label}</span>
              <span className="count">{chartData.datasets[0].data[index]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default DiseaseMonitoring;
