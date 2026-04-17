import { useState } from 'react';

export default function DealPopup({ deal, onDismiss }) {
  const [visible, setVisible] = useState(true);

  if (!deal || !visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    if (onDismiss) onDismiss();
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const productName = deal.products?.name || 'Product';
  const originalPrice = deal.products?.price || 0;
  const discountedPrice = originalPrice * (1 - deal.discount_percent / 100);

  return (
    <div className="deal-popup">
      <button className="deal-dismiss" onClick={handleDismiss}>
        ✕
      </button>
      <div className="deal-content">
        <span className="deal-emoji">🎉</span>
        <h3 className="deal-title">Deal Unlocked!</h3>
        <p className="deal-subtitle">You've been exploring! Here's a reward:</p>

        <div className="deal-product">
          <span className="deal-product-name">{productName}</span>
          <div className="deal-pricing">
            <span className="deal-original">{formatPrice(originalPrice)}</span>
            <span className="deal-discount">-{deal.discount_percent}%</span>
          </div>
          <span className="deal-final">{formatPrice(discountedPrice)}</span>
        </div>

        <button className="btn-claim" onClick={handleDismiss}>
          Claim Deal
        </button>
      </div>
    </div>
  );
}
