import React, { useEffect, useState } from "react";
import axios from "axios";

function ExpiredStockViewer() {
  const [expiredMeds, setExpiredMeds] = useState([]);
  const [itemName, setItemName] = useState("");
  const [medsId, setMedsId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [discardQty, setDiscardQty] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("meds_id");
    setMedsId(id);
    if (id) fetchExpiredMeds(id);
  }, []);

  const fetchExpiredMeds = async (id) => {
    try {
      const res = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/load_expired_meds.php",
        { meds_id: id }
      );
      setExpiredMeds(res.data.expired_stocks || []);
      setItemName(res.data.item_name || "");
    } catch (err) {
      console.error("Failed to fetch:", err);
    }
  };

  const discardAll = async () => {
    try {
      const res = await axios.post(
        "http://localhost/hc_assist2/src/zbackend_folder/discard_expired_meds.php",
        { meds_id: medsId }
      );
      alert(res.data.message);
      fetchExpiredMeds(medsId);
    } catch (err) {
      console.error("Discard error:", err);
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
        "http://localhost/hc_assist2/src/zbackend_folder/discard_expired.php",
        {
          expired_id: selected.exp_id,
          discard_units: discardQty,
        }
      );
      setShowModal(false);
      fetchExpiredMeds(medsId);
    } catch (err) {
      console.error("Discard error:", err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>
        Expired Stock for:{" "}
        <span style={{ color: "#d9534f" }}>{itemName || `Medicine #${medsId}`}</span>
      </h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Expiration Date</th>
            <th>Stocked In</th>
            <th>Action Taken</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {expiredMeds.map((entry, i) => (
            <tr key={i}>
              <td>{entry.exp_date}</td>
              <td>{entry.stocked_in}</td>
              <td>{entry.action_taken}</td>
              <td>
                {entry.action_taken === "none" && (
                  <button onClick={() => confirmDiscard(entry)}>Discard</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={discardAll} style={{ marginTop: 12 }}>
        Discard All
      </button>

      {showModal && (
        <div style={{ padding: 20, border: "1px solid #aaa", marginTop: 20 }}>
          <h3>Discard Confirmation</h3>
          <p>
            Expired Date: <b>{selected.exp_date}</b>
          </p>
          <p>
            Original Stocked In: <b>{selected.stocked_in}</b>
          </p>
          <p>
            Discard Units:{" "}
            <input
              type="number"
              min="1"
              max={selected.stocked_in}
              value={discardQty}
              onChange={(e) => setDiscardQty(Number(e.target.value))}
            />
          </p>
          <button onClick={handleConfirm}>Confirm</button>{" "}
          <button onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
}

export default ExpiredStockViewer;
