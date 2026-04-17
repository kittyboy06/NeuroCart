# NeuroCart
A real-time adaptive shopping assistant that personalizes the e-commerce experience purely through user behavior.

## Problem it Solves
E-commerce stores often rely on static product grids, annoying preference quizzes, or forced account creations to deliver personalized recommendations. These methods cause friction and slow down the user's path to purchase.

## Solution and How it Works
NeuroCart is a smart storefront that learns as you shop. It silently tracks how a user behaves on a product listing page — what they click, how long they hover, and what they add to the cart. Using this behavioral data, the application dynamically personalizes the entire shopping experience on-the-fly. The recommendations update automatically, the product grid reorders according to demonstrated interest, and exclusive deals unlock based on true engagement—all completely anonymously, without requiring any login or form fills.

## Features
- **Anonymous Session Tracking:** Generates and maintains a unique session ID locally without requiring user sign-up.
- **Behavioral Analytics:** Real-time tracking of cursor hovers, clicks, and additions to the cart.
- **Dynamic Engagement Scoring:** Computes points based on user engagement using an internal algorithm.
- **Live "For You" Recommendations:** Auto-updating sidebar that switches content based on the target category the user engages with the most.
- **Progressive Deal Unlocks:** Secret discounts (low, medium, hard tier) that present themselves as a popup when the shopper’s engagement score surpasses thresholds.
- **Retailer Dashboard:** A completely separate dashboard page for the retailer delivering aggregated metrics on total sessions, interaction statistics, and top clicked/hovered products using real-time charts. No relation or link exists between the consumer and retailer spaces.

## Tech Stack
- **Frontend Framework:** React + Vite
- **Database & Backend logic:** Supabase (PostgreSQL with Supabase JS client — absolutely no backend server logic is used)
- **Routing:** `react-router-dom`
- **Charts:** `recharts`
- **Styling:** Plain CSS / Inline Styles.

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   cd neurocart
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Configure Environment Variables:**
   - Create a `.env` file in the root of your project matching `.env.example`.
   - Add your Supabase URL and Anon Key using the `VITE_` prefix:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
4. **Setup Database Models:**
   - Go to your Supabase project SQL Editor and execute the SQL script provided below in the *Database Schema and Seed Data* section.
5. **Run the Application locally:**
   ```bash
   npm run dev
   ```

## How Behavior Tracking & Scoring Works
The tracking logic lives purely in a custom hook `useBehaviorTracker`, utilizing these rules to feed the dynamic score engine:

- **Clicks:** Clicking anywhere on the product card (apart from add to cart) = `+3.00` points.
- **Hovers:** A hover event starts when the cursor enters the product card. If the cursor is on the card for **more than 500ms**, it's recorded on exit. It grants `+ (duration_ms / 1000) * 0.5` points.
- **Cart Actions:** Clicking "Add to Cart" confirms explicit interest, delivering `+10.00` points.

Every 15-second tick, `useRecommendations` runs against the behavioral database. It identifies the top engaged category based on total hover time and click counts, fetches recommended products directly from that category, and verifies if the user's total engagement score has triggered one of the `deals` in the database. 

## Folder Structure
```text
neurocart/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductCard.jsx
│   │   ├── RecommendationPanel.jsx
│   │   └── DealPopup.jsx
│   ├── hooks/
│   │   ├── useBehaviorTracker.js
│   │   └── useRecommendations.js
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── pages/
│   │   ├── Store.jsx
│   │   └── Dashboard.jsx
│   ├── App.jsx
│   └── main.jsx
├── .env.example
├── README.md
└── package.json
```

## Database Schema and Seed Data
Execute the following SQL directly in your Supabase SQL Editor:

```sql
-- 1. products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('audio', 'phones', 'laptops', 'accessories', 'footwear')),
    price NUMERIC NOT NULL,
    image_url TEXT,
    description TEXT,
    created_at TIMESTAMP DEFAULT now()
);

-- 2. sessions
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now()
);

-- 3. behavior_events
CREATE TABLE behavior_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL,
    product_id UUID REFERENCES products(id),
    event_type TEXT NOT NULL CHECK (event_type IN ('click', 'hover', 'cart_add')),
    duration_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT now()
);

-- 4. deals
CREATE TABLE deals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    discount_percent INTEGER NOT NULL,
    trigger_score INTEGER NOT NULL,
    active BOOLEAN DEFAULT true
);

-- Seed Data insertion logic

-- 12 Products Seed
INSERT INTO products (id, name, category, price, description, image_url) VALUES 
(gen_random_uuid(), 'Sonic Boom Pro Headphones', 'audio', 12999, 'Over-ear noise cancelling headphones.', 'https://picsum.photos/seed/sonicboom/300/200'),
(gen_random_uuid(), 'Aura Earbuds X', 'audio', 6999, 'True wireless earbuds with heavy bass.', 'https://picsum.photos/seed/auraearbuds/300/200'),
(gen_random_uuid(), 'Vibe Portable Speaker', 'audio', 3999, 'Waterproof bluetooth speaker.', 'https://picsum.photos/seed/vibespeaker/300/200'),
(gen_random_uuid(), 'Titan ZXR 14', 'phones', 85000, 'Latest flagship smartphone.', 'https://picsum.photos/seed/titanzxr/300/200'),
(gen_random_uuid(), 'Atlas Pro Max', 'phones', 115000, 'Premium camera powerhouse.', 'https://picsum.photos/seed/atlaspro/300/200'),
(gen_random_uuid(), 'Nova S Lite', 'phones', 25000, 'Best in class budget phone.', 'https://picsum.photos/seed/novalite/300/200'),
(gen_random_uuid(), 'ZenBook Ultra 15', 'laptops', 145000, 'Thin and light workstation.', 'https://picsum.photos/seed/zenbook/300/200'),
(gen_random_uuid(), 'CodeMaster Pro 14', 'laptops', 120000, 'Developer focused portable laptop.', 'https://picsum.photos/seed/codemaster/300/200'),
(gen_random_uuid(), 'KeyChron K8 Pro', 'accessories', 8500, 'Mechanical wireless keyboard.', 'https://picsum.photos/seed/keychron/300/200'),
(gen_random_uuid(), 'MX Master 3S', 'accessories', 9999, 'Ergonomic productivity mouse.', 'https://picsum.photos/seed/mxmaster/300/200'),
(gen_random_uuid(), 'AirMax 270', 'footwear', 12999, 'Comfortable lifestyle sneakers.', 'https://picsum.photos/seed/airmax/300/200'),
(gen_random_uuid(), 'UltraBoost 23', 'footwear', 15999, 'Premium running shoes.', 'https://picsum.photos/seed/ultraboost/300/200');

-- 3 Deals Seed (Using product relationships dynamically)
INSERT INTO deals (product_id, discount_percent, trigger_score, active) 
SELECT id, 10, 20, true FROM products WHERE name = 'Vibe Portable Speaker' LIMIT 1;

INSERT INTO deals (product_id, discount_percent, trigger_score, active) 
SELECT id, 15, 35, true FROM products WHERE name = 'MX Master 3S' LIMIT 1;

INSERT INTO deals (product_id, discount_percent, trigger_score, active) 
SELECT id, 25, 50, true FROM products WHERE name = 'Atlas Pro Max' LIMIT 1;
```
