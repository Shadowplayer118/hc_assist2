import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientHeader from './AAA_patient_header';
import './Admin_CSS/MedBoard.css';

function MedBoard() {
  const [medsList, setMedsList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    try {
      setLoading(true);
      const response = await axios.get("http://localhost/hc_assist2/src/zbackend_folder/load_active_meds.php");
      setMedsList(response.data.meds);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching meds list:", err);
      setLoading(false);
    }
  };

  return (
    <div className="med-board-container">
      <PatientHeader />
      
      <div className="med-board-header">
        <h1>Medicines</h1>
        <p className="meds-count">{medsList.length} medications available</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader"></div>
          <p>Loading medications...</p>
        </div>
      ) : medsList.length === 0 ? (
        <div className="no-meds-message">
          <p>No medications found in the system.</p>
        </div>
      ) : (
        <div className="med-grid">
          {medsList.map((med, index) => (
            <div key={index} className="med-card">
              <div className="med-image-container">
                <img
                  src={
                    med.med_image
                      ? `http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/${med.med_image}`
                      : `http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/MedDefault.jpg`
                  }
                  alt={med.item_name}
                  className="med-image"
                />
              </div>
              <div className="med-card-inner">
                <h3 className="med-name">{med.item_name}</h3>
                <div className="med-info">
                  <div className="info-item">
                    <span className="info-label">Brand</span>
                    <span className="info-value">{med.brand}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Category</span>
                    <span className="info-value">{med.category}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Units</span>
                    <span className="info-value">{med.units}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Price</span>
                    <span className="info-value">${med.price}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MedBoard;