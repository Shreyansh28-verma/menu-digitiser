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

const DEMO_DATA = {
  items: [
    { id: 'item-0', name: 'Paneer Tikka', category: 'Starters', isVeg: true, price: '₹180', description: 'Grilled cottage cheese cubes marinated in spiced yoghurt, served with mint chutney.', flags: [] },
    { id: 'item-1', name: 'Chicken Seekh Kebab', category: 'Starters', isVeg: false, price: '₹220', description: 'Minced chicken blended with herbs and spices, grilled on skewers.', flags: [] },
    { id: 'item-2', name: 'Veg Spring Rolls', category: 'Starters', isVeg: true, price: '₹140', description: 'Crispy rolls stuffed with seasoned vegetables and noodles.', flags: [] },
    { id: 'item-3', name: 'Tandoori Prawns', category: 'Starters', isVeg: false, price: '₹320', description: null, flags: ['missing_description'] },
    { id: 'item-4', name: 'Hara Bhara Kabab', category: 'Starters', isVeg: true, price: '₹160', description: 'Shallow fried patties made with spinach, peas and potatoes.', flags: [] },
    { id: 'item-5', name: 'Dal Makhani', category: 'Mains', isVeg: true, price: '₹240', description: 'Slow cooked black lentils in a rich buttery tomato gravy.', flags: [] },
    { id: 'item-6', name: 'Butter Chicken', category: 'Mains', isVeg: false, price: '₹280', description: 'Tender chicken in a creamy tomato-based sauce with aromatic spices.', flags: [] },
    { id: 'item-7', name: 'Palak Paneer', category: 'Mains', isVeg: true, price: '₹220', description: 'Fresh cottage cheese cubes in a smooth spiced spinach gravy.', flags: [] },
    { id: 'item-8', name: 'Mutton Rogan Josh', category: 'Mains', isVeg: false, price: '₹360', description: 'Slow-braised mutton in a bold Kashmiri spice gravy.', flags: [] },
    { id: 'item-9', name: 'Veg Biryani', category: 'Mains', isVeg: true, price: '₹200', description: 'Fragrant basmati rice layered with seasonal vegetables and whole spices.', flags: [] },
    { id: 'item-10', name: 'Fish Curry', category: 'Mains', isVeg: false, price: null, description: 'Coastal style fish curry with coconut milk and tamarind.', flags: ['missing_price'] },
    { id: 'item-11', name: 'Shahi Paneer', category: 'Mains', isVeg: true, price: '₹260', description: null, flags: ['missing_description'] },
    { id: 'item-12', name: 'Mystery Special', category: 'Mains', isVeg: null, price: '₹299', description: 'Chef\'s secret recipe — ask your server for details.', flags: ['missing_veg_info'] },
    { id: 'item-13', name: 'Gulab Jamun', category: 'Desserts', isVeg: true, price: '₹90', description: 'Soft milk-solid dumplings soaked in rose-scented sugar syrup.', flags: [] },
    { id: 'item-14', name: 'Kulfi Falooda', category: 'Desserts', isVeg: true, price: '₹130', description: 'Traditional Indian ice cream served with vermicelli and rose syrup.', flags: [] },
    { id: 'item-15', name: 'Chocolate Brownie', category: 'Desserts', isVeg: true, price: '₹160', description: 'Warm fudgy brownie served with a scoop of vanilla ice cream.', flags: [] },
    { id: 'item-16', name: 'Mango Lassi', category: 'Beverages', isVeg: true, price: '₹90', description: 'Chilled yoghurt-based drink blended with Alphonso mangoes.', flags: [] },
    { id: 'item-17', name: 'Masala Chai', category: 'Beverages', isVeg: true, price: '₹50', description: 'Spiced milk tea brewed with ginger, cardamom and cinnamon.', flags: [] },
    { id: 'item-18', name: 'Cold Coffee', category: 'Beverages', isVeg: true, price: '₹110', description: 'Blended iced coffee with cream and sugar.', flags: [] },
    { id: 'item-19', name: 'Steamed Rice', category: 'Sides', isVeg: true, price: '₹60', description: null, flags: ['missing_description'] },
    { id: 'item-20', name: 'Butter Naan', category: 'Sides', isVeg: true, price: '₹40', description: 'Soft leavened flatbread baked in a tandoor, brushed with butter.', flags: [] },
    { id: 'item-21', name: 'Raita', category: 'Sides', isVeg: true, price: '₹60', description: 'Chilled yoghurt with cucumber, cumin and fresh herbs.', flags: [] },
  ],
  count: 22,
};

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState('idle');
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

  // ── Real AI extraction ──
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
      // Auto-fallback to demo if quota exceeded
      if (data.code === 'quota_exceeded' || res.status === 429) {
        setActiveStep(4);
        sessionStorage.setItem('menuData', JSON.stringify(DEMO_DATA));
        sessionStorage.setItem('menuFileName', file.name);
        sessionStorage.setItem('menuIsDemo', 'true');
        setTimeout(() => { setStatus('done'); router.push('/results'); }, 600);
        return;
      }
      if (!res.ok) throw new Error(data.error || 'Extraction failed');

      setActiveStep(4);
      // Merge with existing data if it exists
      const existingRaw = sessionStorage.getItem('menuData');
      if (existingRaw) {
        try {
          const existingData = JSON.parse(existingRaw);
          if (existingData && Array.isArray(existingData.items)) {
            data.items = [...existingData.items, ...data.items];
            data.count = data.items.length;
          }
        } catch (e) {
          console.error("Failed to parse existing menu data", e);
        }
      }

      sessionStorage.setItem('menuData', JSON.stringify(data));
      
      const prevNames = sessionStorage.getItem('menuFileName');
      const newNames = prevNames ? `${prevNames}, ${file.name}` : file.name;
      sessionStorage.setItem('menuFileName', newNames);
      
      sessionStorage.setItem('menuIsDemo', 'false');

      setTimeout(() => { setStatus('done'); router.push('/results'); }, 600);
    } catch (err) {
      setStatus('error');
      setError(err.message);
    }
  };

  // ── Demo mode — no API call ──
  const handleDemo = () => {
    setStatus('processing');
    setActiveStep(1);

    const steps = [1, 2, 3, 4];
    steps.forEach((step, i) => {
      setTimeout(() => setActiveStep(step), i * 500);
    });

    setTimeout(() => {
      sessionStorage.setItem('menuData', JSON.stringify(DEMO_DATA));
      sessionStorage.setItem('menuFileName', 'sample_indian_restaurant_menu.jpg');
      sessionStorage.setItem('menuIsDemo', 'true');
      router.push('/results');
    }, 2400);
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

              {/* Browse + Demo buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px', flexWrap: 'wrap' }}>
                {!file && (
                  <button className="btn btn-secondary" onClick={() => inputRef.current?.click()} id="browse-btn">
                    Browse Files
                  </button>
                )}
                <button
                  className="btn btn-secondary"
                  onClick={handleDemo}
                  id="demo-btn"
                  style={{ borderColor: 'rgba(0,201,167,0.4)', color: 'var(--accent-1)' }}
                >
                  🎬 Try with Demo Menu
                </button>
              </div>

              {/* Demo hint */}
              <p style={{
                textAlign: 'center', marginTop: '12px',
                fontSize: '0.78rem', color: 'var(--text-muted)'
              }}>
                No API key? Use the demo to see AI extraction results instantly.
              </p>
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
              <div style={{ marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={reset}>Try Again</button>
                <button
                  className="btn btn-primary"
                  onClick={handleDemo}
                  id="demo-fallback-btn"
                >
                  🎬 Try Demo Instead
                </button>
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
