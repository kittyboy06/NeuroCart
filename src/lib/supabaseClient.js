const initialProducts = [
  { id: 'prod-1', name: 'Sonic Boom Pro Headphones', category: 'audio', price: 12999, description: 'Over-ear noise cancelling headphones.', image_url: 'https://picsum.photos/seed/sonicboom/300/200' },
  { id: 'prod-2', name: 'Aura Earbuds X', category: 'audio', price: 6999, description: 'True wireless earbuds with heavy bass.', image_url: 'https://picsum.photos/seed/auraearbuds/300/200' },
  { id: 'prod-3', name: 'Vibe Portable Speaker', category: 'audio', price: 3999, description: 'Waterproof bluetooth speaker.', image_url: 'https://picsum.photos/seed/vibespeaker/300/200' },
  { id: 'prod-4', name: 'Titan ZXR 14', category: 'phones', price: 85000, description: 'Latest flagship smartphone with AMOLED display.', image_url: 'https://picsum.photos/seed/titanzxr/300/200' },
  { id: 'prod-5', name: 'Atlas Pro Max', category: 'phones', price: 115000, description: 'Premium camera powerhouse with 10x optical zoom.', image_url: 'https://picsum.photos/seed/atlaspro/300/200' },
  { id: 'prod-6', name: 'Nova S Lite', category: 'phones', price: 25000, description: 'Best in class budget phone with long battery life.', image_url: 'https://picsum.photos/seed/novalite/300/200' },
  { id: 'prod-7', name: 'ZenBook Ultra 15', category: 'laptops', price: 145000, description: 'Thin and light workstation with 4K screen.', image_url: 'https://picsum.photos/seed/zenbook/300/200' },
  { id: 'prod-8', name: 'CodeMaster Pro 14', category: 'laptops', price: 120000, description: 'Developer focused portable laptop with 32GB RAM.', image_url: 'https://picsum.photos/seed/codemaster/300/200' },
  { id: 'prod-9', name: 'KeyChron K8 Pro', category: 'accessories', price: 8500, description: 'Mechanical wireless keyboard with hot-swappable switches.', image_url: 'https://picsum.photos/seed/keychron/300/200' },
  { id: 'prod-10', name: 'MX Master 3S', category: 'accessories', price: 9999, description: 'Ergonomic productivity mouse with silent clicks.', image_url: 'https://picsum.photos/seed/mxmaster/300/200' },
  { id: 'prod-11', name: 'AirMax 270', category: 'footwear', price: 12999, description: 'Comfortable lifestyle sneakers with air cushioning.', image_url: 'https://picsum.photos/seed/airmax/300/200' },
  { id: 'prod-12', name: 'UltraBoost 23', category: 'footwear', price: 15999, description: 'Premium running shoes with responsive boost midsole.', image_url: 'https://picsum.photos/seed/ultraboost/300/200' }
];

const initialDeals = [
  { id: 'deal-1', product_id: 'prod-3', discount_percent: 10, trigger_score: 20, active: true },
  { id: 'deal-2', product_id: 'prod-10', discount_percent: 15, trigger_score: 35, active: true },
  { id: 'deal-3', product_id: 'prod-5', discount_percent: 25, trigger_score: 50, active: true }
];

const seedMockData = () => {
  if (!localStorage.getItem('neurocart_mock_products')) {
    localStorage.setItem('neurocart_mock_products', JSON.stringify(initialProducts));
  }
  if (!localStorage.getItem('neurocart_mock_deals')) {
    localStorage.setItem('neurocart_mock_deals', JSON.stringify(initialDeals));
  }
  if (!localStorage.getItem('neurocart_mock_user')) {
    localStorage.setItem('neurocart_mock_user', JSON.stringify({
      id: 'mock-user-demo-id',
      email: 'demo@neurocart.com'
    }));
  }

  if (!localStorage.getItem('neurocart_mock_sessions') || !localStorage.getItem('neurocart_mock_behavior_events')) {
    const sessions = [];
    const events = [];
    const products = initialProducts;

    // Generate 18 realistic sessions to show rich dashboard charts
    for (let i = 0; i < 18; i++) {
      const sessionId = `session-uuid-${i + 1}`;
      const userId = `user-uuid-${i + 1}`;
      sessions.push({
        id: `sess-${i + 1}`,
        session_id: sessionId,
        user_id: userId,
        created_at: new Date(Date.now() - i * 3 * 3600000).toISOString()
      });

      // Generate random events per session
      const numEvents = Math.floor(Math.random() * 15) + 5; // 5 to 20 events
      for (let j = 0; j < numEvents; j++) {
        const product = products[Math.floor(Math.random() * products.length)];
        const eventTypes = ['hover', 'click', 'cart_add'];
        const r = Math.random();
        const eventType = r < 0.65 ? 'hover' : (r < 0.9 ? 'click' : 'cart_add');
        const duration = eventType === 'hover' ? Math.floor(Math.random() * 7500) + 500 : 0;

        events.push({
          id: `event-${i + 1}-${j + 1}`,
          session_id: sessionId,
          product_id: product.id,
          event_type: eventType,
          duration_ms: duration,
          created_at: new Date(Date.now() - i * 3 * 3600000 + j * 45000).toISOString()
        });
      }
    }

    localStorage.setItem('neurocart_mock_sessions', JSON.stringify(sessions));
    localStorage.setItem('neurocart_mock_behavior_events', JSON.stringify(events));
  }
};

// Execute seeding immediately
seedMockData();

class MockQuery {
  constructor(table) {
    this.table = table;
    this.filters = [];
    this.orderField = null;
    this.orderAscending = true;
    this.isSingle = false;
    this.isCountOnly = false;
  }

  select(fields, options = {}) {
    if (options.count) {
      this.isCountOnly = true;
    }
    this.fields = fields;
    return this;
  }

  eq(field, value) {
    this.filters.push({ field, value });
    return this;
  }

  order(field, options = {}) {
    this.orderField = field;
    this.orderAscending = options.ascending !== false;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  async insert(data) {
    const list = JSON.parse(localStorage.getItem(`neurocart_mock_${this.table}`) || '[]');
    const items = Array.isArray(data) ? data : [data];
    const newItems = items.map(item => ({
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      ...item
    }));
    list.push(...newItems);
    localStorage.setItem(`neurocart_mock_${this.table}`, JSON.stringify(list));

    // Also update parent dashboard/analytics totals
    if (this.table === 'sessions') {
      const sessions = JSON.parse(localStorage.getItem('neurocart_mock_sessions') || '[]');
      if (!sessions.some(s => s.session_id === newItems[0].session_id)) {
        sessions.push(newItems[0]);
        localStorage.setItem('neurocart_mock_sessions', JSON.stringify(sessions));
      }
    }

    return { data: Array.isArray(data) ? newItems : newItems[0], error: null };
  }

  async then(resolve) {
    let data = [];
    if (this.table === 'products') {
      data = JSON.parse(localStorage.getItem('neurocart_mock_products') || JSON.stringify(initialProducts));
    } else if (this.table === 'deals') {
      data = JSON.parse(localStorage.getItem('neurocart_mock_deals') || JSON.stringify(initialDeals));
      // Populate joined products
      data = data.map(deal => {
        const productsList = JSON.parse(localStorage.getItem('neurocart_mock_products') || JSON.stringify(initialProducts));
        const product = productsList.find(p => p.id === deal.product_id);
        return {
          ...deal,
          products: product ? {
            name: product.name,
            price: product.price,
            image_url: product.image_url
          } : null
        };
      });
    } else {
      data = JSON.parse(localStorage.getItem(`neurocart_mock_${this.table}`) || '[]');
    }

    // Apply filters
    for (const filter of this.filters) {
      data = data.filter(item => item[filter.field] === filter.value);
    }

    // Apply ordering
    if (this.orderField) {
      data.sort((a, b) => {
        const valA = a[this.orderField];
        const valB = b[this.orderField];
        if (valA < valB) return this.orderAscending ? -1 : 1;
        if (valA > valB) return this.orderAscending ? 1 : -1;
        return 0;
      });
    }

    let result = { data, error: null };

    if (this.isCountOnly) {
      result = { count: data.length, data: null, error: null };
    } else if (this.isSingle) {
      result = { data: data[0] || null, error: null };
    }

    resolve(result);
  }
}

class MockSupabase {
  auth = {
    async getSession() {
      const user = JSON.parse(localStorage.getItem('neurocart_mock_user') || 'null');
      return { data: { session: user ? { user } : null }, error: null };
    },
    onAuthStateChange(callback) {
      const listener = (e) => {
        const user = JSON.parse(localStorage.getItem('neurocart_mock_user') || 'null');
        callback(e.detail?.event || 'SIGNED_IN', user ? { user } : null);
      };
      window.addEventListener('mock_auth_change', listener);
      return {
        data: {
          subscription: {
            unsubscribe() {
              window.removeEventListener('mock_auth_change', listener);
            }
          }
        }
      };
    },
    async signUp({ email, password }) {
      const user = { id: 'mock-user-demo-id', email };
      localStorage.setItem('neurocart_mock_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('mock_auth_change', { detail: { event: 'SIGNED_UP' } }));
      return { data: { user }, error: null };
    },
    async signInWithPassword({ email, password }) {
      const user = { id: 'mock-user-demo-id', email };
      localStorage.setItem('neurocart_mock_user', JSON.stringify(user));
      window.dispatchEvent(new CustomEvent('mock_auth_change', { detail: { event: 'SIGNED_IN' } }));
      return { data: { user }, error: null };
    },
    async signOut() {
      localStorage.removeItem('neurocart_mock_user');
      window.dispatchEvent(new CustomEvent('mock_auth_change', { detail: { event: 'SIGNED_OUT' } }));
      return { error: null };
    }
  };

  from(table) {
    return new MockQuery(table);
  }
}

export const supabase = new MockSupabase();
