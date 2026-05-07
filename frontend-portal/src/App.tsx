import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState('');

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
      const response = await axios.post('http://localhost:5000/register', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus(`Berhasil! URL KTP: ${response.data.data.ktp_url}`);
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Terjadi kesalahan saat mengunggah data.';
      setStatus(`Error: ${errorMsg}`);
    }
  };

  return (
    <div style={{ padding: '50px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Portal Pendaftaran Pegawai</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label>Nama Lengkap:</label><br/>
          <input type="text" value={nama} onChange={(e) => setNama(e.target.value)} required />
        </div>
        <div>
          <label>Alamat Email:</label><br/>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Upload KTP (Gambar):</label><br/>
          <input type="file" accept="image/*" onChange={(e) => {
            if (e.target.files) setFile(e.target.files[0]);
          }} required />
        </div>
        <button type="submit">Submit Pendaftaran</button>
      </form>
      {status && <p style={{ marginTop: '20px', fontWeight: 'bold' }}>{status}</p>}
    </div>
  );
}

export default App;