import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import History from './History';

function App() {
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png'];
    if (!allowedTypes.includes(selectedFile.type)) {
      alert("❌ Please select a valid image file (.jpg or .png only).");
      return;
    }

    setFile(selectedFile);
    setPreviewURL(URL.createObjectURL(selectedFile));
    setPrediction('');
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select an image first.");
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/predict', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setPrediction(`${response.data.prediction} (${response.data.confidence}% confidence)`);
    } catch (error) {
      console.error("Error:", error);
      alert("Error connecting to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="info-section">
        <h2>About Pneumonia Detection</h2>
        <p>
          Pneumonia is a serious lung infection that can affect people of all ages. It causes the air sacs in the lungs to fill with fluid or pus, making it difficult to breathe.
        </p>
        <p>
          Our Pneumonia Detector uses deep learning models to analyze chest X-ray images and predict whether a person is likely to have pneumonia. This assists doctors in making faster, more accurate diagnoses.
        </p>
        <p>
          Early detection and treatment are crucial. Pneumonia can be treated with antibiotics, rest, and proper medical care. In some cases, hospitalization may be necessary.
        </p>
      </div>

      <div className="app-header">
        <div style={{ flex: 1 }}></div>
        <h1 style={{ flex: 1, textAlign: 'center' }}>Pneumonia Detector</h1>
        <div style={{ flex: 1, textAlign: 'right' }}>
          <button className="history-btn" onClick={() => setShowHistory(!showHistory)}>
            {showHistory ? '🔙 Back to Upload' : '📄 View History'}
          </button>
        </div>
      </div>

      {showHistory ? (
        <History />
      ) : (
        <div className="upload-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <input type="file" onChange={handleFileChange} accept="image/*" />
            <button onClick={handleUpload} className="upload-btn">Upload & Predict</button>
          </div>

          {previewURL && (
            <div className="preview-container">
              <img src={previewURL} alt="Preview" />
            </div>
          )}

          {loading && <p className="loading">🕐 Predicting...</p>}
          {prediction && <h2 style={{ marginTop: '1rem' }}>{prediction}</h2>}
        </div>
      )}
    </div>
  );
}

export default App;
