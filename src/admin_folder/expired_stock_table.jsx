import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Admin_CSS/ExpiredMeds.css";

function ExpiredStockViewer() {
  const [expiredMeds, setExpiredMeds] = useState([]);
  const [itemName, setItemName] = useState("");
  const [medsId, setMedsId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [discardQty, setDiscardQty] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("meds_id");
    setMedsId(id);
    if (id) fetchExpiredMeds(id);
  }, []);

  const fetchExpiredMeds = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/load_expired_meds.php",
        { meds_id: id }
      );
      setExpiredMeds(res.data.expired_stocks || []);
      setItemName(res.data.item_name || "");
    } catch (err) {
      console.error("Failed to fetch:", err);
      setError("Failed to load expired medications. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const discardAll = async () => {
    if (!confirm("Are you sure you want to discard all expired stock?")) return;
    
    try {
      const res = await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/discard_expired_meds.php",
        { meds_id: medsId }
      );
      alert(res.data.message);
      fetchExpiredMeds(medsId);
    } catch (err) {
      console.error("Discard error:", err);
      alert("Failed to discard all items. Please try again.");
    }
  };

  const confirmDiscard = (entry) => {
    setSelected(entry);
    setDiscardQty(entry.stocked_in);
    setShowModal(true);
  };

  const handleConfirm = async () => {
    try {
      await axios.post(
        "https://slategrey-stingray-471759.hostingersite.com/api/hc/zbackend_folder/discard_expired.php",
        {
          expired_id: selected.exp_id,
          discard_units: discardQty,
        }
      );
      setShowModal(false);
      fetchExpiredMeds(medsId);
    } catch (err) {
      console.error("Discard error:", err);
      alert("Failed to discard item. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading expired stock data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="expired-stock-container">
      <div className="header">
        <h2>
          Expired Stock for:{" "}
          <span className="item-name">{itemName || `Medicine #${medsId}`}</span>
        </h2>

      </div>

      {expiredMeds.length === 0 ? (
        <div className="no-data">No expired stock found for this item.</div>
      ) : (
        <div className="table-responsive">
          <table className="stock-table">
            <thead>
              <tr>
                <th>Expiration Date</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {expiredMeds.map((entry, i) => (
                <tr key={i} className={entry.action_taken !== "none" ? "discarded" : ""}>
                  <td>{entry.exp_date}</td>
                  <td>{entry.stocked_in}</td>
                  <td>
                    <span className={`status-badge ${entry.action_taken === "none" ? "pending" : "discarded"}`}>
                      {entry.action_taken === "none" ? "Pending" : "Discarded"}
                    </span>
                  </td>
                  <td>
                    {entry.action_taken === "none" && (
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => confirmDiscard(entry)}
                      >
                        Discard
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Discard Expired Stock</h3>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Expiration Date:</label>
                <div className="form-value">{selected.exp_date}</div>
              </div>
              
              <div className="form-group">
                <label>Available Quantity:</label>
                <div className="form-value">{selected.stocked_in}</div>
              </div>
              
              <div className="form-group">
                <label htmlFor="discard-qty">Quantity to Discard:</label>
                <input
                  id="discard-qty"
                  type="number"
                  min="1"
                  max={selected.stocked_in}
                  value={discardQty}
                  onChange={(e) => setDiscardQty(Number(e.target.value))}
                  className="form-control"
                />
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleConfirm}
                disabled={discardQty < 1 || discardQty > selected.stocked_in}
              >
                Confirm Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExpiredStockViewer;