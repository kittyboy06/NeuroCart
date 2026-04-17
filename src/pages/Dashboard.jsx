import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import Navbar from '../components/Navbar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CHART_COLORS = ['#6C5CE7', '#00D2FF', '#00F5A0', '#FF6B9D', '#FBBF24'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <p className="chart-tooltip-label">{label}</p>
        <p className="chart-tooltip-value">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalSessions: 0,
    totalEvents: 0,
    totalCartAdds: 0,
    topCategory: '—',
  });
  const [clickData, setClickData] = useState([]);
  const [hoverData, setHoverData] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);

      // Fetch all data in parallel
      const [sessionsRes, eventsRes, productsRes, dealsRes] = await Promise.all([
        supabase.from('sessions').select('id', { count: 'exact', head: true }),
        supabase.from('behavior_events').select('*'),
        supabase.from('products').select('*'),
        supabase.from('deals').select('*, products(name)'),
      ]);

      const events = eventsRes.data || [];
      const products = productsRes.data || [];
      const productMap = {};
      products.forEach((p) => { productMap[p.id] = p; });

      // Metrics
      const cartAdds = events.filter((e) => e.event_type === 'cart_add').length;

      // Top category by total events
      const categoryCounts = {};
      events.forEach((e) => {
        const product = productMap[e.product_id];
        if (product) {
          categoryCounts[product.category] = (categoryCounts[product.category] || 0) + 1;
        }
      });
      const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

      setMetrics({
        totalSessions: sessionsRes.count || 0,
        totalEvents: events.length,
        totalCartAdds: cartAdds,
        topCategory: topCategory ? topCategory[0] : '—',
      });

      // Click data - top 5
      const clickCounts = {};
      events
        .filter((e) => e.event_type === 'click')
        .forEach((e) => {
          const name = productMap[e.product_id]?.name || 'Unknown';
          clickCounts[name] = (clickCounts[name] || 0) + 1;
        });
      const clickArr = Object.entries(clickCounts)
        .map(([name, count]) => ({ name: name.length > 15 ? name.slice(0, 15) + '…' : name, clicks: count }))
        .sort((a, b) => b.clicks - a.clicks)
        .slice(0, 5);
      setClickData(clickArr);

      // Hover data - top 5 by total duration
      const hoverDurations = {};
      events
        .filter((e) => e.event_type === 'hover')
        .forEach((e) => {
          const name = productMap[e.product_id]?.name || 'Unknown';
          hoverDurations[name] = (hoverDurations[name] || 0) + (e.duration_ms || 0);
        });
      const hoverArr = Object.entries(hoverDurations)
        .map(([name, ms]) => ({
          name: name.length > 15 ? name.slice(0, 15) + '…' : name,
          seconds: Math.round((ms / 1000) * 10) / 10,
        }))
        .sort((a, b) => b.seconds - a.seconds)
        .slice(0, 5);
      setHoverData(hoverArr);

      // Deals
      setDeals(dealsRes.data || []);
      setLoading(false);
    };

    fetchDashboard();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);

  if (loading) {
    return (
      <div className="dashboard-page">
        <Navbar />
        <main className="dashboard-main">
          <div className="dashboard-loading">
            <span className="btn-spinner large" />
            <p>Loading analytics...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-main">
        <div className="dashboard-header">
          <h1 className="dashboard-title">
            Retailer <span className="text-gradient">Dashboard</span>
          </h1>
          <p className="dashboard-subtitle">
            Real-time customer engagement analytics
          </p>
        </div>

        {/* Metric Cards */}
        <div className="metrics-grid">
          <div className="metric-card metric-violet">
            <div className="metric-icon">👥</div>
            <div className="metric-value">{metrics.totalSessions}</div>
            <div className="metric-label">Total Sessions</div>
          </div>
          <div className="metric-card metric-cyan">
            <div className="metric-icon">⚡</div>
            <div className="metric-value">{metrics.totalEvents}</div>
            <div className="metric-label">Total Events</div>
          </div>
          <div className="metric-card metric-green">
            <div className="metric-icon">🛒</div>
            <div className="metric-value">{metrics.totalCartAdds}</div>
            <div className="metric-label">Cart Adds</div>
          </div>
          <div className="metric-card metric-amber">
            <div className="metric-icon">🏆</div>
            <div className="metric-value metric-value-text">{metrics.topCategory}</div>
            <div className="metric-label">Top Category</div>
          </div>
        </div>

        {/* Charts */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3 className="chart-title">Top Clicked Products</h3>
            {clickData.length === 0 ? (
              <div className="chart-empty">No click data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={clickData} margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="clicks" radius={[8, 8, 0, 0]}>
                    {clickData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="chart-card">
            <h3 className="chart-title">Top Hovered Products</h3>
            {hoverData.length === 0 ? (
              <div className="chart-empty">No hover data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hoverData} margin={{ top: 10, right: 20, bottom: 40, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#9CA3AF', fontSize: 11 }}
                    angle={-25}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fill: '#9CA3AF', fontSize: 12 }} unit="s" />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="seconds" radius={[8, 8, 0, 0]}>
                    {hoverData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Deals Table */}
        <div className="deals-section">
          <h3 className="chart-title">Active Deals</h3>
          <div className="deals-table-wrapper">
            <table className="deals-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Discount</th>
                  <th>Trigger Score</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {deals.map((deal) => (
                  <tr key={deal.id}>
                    <td>{deal.products?.name || '—'}</td>
                    <td className="deal-discount-cell">{deal.discount_percent}%</td>
                    <td>{deal.trigger_score}</td>
                    <td>
                      <span className={`status-badge ${deal.active ? 'active' : 'inactive'}`}>
                        {deal.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
