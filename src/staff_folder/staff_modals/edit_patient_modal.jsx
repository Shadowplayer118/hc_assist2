import React, { useState, useEffect } from "react";
import axios from "axios";

function EditPatientModal({ onClose, patientData = null }) {
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
    image_preview: null,
    patient_id:"",
    full_name: "",
    staff_id: "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const fullNameFromLocalStorage = user ? `${user.first_name} ${user.last_name}` : "";
    const staff_id = user ? user.staff_id : "";

    setFormData((prev) => ({
      ...prev,
      ...patientData, // prefill if editing
      full_name: fullNameFromLocalStorage,
      staff_id: staff_id,
      image_preview: patientData?.patient_image || null, // use actual URL if editing
    }));
  }, [patientData]);

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

      
      if (name === "bdate") {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        const dayDiff = today.getDate() - birthDate.getDate();
        if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
          age--;
        }

        setFormData((prev) => ({
          ...prev,
          bdate: value,
          age: age.toString(),
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  const handleSubmit = async () => {
    try {
      const formDataToSubmit = new FormData();
  
      // Only append changed fields; skip image unless it's updated
      Object.keys(formData).forEach((key) => {
        if (key === "image_preview") {
          if (formData.image_preview instanceof File) {
            formDataToSubmit.append("image", formData.image_preview);
          }
        } else {
          formDataToSubmit.append(key, formData[key]);
        }
      });
  
      // Always include patient ID
      formDataToSubmit.append("patient_id", patientData.patient_id);
  
      // Send to update endpoint only
      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/edit_patients.php",
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
  
      alert("Patient updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating patient:", err);
      alert("Failed to update patient.");
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
        <h3>{patientData ? "Edit Patient" : "Add New Patient"}</h3>

          <div style={{ marginBottom: "10px" }}>
          <label htmlFor="patient_image">Patient Image</label>
          <input
          type="file"
          name="patient_image"
          onChange={handleChange}
          accept="image/*"
          />
          {(formData.image_preview || true) && (
          <div style={{ marginTop: "10px" }}>
          <img
  src={
    formData.image_preview instanceof File
      ? URL.createObjectURL(formData.image_preview)
      : formData.image_preview && !formData.image_preview.startsWith("blob:")
        ? `https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/${formData.image_preview}`
        : formData.image_preview || `https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/uploads/Patient_Images/PatientDefault.jpg`
  }
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
          <label htmlFor="purok">Purok</label>
          <input
        name="purok" placeholder="Purok" 
        value={formData.purok} onChange={handleChange}
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
          <label htmlFor="contact">Contact Number</label>
          <input
          name="contact" placeholder="Contact Number"
          value={formData.contact} onChange={handleChange}
          maxLength={11} 
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="household">Household</label>
          <input name="household" placeholder="Household" 
          value={formData.household} onChange={handleChange}
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
            <option value="B+">B+</option>
            <option value="AB-">AB-</option>
            <option value="AB+">AB+</option>
            <option value="O-">O-</option>
            <option value="O+">O+</option>
          </select>
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
          <label htmlFor="age">Age</label>
          <input
            name="age"
            placeholder="Age"
            value={formData.age}
            onChange={handleChange}
            readOnly
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>
            {patientData ? "Update" : "Add"}
          </button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditPatientModal;
