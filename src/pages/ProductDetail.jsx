import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useCart } from '../contexts/CartContext';
import { useSession } from '../hooks/useSession';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import Navbar from '../components/Navbar';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { sessionId } = useSession();
  const { trackHoverStart, trackHoverEnd, trackCartAdd } = useBehaviorTracker(sessionId);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      setProduct(data);
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    trackCartAdd(product.id);
    addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="store-page">
        <Navbar />
        <main className="store-main">
          <div className="product-detail-layout loading-state">
            <span className="btn-spinner large" />
          </div>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="store-page">
        <Navbar />
        <main className="store-main">
          <h2>Product Not Found</h2>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">
            Back to Store
          </button>
        </main>
      </div>
    );
  }

  return (
    <div className="store-page">
      <Navbar />
      <main className="store-main" style={{ padding: '0 2rem' }}>
        <button onClick={() => navigate('/')} className="btn-back">
          ← Back to Store
        </button>

        <div 
          className="product-detail-layout"
          onMouseEnter={() => trackHoverStart(product.id)}
          onMouseLeave={() => trackHoverEnd(product.id)}
        >
          <div className="detail-image-wrapper">
            <img 
              src={product.image_url} 
              alt={product.name} 
              className="detail-image" 
            />
            <span className="detail-category-badge">{product.category}</span>
          </div>

          <div className="detail-info">
            <h1 className="detail-title">{product.name}</h1>
            <p className="detail-price">{formatPrice(product.price)}</p>
            <p className="detail-description">{product.description}</p>
            
            <button 
              className={`btn-add-huge ${added ? 'added' : ''}`}
              onClick={handleAddToCart}
            >
              {added ? '✓ Added contextually!' : 'Add to Cart 🛒'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
