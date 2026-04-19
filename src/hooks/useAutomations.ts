import { useEffect, useState } from 'react';
import { getAutomations } from '../api/workflowApi';
import type { AutomationAction } from '../types/api';

export function useAutomations() {
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAutomations()
      .then(setAutomations)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { automations, loading, error };
}
