'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Beverages', 'Sides', 'Combos'];

const FLAG_MESSAGES = {
  missing_veg_info: '🟡 Veg/Non-Veg not specified',
  missing_price: '💰 Price not found',
  missing_description: '📝 Description missing',
};

function VegBadge({ isVeg }) {
  if (isVeg === true) return <span className="badge badge-veg">🟢 Veg</span>;
  if (isVeg === false) return <span className="badge badge-non-veg">🔴 Non-Veg</span>;
  return <span className="badge badge-unknown">❓ Unknown</span>;
}

function MenuItemCard({ item }) {
  const hasFlags = item.flags && item.flags.length > 0;
  return (
    <div className={`menu-item-card ${hasFlags ? 'has-flags' : ''}`}>
      <div className="item-header">
        <div className="item-name">{item.name}</div>
        {item.price
          ? <div className="item-price">{item.price}</div>
          : <div className="item-price-missing">Price N/A</div>
        }
      </div>

      <div className="badge-row">
        <VegBadge isVeg={item.isVeg} />
        <span className="badge badge-category">{item.category}</span>
      </div>

      {item.description
        ? <div className="item-desc">{item.description}</div>
        : <div className="item-desc-missing">No description available</div>
      }

      {hasFlags && (
        <div className="flag-list">
          {item.flags.map(flag => (
            <div key={flag} className="flag-item">
              {FLAG_MESSAGES[flag] || flag}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ResultsPage() {
  const [menuData, setMenuData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = sessionStorage.getItem('menuData');
    const name = sessionStorage.getItem('menuFileName');
    if (raw) {
      setMenuData(JSON.parse(raw));
      setFileName(name || 'menu.jpg');
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="page-wrapper">
        <Navbar />
        <div style={{ textAlign: 'center', padding: '150px 24px' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📭</div>
          <h2 style={{ marginBottom: '12px' }}>No catalog data found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>Please upload a menu photo first.</p>
          <Link href="/upload" className="btn btn-primary">Upload a Menu</Link>
        </div>
      </div>
    );
  }

  const items = menuData.items || [];
  const totalFlags = items.reduce((acc, i) => acc + (i.flags?.length || 0), 0);
  const vegCount = items.filter(i => i.isVeg === true).length;
  const nonVegCount = items.filter(i => i.isVeg === false).length;

  // Build category counts
  const catCounts = {};
  items.forEach(item => {
    catCounts[item.category] = (catCounts[item.category] || 0) + 1;
  });

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category === activeCategory);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(menuData.items, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName.replace(/\.[^.]+$/, '')}_catalog.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <div className="results-page">
        <div className="container">
          {/* Header */}
          <div className="results-header">
            <div className="results-title">
              <h1>Digital Catalog</h1>
              <p>Extracted from <strong>{fileName}</strong> · {items.length} items found</p>
            </div>
            <div className="results-actions">
              <button className="btn btn-secondary btn-sm" onClick={handleExport} id="export-btn">
                ⬇️ Export JSON
              </button>
              <Link href="/upload" className="btn btn-primary btn-sm" id="upload-another-btn">
                + Upload Another
              </Link>
            </div>
          </div>

          {/* Summary Pills */}
          <div className="summary-bar">
            <div className="summary-pill">
              <span className="pill-num" style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{items.length}</span>
              <span>Total Items</span>
            </div>
            <div className="summary-pill">
              <span className="pill-num" style={{ color: 'var(--veg)' }}>{vegCount}</span>
              <span>🟢 Veg</span>
            </div>
            <div className="summary-pill">
              <span className="pill-num" style={{ color: 'var(--non-veg)' }}>{nonVegCount}</span>
              <span>🔴 Non-Veg</span>
            </div>
            {totalFlags > 0 && (
              <div className="summary-pill" style={{ borderColor: 'rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.06)' }}>
                <span className="pill-num" style={{ color: 'var(--warning)' }}>{totalFlags}</span>
                <span style={{ color: 'var(--warning)' }}>⚠️ Flags</span>
              </div>
            )}
            <div className="summary-pill">
              <span className="pill-num" style={{ color: '#a78bfa' }}>{Object.keys(catCounts).length}</span>
              <span>Categories</span>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="category-tabs">
            {CATEGORIES.map(cat => {
              const count = cat === 'All' ? items.length : (catCounts[cat] || 0);
              if (cat !== 'All' && count === 0) return null;
              return (
                <button
                  key={cat}
                  className={`category-tab ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  id={`tab-${cat.toLowerCase()}`}
                >
                  {cat}
                  <span className="tab-count">{count}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Grid */}
          {filtered.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.4 }}>🍽️</div>
              <h3>No items in this category</h3>
              <p>Try selecting a different category above.</p>
            </div>
          ) : (
            <div className="catalog-grid">
              {filtered.map(item => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          )}

          {totalFlags > 0 && (
            <div style={{
              marginTop: '48px', padding: '20px 24px', borderRadius: 'var(--radius)',
              background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)'
            }}>
              <strong style={{ color: 'var(--warning)' }}>⚠️ {totalFlags} items need attention</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '6px' }}>
                Some items are missing Veg/Non-Veg info, prices, or descriptions. 
                Items with orange borders above have flags — please review and complete them before publishing.
              </p>
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
