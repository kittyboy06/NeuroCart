import { useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useBehaviorTracker(sessionId) {
  const hoverStartTimes = useRef({});

  const trackClick = useCallback(async (productId) => {
    if (!sessionId) return;
    await supabase.from('behavior_events').insert({
      session_id: sessionId,
      product_id: productId,
      event_type: 'click',
      duration_ms: 0,
    });
  }, [sessionId]);

  const trackHoverStart = useCallback((productId) => {
    hoverStartTimes.current[productId] = Date.now();
  }, []);

  const trackHoverEnd = useCallback(async (productId) => {
    if (!sessionId) return;
    const startTime = hoverStartTimes.current[productId];
    if (!startTime) return;

    const duration = Date.now() - startTime;
    delete hoverStartTimes.current[productId];

    // Ignore accidental hovers less than 500ms
    if (duration < 500) return;

    await supabase.from('behavior_events').insert({
      session_id: sessionId,
      product_id: productId,
      event_type: 'hover',
      duration_ms: duration,
    });
  }, [sessionId]);

  const trackCartAdd = useCallback(async (productId) => {
    if (!sessionId) return;
    await supabase.from('behavior_events').insert({
      session_id: sessionId,
      product_id: productId,
      event_type: 'cart_add',
      duration_ms: 0,
    });
  }, [sessionId]);

  return { trackClick, trackHoverStart, trackHoverEnd, trackCartAdd };
}
