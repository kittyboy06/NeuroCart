export default function RecommendationPanel({ recommendations, isUpdating }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <aside className="rec-panel">
      <div className="rec-header">
        <div className="rec-title-row">
          <h2 className="rec-title">For You</h2>
          {isUpdating && <span className="rec-pulse" />}
        </div>
        <p className="rec-subtitle">Updates as you browse</p>
      </div>

      <div className="rec-list">
        {recommendations.length === 0 ? (
          <div className="rec-empty">
            <span className="rec-empty-icon">🔍</span>
            <p>Browse products to get recommendations</p>
          </div>
        ) : (
          recommendations.map((product) => (
            <div key={product.id} className="rec-card">
              <img
                src={product.image_url}
                alt={product.name}
                className="rec-image"
                loading="lazy"
              />
              <div className="rec-info">
                <h4 className="rec-name">{product.name}</h4>
                <span className="rec-price">{formatPrice(product.price)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
