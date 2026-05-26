import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, ArrowLeft, ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import API_URL from '../config';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/products/${id}`)
      .then(res => res.json())
      .then(data => {
        setProduct(data);
        if (data.imageUrls && data.imageUrls.length > 0) {
          setSelectedImage(data.imageUrls[0]);
        } else if (data.imageUrl) {
          setSelectedImage(data.imageUrl);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch product details', err);
        setLoading(false);
      });
  }, [id]);

  const addToCart = async () => {
    setAdding(true);
    try {
      await fetch(`${API_URL}/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, quantity: 1 })
      });
      // Dispatch custom event to update navbar cart count
      window.dispatchEvent(new Event('cartUpdated'));
      navigate('/cart');
    } catch (error) {
      console.error('Failed to add to cart', error);
      setAdding(false);
    }
  };

  const handlePrevImage = () => {
    if (!product || !product.imageUrls) return;
    const currentIndex = product.imageUrls.indexOf(selectedImage);
    const prevIndex = currentIndex === 0 ? product.imageUrls.length - 1 : currentIndex - 1;
    setSelectedImage(product.imageUrls[prevIndex]);
  };

  const handleNextImage = () => {
    if (!product || !product.imageUrls) return;
    const currentIndex = product.imageUrls.indexOf(selectedImage);
    const nextIndex = currentIndex === product.imageUrls.length - 1 ? 0 : currentIndex + 1;
    setSelectedImage(product.imageUrls[nextIndex]);
  };

  if (loading) return <div className="spinner"></div>;
  if (!product) return <div>Product not found</div>;

  const totalCost = product.price + product.securityDeposit + product.deliveryCharges;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-secondary" style={{ marginBottom: '2rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="product-detail animate-scale-in">
        <div className="detail-image-container">
          {selectedImage ? (
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <img src={selectedImage} alt={product.name} className="detail-image" style={{ width: '100%', display: 'block' }} />
              
              {product.imageUrls && product.imageUrls.length > 1 && (
                <>
                  <button 
                    onClick={handlePrevImage}
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', color: '#333', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={handleNextImage}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.9)', color: '#333', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', transition: 'all 0.2s ease' }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#fff'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.9)'}
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="detail-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
              <Package size={128} color="#94a3b8" />
            </div>
          )}
          
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="image-gallery" style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', padding: '0.5rem 0' }}>
              {product.imageUrls.map((url, index) => (
                <img 
                  key={index} 
                  src={url} 
                  alt={`${product.name} ${index + 1}`} 
                  onClick={() => setSelectedImage(url)}
                  style={{ 
                    width: '80px', 
                    height: '80px', 
                    objectFit: 'cover', 
                    borderRadius: '8px', 
                    cursor: 'pointer',
                    border: selectedImage === url ? '2px solid var(--color-primary)' : '2px solid transparent',
                    opacity: selectedImage === url ? 1 : 0.7,
                    transition: 'all 0.2s ease'
                  }} 
                />
              ))}
            </div>
          )}
        </div>

        <div className="detail-info">
          <h1>{product.name}</h1>
          <p className="detail-desc">{product.description || 'No description available for this product.'}</p>
          
          <div className="product-specs" style={{ margin: '1.5rem 0', padding: '1.5rem', background: 'var(--color-bg-secondary)', borderRadius: '12px', border: '1px solid var(--color-border)' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--color-text)', fontWeight: '600' }}>Specifications</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.95rem', color: 'var(--color-text)' }}>
              {product.rawItemDetails?.item_type && <div><strong style={{color: 'var(--color-text-muted)'}}>Item Type:</strong> {product.rawItemDetails.item_type}</div>}
              {product.rawItemDetails?.unit && <div><strong style={{color: 'var(--color-text-muted)'}}>Unit:</strong> {product.rawItemDetails.unit}</div>}
              {product.rawItemDetails?.manufacturer && <div><strong style={{color: 'var(--color-text-muted)'}}>Manufacturer:</strong> {product.rawItemDetails.manufacturer}</div>}
              {product.rawItemDetails?.brand && <div><strong style={{color: 'var(--color-text-muted)'}}>Brand:</strong> {product.rawItemDetails.brand}</div>}
              {(product.rawItemDetails?.weight || product.rawItemDetails?.package_details?.weight) ? (
                <div><strong style={{color: 'var(--color-text-muted)'}}>Weight:</strong> {product.rawItemDetails.weight || product.rawItemDetails.package_details?.weight} {product.rawItemDetails.weight_unit || product.rawItemDetails.package_details?.weight_unit}</div>
              ) : null}
              {(product.rawItemDetails?.length || product.rawItemDetails?.package_details?.length) ? (
                <div>
                  <strong style={{color: 'var(--color-text-muted)'}}>Dimensions:</strong> {product.rawItemDetails.length || product.rawItemDetails.package_details?.length} x {product.rawItemDetails.width || product.rawItemDetails.package_details?.width} x {product.rawItemDetails.height || product.rawItemDetails.package_details?.height} {product.rawItemDetails.dimension_unit || product.rawItemDetails.package_details?.dimension_unit}
                </div>
              ) : null}
            </div>
          </div>
          
          <div className="fees-container">
            <div className="fee-row">
              <span>Product Price</span>
              <span>₹{product.price.toFixed(2)}</span>
            </div>
            <div className="fee-row">
              <span>Security Deposit (Custom Field)</span>
              <span>₹{product.securityDeposit.toFixed(2)}</span>
            </div>
            <div className="fee-row">
              <span>Delivery Charges (Custom Field)</span>
              <span>₹{product.deliveryCharges.toFixed(2)}</span>
            </div>
            <div className="fee-row total">
              <span>Total Upfront Cost</span>
              <span>₹{totalCost.toFixed(2)}</span>
            </div>
          </div>

          <button 
            className="btn-primary add-to-cart-btn" 
            onClick={addToCart}
            disabled={adding}
            style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}
          >
            <ShoppingCart size={20} />
            {adding ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
