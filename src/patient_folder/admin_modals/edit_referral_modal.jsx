import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EditReferralModal({ onClose, referralData = null }) {
  const { patientId } = useParams();
  const [formData, setFormData] = useState({
    referral_id: "",
    description: "",
    referral_date: "",
    approval_status: "",
    staff_id: "",
    patient_id: patientId || "",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    const staff_id = user ? user.staff_id : "";

    setFormData((prev) => ({
      ...prev,
      staff_id,
    }));

    if (referralData) {
      setFormData((prev) => ({
        ...prev,
        ...referralData,
      }));
    }
  }, [referralData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const formPayload = new FormData();
      Object.keys(formData).forEach((key) => {
        formPayload.append(key, formData[key]);
      });

      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/edit_referral.php",
        formPayload,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Referral record updated successfully!");
      onClose();
    } catch (error) {
      console.error("Error updating referral record:", error);
      alert("Failed to update referral record.");
    }
  };

  const handlePrint = () => {
    // Check if the referral status is "Approved"
    if (formData.approval_status !== "Approved") {
      alert("Only approved referrals can be printed.");
      return;
    }

    // Proceed to print if approved
    const printWindow = window.open("", "_blank", "width=800,height=600");
    printWindow.document.write(`
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
            }
            h1, h2 {
              text-align: center;
            }
            .referral-container {
              width: 100%;
              max-width: 800px;
              margin: 0 auto;
              border: 1px solid #ddd;
              padding: 20px;
              border-radius: 8px;
            }
            .referral-details {
              margin-bottom: 20px;
            }
            .referral-details label {
              font-weight: bold;
            }
            .referral-details span {
              margin-left: 10px;
            }
            .description {
              margin-top: 20px;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #777;
            }
          </style>
        </head>
        <body>
          <div class="referral-container">
            <h1>Health Center Referral</h1>
            <h2>Referral Form</h2>

            <div class="referral-details">
              <p><label>Referral ID:</label><span>${formData.referral_id}</span></p>
              <p><label>Patient ID:</label><span>${formData.patient_id}</span></p>
              <p><label>Staff ID:</label><span>${formData.staff_id}</span></p>
              <p><label>Referral Date:</label><span>${formData.referral_date}</span></p>
              <p><label>Approval Status:</label><span>${formData.approval_status}</span></p>
            </div>

            <div class="description">
              <label>Description:</label>
              <p>${formData.description}</p>
            </div>

            <div class="footer">
              <p>Generated by HC Assist System</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) onClose();
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
          width: 400,
        }}
      >
        <h3>Edit Referral</h3>

        <div style={{ marginBottom: "10px" }}>
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="e.g. Referred to specialist for evaluation"
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Referral Date</label>
          <input
            type="date"
            name="referral_date"
            value={formData.referral_date}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label>Approval Status</label>
          <select
            name="approval_status"
            value={formData.approval_status}
            onChange={handleChange}
          >
            <option value="">Select Status</option>
            <option value="Not Approved">Not Approved</option>
            <option value="Approved">Approved</option>
          </select>
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
          <button onClick={handlePrint} style={{ marginLeft: 10 }}>
            Print Referral
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditReferralModal;
