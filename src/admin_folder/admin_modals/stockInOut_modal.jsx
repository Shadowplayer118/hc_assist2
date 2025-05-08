import React, { useState } from "react";
import axios from "axios";

function StockMedModal({ medData, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    activity_type: "stock-in",
    units: "",
    date: "",
    expiration_date: "",
    meds_id: medData.meds_id,
    staff_id: "", // Add staff_id to formData
  });

  const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
  const staffId = user ? user.staff_id : "";

  // Update the staff_id in formData
  useState(() => {
    setFormData((prev) => ({
      ...prev,
      staff_id: staffId, // Assign staffId to formData
    }));
  }, [staffId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });

      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/stock_meds.php", data);

      alert("Medicine stock updated successfully!");
      onClose();
      onSuccess && onSuccess();
    } catch (err) {
      console.error("Error updating stock:", err);
      alert("Failed to update medicine stock.");
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
        }}
      >
        <h2 style={{ marginBottom: "20px", fontSize: "1.25rem", fontWeight: "600" }}>
          {formData.activity_type === "stock-in" ? "Stock In" : "Stock Out"}:{" "}
          <span style={{ fontWeight: "normal" }}>{medData.item_name}</span>
        </h2>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Activity Type</label>
          <select
            name="activity_type"
            value={formData.activity_type}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          >
            <option value="stock-in">Stock In</option>
            <option value="stock-out">Stock Out</option>
          </select>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Units</label>
          <input
            type="number"
            name="units"
            min="1"
            value={formData.units}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label style={{ display: "block", marginBottom: 4 }}>Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
          />
        </div>

        {formData.activity_type === "stock-in" && (
          <div style={{ marginBottom: 15 }}>
            <label style={{ display: "block", marginBottom: 4 }}>Expiration Date (optional)</label>
            <input
              type="date"
              name="expiration_date"
              value={formData.expiration_date}
              onChange={handleChange}
              style={{ width: "100%", padding: "8px", borderRadius: "6px", border: "1px solid #ccc" }}
            />
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f3f3f3",
              borderRadius: "6px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default StockMedModal;
