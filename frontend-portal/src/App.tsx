import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState('');
  const [status, setStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL || '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      
      // Validasi file
      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus('error:File terlalu besar, maksimal 5MB');
        return;
      }
      
      if (!selectedFile.type.startsWith('image/')) {
        setStatus('error:Hanya file gambar yang diperbolehkan');
        return;
      }
      
      setFile(selectedFile);
      setFileName(selectedFile.name);
      setStatus('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const selectedFile = e.dataTransfer.files[0];

      if (selectedFile.size > 5 * 1024 * 1024) {
        setStatus('error:File terlalu besar, maksimal 5MB');
        return;
      }

      if (!selectedFile.type.startsWith('image/')) {
        setStatus('error:Hanya file gambar yang diperbolehkan');
        return;
      }

      setFile(selectedFile);
      setFileName(selectedFile.name);
      setStatus('');
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nama || !email || !file) {
      setStatus('error:Harap isi semua field!');
      return;
    }

    const formData = new FormData();
    formData.append('nama', nama);
    formData.append('email', email);
    formData.append('ktp', file);

    try {
      setIsLoading(true);
      setStatus('');
      const response = await axios.post(`${apiBaseUrl}/register`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setStatus(`success:Pendaftaran berhasil! URL KTP: ${response.data.data.ktp_url}`);
      setNama('');
      setEmail('');
      setFile(null);
      setFileName('');
    } catch (error: any) {
      console.error(error);
      const errorMsg = error?.response?.data?.error || error?.message || 'Terjadi kesalahan saat mengunggah data.';
      setStatus(`error:${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-wrapper">
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-logo">
            <span className="logo-icon">📋</span>
            <span className="logo-text">Portal Registrasi</span>
          </div>
          <div className="navbar-info">
            <span>Pendaftaran Pegawai Mudah & Aman</span>
          </div>
        </div>
      </nav>

      <div className="app-container">
        <div className="hero-section">
          <div className="hero-content">
            <h1>Pendaftaran Pegawai</h1>
            <p>Lengkapi data diri dan unggah KTP untuk bergabung dengan tim kami</p>
          </div>
        </div>

        <div className="main-content">
          <div className="form-wrapper">
            <div className="form-card">
              <div className="form-header">
                <h2>Formulir Registrasi</h2>
                <p>Isi form di bawah dengan data diri Anda yang valid</p>
              </div>

              <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                  <label htmlFor="nama">Nama Lengkap <span className="required">*</span></label>
                  <input 
                    id="nama"
                    type="text" 
                    value={nama} 
                    onChange={(e) => setNama(e.target.value)} 
                    placeholder="Contoh: Budi Santoso"
                    required 
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Alamat Email <span className="required">*</span></label>
                  <input 
                    id="email"
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="Contoh: budi@company.com"
                    required 
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="ktp">Upload Foto KTP <span className="required">*</span></label>
                  <div 
                    className="file-input-wrapper"
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <input 
                      id="ktp"
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      required 
                      disabled={isLoading}
                      className="file-input"
                    />
                    <label htmlFor="ktp" className="file-input-label">
                      <span className="upload-icon">📁</span>
                      <span className="upload-text">Klik atau drag & drop file KTP</span>
                      <span className="upload-hint">JPG, PNG (Max. 5MB)</span>
                    </label>
                  </div>
                  {fileName && <div className="file-info">✓ {fileName}</div>}
                </div>

                <button 
                  type="submit" 
                  className={`submit-button ${isLoading ? 'loading' : ''}`}
                  disabled={isLoading}
                >
                  {isLoading ? 'Sedang mengunggah...' : 'Daftar Sekarang'}
                </button>
              </form>

              {status && (
                <div className={`status-message ${status.startsWith('success') ? 'success' : 'error'}`}>
                  <span className="status-icon">{status.startsWith('success') ? '✓' : '✕'}</span>
                  <span className="status-text">{status.split(':')[1]}</span>
                </div>
              )}
            </div>

            <div className="info-section">
              <div className="info-card">
                <span className="info-icon">🔒</span>
                <h3>Aman & Terpercaya</h3>
                <p>Data Anda dienkripsi dan disimpan dengan aman di server kami</p>
              </div>
              <div className="info-card">
                <span className="info-icon">⚡</span>
                <h3>Proses Cepat</h3>
                <p>Selesaikan registrasi hanya dalam beberapa menit</p>
              </div>
              <div className="info-card">
                <span className="info-icon">✓</span>
                <h3>Mudah Digunakan</h3>
                <p>Interface yang intuitif dan user-friendly</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <p>&copy; 2024 Portal Registrasi. Semua hak dilindungi.</p>
      </footer>
    </div>
  );
}

export default App;