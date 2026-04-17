import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

function computeEngagementScore(events) {
  let score = 0;
  for (const event of events) {
    if (event.event_type === 'click') score += 3;
    else if (event.event_type === 'hover') score += (event.duration_ms / 1000) * 0.5;
    else if (event.event_type === 'cart_add') score += 10;
  }
  return Math.round(score * 100) / 100;
}

function findTopCategory(events, products) {
  const categoryScores = {};
  const productMap = {};
  products.forEach((p) => { productMap[p.id] = p; });

  for (const event of events) {
    const product = productMap[event.product_id];
    if (!product) continue;
    const cat = product.category;
    if (!categoryScores[cat]) categoryScores[cat] = 0;

    if (event.event_type === 'hover') {
      categoryScores[cat] += event.duration_ms;
    } else if (event.event_type === 'click') {
      categoryScores[cat] += 1000; // weight clicks
    } else if (event.event_type === 'cart_add') {
      categoryScores[cat] += 3000; // weight cart adds
    }
  }

  let topCategory = null;
  let topScore = 0;
  for (const [cat, score] of Object.entries(categoryScores)) {
    if (score > topScore) {
      topScore = score;
      topCategory = cat;
    }
  }
  return topCategory;
}

export function useRecommendations(sessionId) {
  const [recommendations, setRecommendations] = useState([]);
  const [engagementScore, setEngagementScore] = useState(0);
  const [unlockedDeal, setUnlockedDeal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const dealUnlockedRef = useRef(false);
  const allProductsRef = useRef([]);

  const fetchRecommendations = useCallback(async () => {
    if (!sessionId) return;
    setIsUpdating(true);

    try {
      // Fetch all products (cache in ref)
      if (allProductsRef.current.length === 0) {
        const { data: products } = await supabase
          .from('products')
          .select('*');
        allProductsRef.current = products || [];
      }
      const products = allProductsRef.current;

      // Fetch behavior events for this session
      const { data: events } = await supabase
        .from('behavior_events')
        .select('*')
        .eq('session_id', sessionId);

      if (!events || events.length === 0) {
        // Return 4 random products if no data yet
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 4));
        setEngagementScore(0);
        setIsUpdating(false);
        return;
      }

      // Compute engagement score
      const score = computeEngagementScore(events);
      setEngagementScore(score);

      // Find top category
      const topCategory = findTopCategory(events, products);

      if (topCategory) {
        const catProducts = products.filter((p) => p.category === topCategory);
        setRecommendations(catProducts.slice(0, 4));
      } else {
        const shuffled = [...products].sort(() => 0.5 - Math.random());
        setRecommendations(shuffled.slice(0, 4));
      }

      // Check for deal unlocks (only once per session)
      if (!dealUnlockedRef.current) {
        const { data: deals } = await supabase
          .from('deals')
          .select('*, products(name, price, image_url)')
          .eq('active', true)
          .order('trigger_score', { ascending: false });

        if (deals) {
          // Find the highest-tier deal the user qualifies for
          for (const deal of deals) {
            if (score >= deal.trigger_score) {
              setUnlockedDeal(deal);
              dealUnlockedRef.current = true;
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error('Recommendation fetch error:', err);
    } finally {
      setIsUpdating(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchRecommendations();
    const interval = setInterval(fetchRecommendations, 15000);
    return () => clearInterval(interval);
  }, [fetchRecommendations]);

  return { recommendations, engagementScore, unlockedDeal, isUpdating };
}
