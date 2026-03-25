'use client';
import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';

const STEPS = [
  { id: 1, label: 'Reading image data...' },
  { id: 2, label: 'Sending to AI Vision model...' },
  { id: 3, label: 'Extracting menu items...' },
  { id: 4, label: 'Categorizing & flagging...' },
];

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | processing | done | error
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');

  const handleFile = (f) => {
    if (!f) return;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(f.type)) {
      setError('Please upload a JPG, PNG, or WebP image.');
      return;
    }
    if (f.size > 20 * 1024 * 1024) {
      setError('File size must be under 20MB.');
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const onFileChange = (e) => handleFile(e.target.files?.[0]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0]);
  }, []);

  const onDragOver = (e) => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setStatus('processing');
    setActiveStep(1);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      setActiveStep(2);
      const res = await fetch('/api/extract', { method: 'POST', body: formData });
      setActiveStep(3);

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Extraction failed');

      setActiveStep(4);
      // Store in sessionStorage for results page
      sessionStorage.setItem('menuData', JSON.stringify(data));
      sessionStorage.setItem('menuFileName', file.name);

      setTimeout(() => {
        setStatus('done');
        router.push('/results');
      }, 600);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setStatus('idle');
    setActiveStep(0);
    setError('');
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="upload-page">
        <div className="container" style={{ maxWidth: 700 }}>
          <div className="upload-header">
            <h1>Upload Your Menu</h1>
            <p>Take a clear photo of your physical menu — blurry is okay, we handle it.</p>
          </div>

          {status === 'idle' && (
            <>
              <div
                className={`upload-zone ${dragging ? 'dragging' : ''}`}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => !file && inputRef.current?.click()}
              >
                <div className="upload-zone-inner">
                  <div className="upload-icon-wrap">
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                  </div>
                  <h2>Drop your menu photo here</h2>
                  <p>or click to browse from your device</p>
                  <div className="upload-formats">
                    {['JPG', 'PNG', 'WebP', 'Up to 20MB'].map(f => (
                      <span key={f} className="format-pill">{f}</span>
                    ))}
                  </div>
                </div>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                  id="menu-file-input"
                />
              </div>

              {file && (
                <div className="preview-section animate-fadeIn">
                  <div className="preview-card">
                    <img src={preview} alt="Menu preview" className="preview-thumbnail" />
                    <div className="preview-info">
                      <div className="preview-filename">{file.name}</div>
                      <div className="preview-size">{formatSize(file.size)}</div>
                      <div className="preview-actions">
                        <button className="btn btn-primary" onClick={handleSubmit} id="digitise-btn">
                          ✨ Digitise This Menu
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={reset}>
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!file && (
                <div style={{ textAlign: 'center', marginTop: '24px' }}>
                  <button className="btn btn-secondary" onClick={() => inputRef.current?.click()} id="browse-btn">
                    Browse Files
                  </button>
                </div>
              )}
            </>
          )}

          {status === 'processing' && (
            <div className="processing-card animate-fadeIn">
              <div className="spinner" />
              <h2 style={{ fontWeight: 700, marginBottom: '8px' }}>Digitising your menu...</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Our AI is reading every item from your menu photo
              </p>
              <div className="processing-steps">
                {STEPS.map((step) => (
                  <div
                    key={step.id}
                    className={`step-item ${activeStep === step.id ? 'active' : activeStep > step.id ? 'done' : ''}`}
                  >
                    <div className="step-dot" />
                    <span>{step.label}</span>
                    {activeStep > step.id && <span style={{ marginLeft: 'auto', fontSize: '0.8rem' }}>✓</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {status === 'error' && (
            <>
              <div className="error-card animate-fadeIn">
                <span style={{ fontSize: '1.2rem' }}>⚠️</span>
                <div>
                  <strong style={{ display: 'block', marginBottom: '4px' }}>Extraction Failed</strong>
                  <span style={{ fontSize: '0.875rem' }}>{error}</span>
                </div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <button className="btn btn-primary" onClick={reset}>Try Again</button>
              </div>
            </>
          )}

          {error && status === 'idle' && (
            <div className="error-card animate-fadeIn" style={{ marginTop: '16px' }}>
              <span>⚠️</span>
              <span style={{ fontSize: '0.875rem' }}>{error}</span>
            </div>
          )}
        </div>
      </div>
      <footer className="footer">
        <div className="container">
          <p>© 2025 MenuAI · Secure · Private · Fast</p>
        </div>
      </footer>
    </div>
  );
}
