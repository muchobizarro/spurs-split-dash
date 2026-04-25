import { supabase } from './supabase';

const DAILY_LIMIT = 95;

interface CacheEntry {
  key: string;
  data: any;
  updated_at: string;
}

interface UsageCounter {
  count: number;
  last_reset: string;
}

export async function fetchWithGovernance(
  key: string,
  fetchFn: () => Promise<any>,
  mode: 'live' | 'idle' = 'idle'
) {
  const threshold = mode === 'live' ? 15 * 60 * 1000 : 12 * 60 * 60 * 1000;

  // 1. Check Usage Limit
  const { data: usageData } = await supabase
    .from('api_cache')
    .select('data')
    .eq('key', 'daily_usage_counter')
    .single();

  let usage: UsageCounter = usageData?.data || { count: 0, last_reset: new Date().toISOString().split('T')[0] };
  const today = new Date().toISOString().split('T')[0];

  if (usage.last_reset !== today) {
    usage = { count: 0, last_reset: today };
  }

  const isHardStop = usage.count >= DAILY_LIMIT;

  // 2. Check Cache
  const { data: cached } = await supabase
    .from('api_cache')
    .select('*')
    .eq('key', key)
    .single();

  if (cached) {
    const lastUpdate = new Date(cached.updated_at).getTime();
    const now = new Date().getTime();

    if (isHardStop || (now - lastUpdate < threshold)) {
      return { data: cached.data, isStale: isHardStop };
    }
  }

  // 3. If Hard Stop and no cache, return null (should not happen if cache is populated)
  if (isHardStop) return { data: null, isStale: true };

  // 4. Fetch New Data
  const freshData = await fetchFn();

  // 5. Update Cache and Counter
  await supabase.from('api_cache').upsert({
    key: key,
    data: freshData,
    updated_at: new Date().toISOString()
  });

  await supabase.from('api_cache').upsert({
    key: 'daily_usage_counter',
    data: { count: usage.count + 1, last_reset: today },
    updated_at: new Date().toISOString()
  });

  return { data: freshData, isStale: false };
}
