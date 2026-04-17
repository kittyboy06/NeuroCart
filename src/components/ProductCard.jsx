import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CATEGORY_COLORS = {
  audio: { bg: 'rgba(108, 92, 231, 0.2)', text: '#A78BFA' },
  phones: { bg: 'rgba(0, 210, 255, 0.2)', text: '#00D2FF' },
  laptops: { bg: 'rgba(59, 130, 246, 0.2)', text: '#60A5FA' },
  accessories: { bg: 'rgba(245, 158, 11, 0.2)', text: '#FBBF24' },
  footwear: { bg: 'rgba(0, 245, 160, 0.2)', text: '#00F5A0' },
};

export default function ProductCard({
  product,
  onHoverStart,
  onHoverEnd,
  onClick,
  onCartAdd,
}) {
  const [addedFeedback, setAddedFeedback] = useState(false);
  const navigate = useNavigate();
  const categoryStyle = CATEGORY_COLORS[product.category] || CATEGORY_COLORS.audio;

  const handleCartAdd = (e) => {
    e.stopPropagation();
    onCartAdd(product.id);
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 1000);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div
      className="product-card"
      onMouseEnter={() => onHoverStart(product.id)}
      onMouseLeave={() => onHoverEnd(product.id)}
      onClick={() => {
        onClick(product.id);
        navigate(`/product/${product.id}`);
      }}
    >
      <div className="product-image-wrapper">
        <img
          src={product.image_url}
          alt={product.name}
          className="product-image"
          loading="lazy"
        />
        <span
          className="category-badge"
          style={{
            background: categoryStyle.bg,
            color: categoryStyle.text,
          }}
        >
          {product.category}
        </span>
      </div>

      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-description">{product.description}</p>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.price)}</span>
          <button
            className={`btn-cart ${addedFeedback ? 'btn-cart-added' : ''}`}
            onClick={handleCartAdd}
          >
            {addedFeedback ? '✓ Added!' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
}
