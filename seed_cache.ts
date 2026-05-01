import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function seed() {
  const menData = {
    "rank": 17,
    "team": {
      "id": 47,
      "name": "Tottenham",
      "logo": "https://media.api-sports.io/football/teams/47.png"
    },
    "points": 38,
    "goalsDiff": -1,
    "group": "Premier League",
    "form": "LLLDL",
    "status": "same",
    "description": "Champions League",
    "all": { "played": 38, "win": 11, "draw": 5, "lose": 22, "goals": { "for": 64, "against": 65 } }
  };

  const womenData = {
    "rank": 11,
    "team": {
      "id": 4899,
      "name": "Tottenham Hotspur W",
      "logo": "https://media.api-sports.io/football/teams/4899.png"
    },
    "points": 12,
    "goalsDiff": -25,
    "group": "Super League, Women",
    "form": "LLLLL",
    "status": "same",
    "description": null,
    "all": { "played": 22, "win": 3, "draw": 3, "lose": 16, "goals": { "for": 22, "against": 47 } }
  };

  const today = new Date().toISOString().split('T')[0];

  console.log('Seeding Supabase cache...');

  await supabase.from('api_cache').upsert([
    { key: 'men_standing_v9', data: menData, updated_at: new Date().toISOString() },
    { key: 'women_standing_v9', data: womenData, updated_at: new Date().toISOString() },
    { key: 'daily_usage_counter', data: { count: 95, last_reset: today }, updated_at: new Date().toISOString() }
  ]);

  console.log('Done.');
}

seed();
