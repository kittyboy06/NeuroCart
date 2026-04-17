Build a full-stack e-commerce personalization web app called NeuroCart using React + Vite for the frontend and Supabase as the database. Do not use any backend server — all logic runs on the frontend using the Supabase JS client directly.

What the app does
NeuroCart is a real-time adaptive shopping assistant. It silently tracks how a user behaves on a product listing page — what they click, how long they hover, what they add to cart — and uses that behavioral data to dynamically personalize their entire shopping experience. The recommendations update automatically, the product grid reorders based on interest, and exclusive deals unlock the more the user engages — all without any login, form, or preference quiz.
The core idea: the app learns you as you shop.

Tech Stack

React + Vite — frontend framework and build tool
Supabase — PostgreSQL database with JS client, no backend server needed
react-router-dom — for page routing
recharts — for dashboard charts
Plain CSS / inline styles — no heavy UI libraries like MUI or Tailwind
All Supabase credentials must come from a .env file using the VITE_ prefix


Supabase Database Schema
Create the following 4 tables in Supabase SQL editor:
1. products

id — uuid, primary key, default gen_random_uuid()
name — text, not null
category — text, not null (values: audio, phones, laptops, accessories, footwear)
price — numeric, not null (in Indian Rupees)
image_url — text (use https://picsum.photos/seed/{productname}/300/200)
description — text
created_at — timestamp, default now()

2. sessions

id — uuid, primary key
session_id — text, unique, not null
created_at — timestamp, default now()

3. behavior_events

id — uuid, primary key
session_id — text, not null
product_id — uuid, foreign key referencing products(id)
event_type — text, not null — only allowed values: click, hover, cart_add
duration_ms — integer, default 0 (only used for hover events)
created_at — timestamp, default now()

4. deals

id — uuid, primary key
product_id — uuid, foreign key referencing products(id)
discount_percent — integer, not null
trigger_score — integer, not null (engagement score needed to unlock this deal)
active — boolean, default true


Seed Data
Seed the products table with exactly 12 products spread across these categories:

3 audio products (headphones, earbuds, speakers)
3 phone products (iPhone, Android flagships)
2 laptop products (MacBook, Windows)
2 accessory products (keyboard, mouse)
2 footwear products (Nike, Adidas)

All prices in Indian Rupees. Use realistic product names and prices.
Seed the deals table with 3 deals:

One deal with trigger_score 20 (easy to unlock)
One deal with trigger_score 35 (medium)
One deal with trigger_score 50 (hard, power user)


Session Management
When the app loads for the first time:

Check localStorage for an existing neurocart_session_id
If not found, generate a new UUID using crypto.randomUUID()
Save it to localStorage
Insert a row into the Supabase sessions table with this session_id
If already found in localStorage, just use it directly without inserting again
Pass this session_id down to all components that need it


Behavior Tracking Logic
Create a custom hook called useBehaviorTracker(sessionId) that exposes these functions:
trackClick(productId)

Called when a user clicks anywhere on a product card
Inserts a behavior_event with event_type = 'click', duration_ms = 0

trackHoverStart(productId)

Called when mouse enters a product card
Records the current timestamp in a useRef object keyed by productId

trackHoverEnd(productId)

Called when mouse leaves a product card
Calculates duration = Date.now() minus the stored start time
If duration is less than 500ms, ignore it (accidental hover)
If duration is 500ms or more, insert a behavior_event with event_type = 'hover' and the duration_ms value
Clears the stored start time for that productId

trackCartAdd(productId)

Called when user clicks "Add to Cart"
Inserts a behavior_event with event_type = 'cart_add', duration_ms = 0


Engagement Score Calculation
Create a function computeEngagementScore(events) that takes an array of behavior_events and returns a numeric score using this formula:

Each click event = +3 points
Each hover event = +(duration_ms / 1000) × 0.5 points
Each cart_add event = +10 points

Round the final score to 2 decimal places.

Recommendation Logic
Create a custom hook called useRecommendations(sessionId) that:

Runs on an interval every 15 seconds
Fetches all behavior_events from Supabase for the current session_id
Computes the engagement score and stores it in state
Finds which product category the user has spent the most total time on (sum of duration_ms for hover events + clicks × 1000 as weight)
Queries Supabase products table for all products in that top category
Returns the top 4 products from that category as recommendations
If no behavior data exists yet, returns 4 random products from any category
Also checks all active deals — if the engagement score has crossed any deal's trigger_score, return that deal as unlockedDeal
Only unlock one deal per session (track this with a useRef so it doesn't trigger again)

Returns: { recommendations, engagementScore, unlockedDeal }

Page 1 — Store Page (/)
This is the main shopping page. Build it with these sections:
Navbar:

Left: App name "NeuroCart" in bold
Right: Cart icon showing number of items currently in cart

Main layout: Two-column flex layout

Left column (75% width): product grid
Right column (25% width): "For You" recommendation sidebar

Product Grid:

Fetch all 12 products from Supabase on page load
Display in a 3-column CSS grid
Each product card shows: product image, category badge (colored pill), product name, description (1 line truncated), price formatted in ₹ with commas, "Add to Cart" button
On mouse enter → call trackHoverStart(product.id)
On mouse leave → call trackHoverEnd(product.id)
On card click (not the button) → call trackClick(product.id)
On "Add to Cart" button click → call trackCartAdd(product.id), add product to local cart state, show brief "Added!" feedback on the button for 1 second

"For You" Sidebar:

Title: "For You" with a small subtitle "Updates as you browse"
Shows 4 recommendation cards (smaller than main grid cards)
Each card: image, name, price
Updates every 15 seconds with new recommendations from useRecommendations hook
Shows a small pulsing dot indicator when recommendations are updating
If no data yet, shows "Browse products to get recommendations"

Deal Unlock Popup:

Fixed position at bottom-right corner of screen
Appears when unlockedDeal is returned from useRecommendations
Shows: "You've been exploring! Here's a deal just for you:" + product name + discount percentage + a "Claim Deal" button
Has an X button to dismiss
Animates in with a slide-up effect
Only shows once per session


Page 2 — Retailer Dashboard (/dashboard)
This page gives the retailer a view of how users are engaging with the store.
Metric Cards Row (4 cards):

Total sessions (count from sessions table)
Total behavior events (count from behavior_events table)
Total cart adds (count where event_type = 'cart_add')
Most popular category (category with most total events)

Chart 1 — Top Clicked Products:

Fetch all click events, group by product_id, count clicks per product
Join with product names
Show top 5 as a vertical bar chart using recharts
X axis: product names, Y axis: click count

Chart 2 — Top Hovered Products:

Fetch all hover events, group by product_id, sum duration_ms per product
Join with product names
Show top 5 as a vertical bar chart using recharts
X axis: product names, Y axis: total hover seconds

Deals Table:

Fetch all deals joined with product names
Show as a table: Product Name | Discount | Trigger Score | Status (Active/Inactive)


File Structure to Generate
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

README.md to Generate
Include:

Project name and one-line description
Problem it solves
Solution and how it works
Features list
Tech stack
Setup instructions: clone → npm install → create .env → paste Supabase URL and key → run SQL → npm run dev
Full SQL for all 4 tables and seed data
How the behavior tracking and scoring works
Folder structure


Important Rules

No backend server of any kind — Supabase JS client only
Keep total repo size under 1MB — no large assets or unnecessary files
Single git branch (main) only
No heavy UI libraries — plain CSS or inline styles only
All environment variables must use the VITE_ prefix
.env must be in .gitignore — provide .env.example instead
Generate all files completely — do not leave placeholder comments like "add your logic here"
The app must work end to end when the user follows the idea setup steps