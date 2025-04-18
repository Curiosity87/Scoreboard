const { createClient } = require('@supabase/supabase-js');

// Supabase configuration (same as in server/index.js)
const supabaseUrl = process.env.SUPABASE_URL || 'https://xaakqhceogyxvcccstav.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWtxaGNlb2d5eHZjY2NzdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzksImV4cCI6MjA2MDU0MDQ3OX0.ALvUeCFh6dN8V1YCoDHhsue8-Gx13Z8OMLblH2DQuNg';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupDatabase() {
  console.log('Setting up Supabase database...');
  
  try {
    // Create the game_history table
    const { error } = await supabase.rpc('create_game_history_table');
    
    if (error) {
      console.error('Error creating game_history table:', error);
      console.log('Attempting alternative setup method...');
      
      // If RPC fails, try direct SQL through Supabase REST API
      const { error: restError } = await supabase.from('_sql').select(`
        CREATE TABLE IF NOT EXISTS public.game_history (
          id SERIAL PRIMARY KEY,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          team1_name TEXT NOT NULL,
          team2_name TEXT NOT NULL,
          team1_score INTEGER NOT NULL,
          team2_score INTEGER NOT NULL, 
          result TEXT NOT NULL,
          finished_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
        );
      `);
      
      if (restError) {
        console.error('Failed to create table via REST API:', restError);
        console.log('\nIMPORTANT: You need to create the game_history table manually in Supabase.');
        console.log('Please go to the Supabase dashboard, open the SQL editor, and run this SQL:');
        console.log(`
CREATE TABLE IF NOT EXISTS public.game_history (
  id SERIAL PRIMARY KEY,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  team1_score INTEGER NOT NULL,
  team2_score INTEGER NOT NULL, 
  result TEXT NOT NULL,
  finished_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);
        `);
        process.exit(1);
      } else {
        console.log('Table created successfully via REST API');
      }
    } else {
      console.log('Table created successfully via RPC');
    }
    
    console.log('Database setup complete!');
  } catch (err) {
    console.error('Unexpected error during database setup:', err);
    process.exit(1);
  }
}

setupDatabase(); 