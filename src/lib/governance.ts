import { supabase } from './supabase';

const DAILY_LIMIT = 95;

interface UsageCounter {
  count: number;
  last_reset: string;
}

export async function fetchWithGovernance<T>(
  key: string,
  fetchFn: () => Promise<T>,
  mode: 'live' | 'idle' | 'news' = 'idle',
  customThresholdMs?: number
): Promise<{ data: T | null; isStale: boolean }> {
  try {
    // 0. Determine Threshold
    // live: 15 mins (during matches)
    // news: 3 hours (for fresh updates)
    // idle: 12 hours (default for stats)
    const threshold = customThresholdMs ?? (
      mode === 'live' ? 15 * 60 * 1000 : 
      mode === 'news' ? 3 * 60 * 60 * 1000 : 
      12 * 60 * 60 * 1000
    );

    // 1. Check Usage Limit
    const { data: usageData, error: usageError } = await supabase
      .from('api_cache')
      .select('data')
      .eq('key', 'daily_usage_counter')
      .single();

    if (usageError && usageError.code !== 'PGRST116') {
      console.error('Supabase Usage Check Error:', usageError);
    }

    let usage: UsageCounter = usageData?.data || { count: 0, last_reset: new Date().toISOString().split('T')[0] };
    const today = new Date().toISOString().split('T')[0];

    if (usage.last_reset !== today) {
      usage = { count: 0, last_reset: today };
    }

    const isHardStop = usage.count >= DAILY_LIMIT;

    // 2. Check Cache
    const { data: cached, error: cacheError } = await supabase
      .from('api_cache')
      .select('*')
      .eq('key', key)
      .single();

    if (cacheError && cacheError.code !== 'PGRST116') {
      console.error('Supabase Cache Fetch Error:', cacheError);
    }

    if (cached) {
      const lastUpdate = new Date(cached.updated_at).getTime();
      const now = new Date().getTime();

      if (isHardStop || (now - lastUpdate < threshold)) {
        return { data: cached.data, isStale: isHardStop };
      }
    }

    // 3. If Hard Stop and no cache, return null
    if (isHardStop) return { data: null, isStale: true };

    // 4. Fetch New Data
    const freshData = await fetchFn();

    // 5. Update Cache and Counter (Fire and forget or catch errors)
    try {
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
    } catch (dbError) {
      console.error('Supabase Upsert Error:', dbError);
    }

    return { data: freshData, isStale: false };
  } catch (globalError) {
    console.error('Governance Global Error:', globalError);
    // Attempt direct fetch if Supabase fails
    try {
      const directData = await fetchFn();
      return { data: directData, isStale: false };
    } catch (directError) {
      console.error('Direct Fetch Fallback Error:', directError);
      return { data: null, isStale: true };
    }
  }
}
