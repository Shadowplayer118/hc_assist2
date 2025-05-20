import React, { useEffect, useState } from "react";
import axios from "axios";
import StaffHeader from './AAA_staff_header';
import AddMedModal from "./staff_modals/add_med_modal";
import EditMedModal from "./staff_modals/edit_med_modal";
import StockMedModal from "./staff_modals/stockInOut_modal";
import { FaEdit, FaTrash, FaBoxes } from "react-icons/fa"; // Added icons
import './Admin_CSS/StaffTable.css'; // Assuming you will add styling for this table

function MedTableStaff() {
  const [meds, setMeds] = useState([]);
  const [itemName, setItemName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const [selectedStockMed, setSelectedStockMed] = useState(null);

  const [filterOptions, setFilterOptions] = useState({
    brands: [],
    categories: [],
  });

  useEffect(() => {
    fetchMeds({ item_name: itemName, brand, category });
  }, [itemName, brand, category]);

  const fetchMeds = async (filters = {}) => {
    try {
      const response = await axios.post("https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_med.php", filters);
      setMeds(response.data.meds);
      setFilterOptions({
        brands: response.data.filters.brands || [],
        categories: response.data.filters.categories || [],
      });
    } catch (err) {
      console.error("Error fetching meds:", err);
    }
  };

  const handleEdit = (medId) => {
    const medToEdit = meds.find(p => p.meds_id === medId);
    if (medToEdit) {
      setSelectedMed(medToEdit); // Open modal with selected med's data
    }
  };

  const handleCloseEditModal = () => {
    setSelectedMed(null);
    fetchMeds(); // Refresh after edit
  };

  const handleStock = (med) => {
    setSelectedStockMed(med);
  };

  const handleDelete = async (med) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete "${med.item_name}"? This action can be undone from the backup table.`
    );

    if (!confirmDelete) return;

    const user = JSON.parse(localStorage.getItem("user"));
    const staffId = user ? user.staff_id : "";

    try {
      const response = await axios.post('https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/delete_med.php', {
        meds_id: med.meds_id,
        staff_id: staffId,
      });

      if (response.data.success) {
        alert('Deleted successfully!');
        fetchMeds(); // Refresh the list after deletion
      } else {
        alert(response.data.message);
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Something went wrong.');
    }
  };

  return (
    <div className="med-container">
      <StaffHeader />

      <button className="add-button" onClick={() => setIsAddModalOpen(true)}>Add New Medicine</button>
      {isAddModalOpen && (
        <AddMedModal onClose={() => setIsAddModalOpen(false)} />
      )}

      {selectedMed && (
        <EditMedModal
          medData={selectedMed} // ✅ use a more accurate prop name
          onClose={handleCloseEditModal}
        />
      )}

      {selectedStockMed && (
        <StockMedModal
          medData={selectedStockMed}
          onClose={() => setSelectedStockMed(null)}
          onSuccess={fetchMeds} // Refresh meds after stock-in/out
        />
      )}

      {/* Search input above table */}
      <div className="search-row">
        <input
          type="text"
          className="search-input"
          placeholder="Search by Item Name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="staff-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>
                <select value={brand} onChange={(e) => setBrand(e.target.value)}>
                  <option value="">All Brands</option>
                  {filterOptions.brands.map((b, i) => (
                    <option key={i} value={b}>{b}</option>
                  ))}
                </select>
              </th>
              <th>Units</th>
              <th>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">All Categories</option>
                  {filterOptions.categories.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {meds.map((med, index) => (
              <tr key={index}>
                <td>{med.item_name}</td>
                <td>{med.brand}</td>
                <td>{med.units}</td>
                <td>{med.category}</td>
                <td>
                  <button className="icon-button edit-button" onClick={() => handleEdit(med.meds_id)}>
                    <FaEdit />
                  </button>
                  <button className="icon-button stock-button" onClick={() => handleStock(med)}>
                    <FaBoxes />
                  </button>
                  <button className="icon-button delete-button" onClick={() => handleDelete(med)}>
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MedTableStaff;
