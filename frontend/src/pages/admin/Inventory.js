import { useEffect, useState } from 'react';
import axios from 'axios';
import AdminLayout from './AdminLayout';
import './Inventory.css';

export default function Inventory() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    name: '',
    quantityInStock: '',
    unit: '',
    expiryDate: ''
  });

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/medicines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/medicines', form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForm({ name: '', quantityInStock: '', unit: '', expiryDate: '' });
      fetchInventory();
    } catch (err) {
      console.error('Error adding medicine:', err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="inventory-container">
        <h2>Medicine Inventory</h2>
        <p>Track available stock, expiry dates, and quantities.</p>

        <form className="medicine-form" onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Medicine Name"
            value={form.name}
            onChange={handleChange}
            required
          />
          <input
            type="number"
            name="quantityInStock"
            placeholder="Quantity"
            value={form.quantityInStock}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="unit"
            placeholder="Unit (e.g. pcs, bottles)"
            value={form.unit}
            onChange={handleChange}
            required
          />
          <input
            type="date"
            name="expiryDate"
            value={form.expiryDate}
            onChange={handleChange}
          />
          <button type="submit">Add Medicine</button>
        </form>

        {loading ? (
          <p>Loading inventory...</p>
        ) : medicines.length === 0 ? (
          <p>No medicines found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Quantity</th>
                <th>Unit</th>
                <th>Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map(med => (
                <tr key={med._id}>
                  <td>{med.name}</td>
                  <td>{med.quantityInStock}</td>
                  <td>{med.unit}</td>
                  <td>{med.expiryDate ? new Date(med.expiryDate).toLocaleDateString() : '—'}</td>
                  <td>{med.available ? 'Available' : 'Out of Stock'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </AdminLayout>
  );
}