import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !email || !file) {
      setStatus('Harap isi semua field!');
      return;
    }

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('email', email);
    formData.append('ktp', file);

    try {
      setStatus('Sedang mengunggah...');
      const response = await axios.post(`${apiBaseUrl}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus(`Berhasil! URL KTP: ${response.data.data.ktp_url}`);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Terjadi kesalahan saat mengunggah data.';
      setStatus(`Error: ${errorMsg}`);
    }
  };

  const getStatusClass = () => {
    if (status.includes('Berhasil')) return 'success';
    if (status.includes('Error')) return 'error';
    if (status.includes('Sedang')) return 'loading';
    return '';
  };

  return (
    <div className="App">
      <div className="form-container">
        <h2>Portal Pendaftaran Pegawai</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nama Lengkap:</label>
            <input 
              type="text" 
              value={nama} 
              onChange={(e) => setNama(e.target.value)} 
              placeholder="Masukkan nama lengkap Anda"
              required 
            />
          </div>
          <div className="form-group">
            <label>Alamat Email:</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Masukkan alamat email Anda"
              required 
            />
          </div>
          <div className="form-group">
            <label>Upload KTP (Gambar):</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => {
                if (e.target.files) setFile(e.target.files[0]);
              }} 
              required 
            />
          </div>
          <button type="submit" className="submit-button">Submit Pendaftaran</button>
        </form>
        {status && <div className={`status-message ${getStatusClass()}`}>{status}</div>}
      </div>
    </div>
  );
}

export default App;