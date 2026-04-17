import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useBehaviorTracker } from '../hooks/useBehaviorTracker';
import { useRecommendations } from '../hooks/useRecommendations';
import { useSession } from '../hooks/useSession';
import { useCart } from '../contexts/CartContext';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import RecommendationPanel from '../components/RecommendationPanel';
import DealPopup from '../components/DealPopup';

export default function Store() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const { sessionId } = useSession();
  const { addToCart } = useCart();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoadingProducts(true);
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('category');
      setProducts(data || []);
      setLoadingProducts(false);
    };
    fetchProducts();
  }, []);

  const { trackClick, trackHoverStart, trackHoverEnd, trackCartAdd } =
    useBehaviorTracker(sessionId);
  const { recommendations, engagementScore, unlockedDeal, isUpdating } =
    useRecommendations(sessionId);

  const handleCartAdd = useCallback(
    (productId) => {
      trackCartAdd(productId);
      const product = products.find((p) => p.id === productId);
      if (product) {
        addToCart(product);
      }
    },
    [products, trackCartAdd, addToCart]
  );

  return (
    <div className="store-page">
      <Navbar />

      <main className="store-main">
        <div className="store-header">
          <h1 className="store-title">
            Discover <span className="text-gradient">Premium</span> Products
          </h1>
          <p className="store-subtitle">
            Browse and explore — your experience adapts as you shop
          </p>
          {engagementScore > 0 && (
            <div className="engagement-indicator">
              <span className="engagement-dot" />
              Engagement Score: <strong>{engagementScore}</strong>
            </div>
          )}
          
          <div className="category-filters">
            {['All', 'audio', 'phones', 'laptops', 'accessories', 'footwear'].map((cat) => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="store-layout">
          <section className="product-grid-section">
            {loadingProducts ? (
              <div className="loading-grid">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="skeleton-card" />
                ))}
              </div>
            ) : (
              <div className="product-grid">
                {products
                  .filter((p) => selectedCategory === 'All' || p.category === selectedCategory)
                  .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onHoverStart={trackHoverStart}
                    onHoverEnd={trackHoverEnd}
                    onClick={trackClick}
                    onCartAdd={handleCartAdd}
                  />
                ))}
              </div>
            )}
          </section>

          <RecommendationPanel
            recommendations={recommendations}
            isUpdating={isUpdating}
          />
        </div>
      </main>

      <DealPopup deal={unlockedDeal} />
    </div>
  );
}
