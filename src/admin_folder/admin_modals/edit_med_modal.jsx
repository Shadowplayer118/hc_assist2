import React, { useState, useEffect } from "react";
import axios from "axios";

function EditMedModal({ onClose, medData = null }) {
  const [formData, setFormData] = useState({
    item_name: "",
    brand: "",
    units: "",
    category: "",
    med_image: null,
    image_preview: null,
    med_id: "",
    price:"",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      ...medData,
      image_preview: medData?.med_image || null,
    }));
  }, [medData]);

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
        if (key === "image_preview") {
          if (formData.image_preview instanceof File) {
            formDataToSubmit.append("image", formData.image_preview);
          }
        } else {
          formDataToSubmit.append(key, formData[key]);
        }
      });

      formDataToSubmit.append("med_id", medData.med_id);

      await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/edit_med.php",
        formDataToSubmit,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      alert("Medicine updated successfully!");
      onClose();
    } catch (err) {
      console.error("Error updating medicine:", err);
      alert("Failed to update medicine.");
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
        <h3>Edit Medicine</h3>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="med_image">Medicine Image</label>
          <input
            type="file"
            name="med_image"
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
                      ? `http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/${formData.image_preview}`
                      : formData.image_preview || `http://localhost/hc_assist2/src/zbackend_folder/uploads/Med_Images/MedDefault.jpg`
                }
                alt="Image Preview"
                style={{ width: "100%", maxHeight: "200px", objectFit: "cover" }}
              />
            </div>
          )}
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="item_name">Item Name</label>
          <input
            name="item_name"
            placeholder="Item Name"
            value={formData.item_name}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="brand">Brand</label>
          <input
            name="brand"
            placeholder="Brand"
            value={formData.brand}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="units">Units</label>
          <input
            name="units"
            placeholder="Units"
            value={formData.units}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="price">Price</label>
          <input
            name="price"
            placeholder="price"
            value={formData.price}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginBottom: "10px" }}>
          <label htmlFor="category">Category</label>
          <input
            name="category"
            placeholder="Category"
            value={formData.category}
            onChange={handleChange}
          />
        </div>

        <div style={{ marginTop: 10 }}>
          <button onClick={handleSubmit}>Update</button>
          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default EditMedModal;
