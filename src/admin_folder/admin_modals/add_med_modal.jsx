import React, { useState } from "react";
import axios from "axios";

function AddMedModal({ onClose }) {
  const [formData, setFormData] = useState({
    item_name: "",
    category: "",
    brand: "",
    units: "",
    price: "",
    med_image: null,
    image_preview: "http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/MedDefault.jpg",
  });

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setFormData((prev) => ({
        ...prev,
        [name]: file,
        image_preview: URL.createObjectURL(file),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      await axios.post("http://localhost/hc_assist2/src/zbackend_folder/add_med.php", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Medicine added successfully!");
      onClose();
    } catch (err) {
      console.error("Error adding medicine:", err);
      alert("Failed to add medicine.");
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
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div style={{ background: "white", padding: 20, borderRadius: 8, width: 500 }}>
        <h3>Add New Medicine</h3>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="med_image">Medicine Image</label>
          <input type="file" name="med_image" onChange={handleChange} accept="image/*" />
          {formData.image_preview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={formData.image_preview}
                alt="Preview"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          )}     
        </div>

        {["item_name", "brand", "category", "units", "price"].map((field) => (
          <div style={{ marginBottom: "10px" }} key={field}>
            <label htmlFor={field}>
              {field.charAt(0).toUpperCase() + field.slice(1).replace("_", " ")}
            </label>
            <input
              type={field === "price" ? "number" : "text"}
              step={field === "price" ? "0.01" : undefined}
              name={field}
              value={formData[field]}
              onChange={handleChange}
            />
          </div>
        ))}

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default AddMedModal;
