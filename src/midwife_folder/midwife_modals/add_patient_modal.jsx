import React, { useState } from "react";
import axios from "axios";

function AddPatientModal({ onClose }) {
  const [formData, setFormData] = useState({
    philhealth_num: "",
    first_name: "",
    mid_name: "",
    last_name: "",
    bdate: "",
    gender: "",
    purok: "",
    civil_status: "",
    age: "",
    contact: "",
    blood_type: "",
    household: "",
    patient_image: null,
    image_preview: 'http://localhost/hc_assist2/src/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg', // For image preview URL
    full_name: "", // Added full name
    staff_id: "",
  });

  // Get full name from localStorage
  const user = JSON.parse(localStorage.getItem("user"));  // Parse the user object
  const fullNameFromLocalStorage = user ? `${user.first_name} ${user.last_name}` : "";
  const staff_id = user ? user.staff_id : "";
  


  // Update form data to include full name from localStorage
  React.useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      full_name: fullNameFromLocalStorage, // Set full name when component mounts
      staff_id: staff_id,
    }));
  }, []); // Only run once when the component mounts

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
      // Capitalize first letter of name fields
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
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }
  
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

      const response = await axios.post("http://localhost/hc_assist2/src/zbackend_folder/add_patients.php", formDataToSubmit, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Patient added successfully!");
      onClose();
    } catch (err) {
      console.error("Error adding patient:", err);
      alert("Failed to add patient.");
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
      <div
        style={{
          background: "white",
          padding: 20,
          borderRadius: 8,
          width: 500,
        }}
      >
        <h3>Add New Patient</h3>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="patient_image">Patient Image</label>
          <input
            type="file"
            name="patient_image"
            onChange={handleChange}
            accept="image/*"
          />
          {/* Display image preview if exists */}
          {formData.image_preview && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={formData.image_preview}
                alt="Image Preview"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="philhealth_num">PhilHealth Number</label>
          <input
          name="philhealth_num" placeholder="PhilHealth Number" 
          value={formData.philhealth_num} onChange={handleChange}
          maxLength={12} 
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="first_name">First Name</label>
          <input
          name="first_name" placeholder="First Name"
          value={formData.first_name} onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="mid_name">Middle Name</label>
          <input
          name="mid_name" placeholder="Middle Name"
          value={formData.mid_name} onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="last_name">Last Name</label>
          <input
          name="last_name" placeholder="Last Name"
          value={formData.last_name} onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="bdate">Birth Date</label>
          <input
        name="bdate" placeholder="Birth Date" type="date" 
        value={formData.bdate} onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="blood_type">Blood Type</label>
          <select
            name="blood_type"
            value={formData.blood_type}
            onChange={handleChange}
            style={{ width: "20%" }}
          >
            <option value="">Select Blood type</option>
            <option value="A-">A-</option>
            <option value="A+">A+</option>
            <option value="B-">B-</option>
            <option value="B-">B-</option>
            <option value="AB-">AB-</option>
            <option value="AB+">AB+</option>
            <option value="O-">O-</option>
            <option value="O+">O+</option>
          </select>
        </div>


        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="purok">Purok</label>
          <input
        name="purok" placeholder="Purok" 
        value={formData.purok} onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="gender">Gender</label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            style={{ width: "20%" }}
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="age">Age</label>
          <input
        name="age" placeholder="Age"
        value={formData.age} onChange={handleChange}
        readOnly
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="contact">Contact Number</label>
          <input
          name="contact" placeholder="Contact Number"
          value={formData.contact} onChange={handleChange}
          maxLength={11} 
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="civil_status">Civil Status</label>
          <select
            name="civil_status"
            value={formData.civil_status}
            onChange={handleChange}
            style={{ width: "25%" }}
          >
            <option value="">Select Status</option>
            <option value="Single">Single</option>
            <option value="Married">Married</option>
          </select>
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="household">Household</label>
          <input name="household" placeholder="Household" 
          value={formData.household} onChange={handleChange}
          />
        </div>

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

export default AddPatientModal;
