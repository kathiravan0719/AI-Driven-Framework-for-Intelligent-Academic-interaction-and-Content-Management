import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Events page — redirects to the unified Content Hub (events tab).
 * The full events experience lives at /content?tab=events
 */
export default function Events() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/content?tab=events', { replace: true });
  }, [navigate]);
  return null;
}
