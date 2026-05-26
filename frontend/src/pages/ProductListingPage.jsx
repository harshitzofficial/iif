import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Search, Sparkles, ArrowRight } from 'lucide-react';
import API_URL from '../config';

export default function ProductListingPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch products', err);
        setLoading(false);
      });
  }, []);

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  if (loading) {
    return (
      <div className="products-container animate-fade-in-up">
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ height: '50px', width: '300px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '1rem', animation: 'pulse 2s infinite' }}></div>
          <div style={{ height: '20px', width: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', animation: 'pulse 2s infinite' }}></div>
        </div>
        <div className="products-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="product-card" style={{ height: '420px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', animation: 'pulse 2s infinite' }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="products-container animate-fade-in-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '3rem', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h1 className="page-title" style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Sparkles color="var(--color-primary)" size={36} /> Curated Collection
          </h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.15rem' }}>Discover our premium selection of high-end assets.</p>
        </div>
        
        <div style={{ position: 'relative', width: '350px', maxWidth: '100%' }}>
          <Search size={20} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search premium products..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '1.1rem 1rem 1.1rem 3.2rem', 
              background: 'var(--color-bg-glass)', 
              border: '1px solid var(--color-border)', 
              borderRadius: 'var(--radius-full)', 
              color: 'var(--color-text)', 
              outline: 'none', 
              transition: 'all 0.3s ease', 
              backdropFilter: 'blur(10px)',
              fontSize: '1rem',
              boxShadow: 'var(--shadow-glass)'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--color-primary)';
              e.target.style.boxShadow = '0 0 15px rgba(139, 92, 246, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--color-border)';
              e.target.style.boxShadow = 'var(--shadow-glass)';
            }}
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="animate-scale-in" style={{ textAlign: 'center', padding: '6rem 2rem', background: 'var(--color-bg-glass)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', backdropFilter: 'blur(12px)' }}>
          <Package size={80} color="var(--color-text-muted)" style={{ margin: '0 auto 1.5rem', opacity: 0.3 }} />
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>No products found</h2>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>We couldn't find anything matching "{searchQuery}".</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product, index) => (
            <div key={product.id} className="product-card animate-fade-in-up" style={{ animationDelay: `${index * 0.08}s` }}>
              <div style={{ position: 'relative', overflow: 'hidden' }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="product-image" />
                ) : (
                  <div className="product-image">
                    <Package size={64} color="#94a3b8" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '15px', right: '15px', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '0.4rem 1rem', borderRadius: 'var(--radius-full)', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid rgba(255,255,255,0.15)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  Trending
                </div>
              </div>
              <div className="product-info">
                <h2 className="product-name">{product.name}</h2>
                <p className="product-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3rem' }}>
                  {product.description || 'Premium item available for rent.'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
                  <div className="product-price" style={{ margin: 0 }}>₹{product.price.toFixed(2)}</div>
                  <Link to={`/product/${product.id}`} className="btn-secondary" style={{ padding: '0.7rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.95rem' }}>
                    View <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
