import React, { useEffect, useState } from "react";
import axios from "axios";
import PatientHeader from './AAA_patient_header';

function MedBoard() {
  const [medsList, setMedsList] = useState([]);

  useEffect(() => {
    fetchMeds();
  }, []);

  const fetchMeds = async () => {
    try {
      const response = await axios.get("http://localhost/hc_assist2/src/zbackend_folder/load_active_meds.php");
      setMedsList(response.data.meds);
    } catch (err) {
      console.error("Error fetching meds list:", err);
    }
  };

  return (
    <div className="med-board-container">
      <PatientHeader />
      <h1>Medicines</h1>

      <div className="med-card-container">
        {medsList.map((med, index) => (
          <div key={index} className="med-card">
            <img
              src={
                med.med_image
                  ? `http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/${med.med_image}`
                  : `http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/MedDefault.jpg`
              }
              alt={med.item_name}
              className="med-image"
            />
            <div className="med-details">
              <h3>{med.item_name}</h3>
              <p><strong>Brand:</strong> {med.brand}</p>
              <p><strong>Category:</strong> {med.category}</p>
              <p><strong>Units:</strong> {med.units}</p>
              <p><strong>Price:</strong> ${med.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MedBoard;
