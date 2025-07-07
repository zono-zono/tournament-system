const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    envVars[key.trim()] = value.trim();
  }
});

const supabase = createClient(
  envVars.NEXT_PUBLIC_SUPABASE_URL,
  envVars.SUPABASE_SERVICE_ROLE_KEY
);

async function checkSchema() {
  try {
    // Try to select from matches table to see what columns exist
    const { data: testData, error: testError } = await supabase
      .from('matches')
      .select('*')
      .limit(0);
    
    if (testError) {
      console.log('Error accessing matches table:', testError);
    } else {
      console.log('Matches table accessible');
    }

    // Try to insert a test match to see what columns are required/missing
    console.log('\nTrying to insert test data to see schema...');
    const { data, error } = await supabase
      .from('matches')
      .insert({
        tournament_id: '00000000-0000-0000-0000-000000000000',
        round_number: 1,
        match_number_in_round: 1,
        player1_id: null,
        player2_id: null,
        winner_id: null,
        status: 'scheduled',
        next_match_id: null,
        scheduled_time: null,
        scheduled_date: null,
        venue: null
      })
      .select();

    if (error) {
      console.log('Insert error (this will show missing columns):', error);
    } else {
      console.log('Insert successful:', data);
      // Clean up
      await supabase.from('matches').delete().eq('id', data[0].id);
    }

  } catch (err) {
    console.error('Error:', err);
  }
}

checkSchema();