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
    boxesInStock: '',
    capsulesPerBox: '',
    unit: '',
    expiryDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/medicines', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMedicines(res.data);
    } catch (err) {
      console.error('Error fetching inventory:', err.message);
      setError('Failed to load inventory.');
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
    setSubmitting(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        quantityInStock: parseInt(form.quantityInStock),
        boxesInStock: parseInt(form.boxesInStock),
        capsulesPerBox: parseInt(form.capsulesPerBox)
      };

      await axios.post('http://localhost:5000/api/medicines', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setForm({
        name: '',
        quantityInStock: '',
        boxesInStock: '',
        capsulesPerBox: '',
        unit: '',
        expiryDate: ''
      });

      fetchInventory();
    } catch (err) {
      console.error('Error adding medicine:', err.message);
      setError('Failed to add medicine.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="inventory-container">
        <h2>Medicine Inventory</h2>
        <p>Track capsules, boxes, and expiry dates.</p>

        <form className="medicine-form" onSubmit={handleSubmit}>
          <input type="text" name="name" placeholder="Medicine Name" value={form.name} onChange={handleChange} required />
          <input type="number" name="quantityInStock" placeholder="Capsules in Stock" value={form.quantityInStock} onChange={handleChange} required />
          <input type="number" name="boxesInStock" placeholder="Boxes in Stock" value={form.boxesInStock} onChange={handleChange} required />
          <input type="number" name="capsulesPerBox" placeholder="Capsules per Box" value={form.capsulesPerBox} onChange={handleChange} required />
          <input type="text" name="unit" placeholder="Unit (e.g. pcs, bottles)" value={form.unit} onChange={handleChange} required />
          <input type="date" name="expiryDate" value={form.expiryDate} onChange={handleChange} />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Adding...' : 'Add Medicine'}
          </button>
        </form>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        {loading ? (
          <p>Loading inventory...</p>
        ) : medicines.length === 0 ? (
          <p>No medicines found.</p>
        ) : (
          <table className="inventory-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Capsules</th>
                <th>Boxes</th>
                <th>Caps/Box</th>
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
                  <td>{med.boxesInStock}</td>
                  <td>{med.capsulesPerBox}</td>
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