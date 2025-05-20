import React, { useState } from "react";
import axios from "axios";

function AddStaffModal({ onClose }) {
  const [formData, setFormData] = useState({
    first_name: "",
    mid_name: "",
    last_name: "",
    bdate: "",
    gender: "",
    purok_assigned: "",
    civil_status: "",
    age: "",
    contact: "",
    position: "",
    password: "",
    gmail: "",
    staff_image: null,
    image_preview: 'https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Staff_Images/StaffDefault.jpg',
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
      let newValue = value;
      if (["first_name", "mid_name", "last_name"].includes(name)) {
        newValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
      }

      if (name === "bdate") {
        const birthDate = new Date(newValue);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) age--;

        setFormData((prev) => ({
          ...prev,
          bdate: newValue,
          age: age.toString(),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: newValue,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSubmit = new FormData();
      Object.keys(formData).forEach((key) => {
        formDataToSubmit.append(key, formData[key]);
      });

      await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/add_staff.php", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Staff added successfully!");
      onClose();
    } catch (err) {
      console.error("Error adding staff:", err);
      alert("Failed to add staff.");
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
        <h3>Add New Staff</h3>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="staff_image">Staff Image</label>
          <input type="file" name="staff_image" onChange={handleChange} accept="image/*" />
          {formData.image_preview && (
            <div style={{ marginTop: "10px" }}>
              <img src={formData.image_preview} alt="Preview" style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }} />
            </div>
          )}
        </div>

        {["first_name", "mid_name", "last_name"].map((field) => (
          <div style={{ marginBottom: "10px" }} key={field}>
            <label htmlFor={field}>{field.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}</label>
            <input name={field} placeholder={field.replace("_", " ")} value={formData[field]} onChange={handleChange} />
          </div>
        ))}

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="bdate">Birth Date</label>
          <input type="date" name="bdate" value={formData.bdate} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="age">Age</label>
          <input name="age" value={formData.age} readOnly />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="gender">Gender</label>
          <select name="gender" value={formData.gender} onChange={handleChange} style={{ width: "50%" }}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="purok_assigned">Purok Assigned</label>
          <input name="purok_assigned" value={formData.purok_assigned} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="gmail">Gmail</label>
          <input name="gmail" value={formData.gmail} onChange={handleChange} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="civil_status">Civil Status</label>
          <select name="civil_status" value={formData.civil_status} onChange={handleChange} style={{ width: "50%" }}>
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="contact">Contact Number</label>
          <input name="contact" value={formData.contact} onChange={handleChange} maxLength={11} />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="position">Position</label>
          <select name="position" value={formData.position} onChange={handleChange} style={{ width: "50%" }}>
            <option value="">Select Position</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
            <option value="midwife">Midwife</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="password">Password</label>
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>Add</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default AddStaffModal;
