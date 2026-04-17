import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';

export function useSession() {
  const { user } = useAuth();
  const [sessionId, setSessionId] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSessionLoading(false);
      return;
    }

    const initSession = async () => {
      const storageKey = `neurocart_session_${user.id}`;
      let sid = localStorage.getItem(storageKey);

      if (!sid) {
        sid = crypto.randomUUID();
        localStorage.setItem(storageKey, sid);
        await supabase.from('sessions').insert({
          session_id: sid,
          user_id: user.id,
        });
      } else {
        // Verify session exists in DB
        const { data } = await supabase
          .from('sessions')
          .select('session_id')
          .eq('session_id', sid)
          .single();

        if (!data) {
          // Re-insert if missing
          await supabase.from('sessions').insert({
            session_id: sid,
            user_id: user.id,
          });
        }
      }
      setSessionId(sid);
      setSessionLoading(false);
    };

    initSession();
  }, [user]);

  return { sessionId, sessionLoading };
}
