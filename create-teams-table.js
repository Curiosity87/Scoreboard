const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found in environment variables.");
  console.error("Please make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file.");
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key:', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTeamsTable() {
  console.log('Creating teams table in Supabase...');
  
  try {
    // First try to query the table to see if it exists
    console.log('Checking if teams table exists...');
    const { error: checkError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (checkError && checkError.code === '42P01') {
      console.log('Teams table does not exist. Creating it now...');
      
      // Create the teams table using raw SQL
      const { error: createError } = await supabase
        .from('_sql')
        .select(`
          CREATE TABLE IF NOT EXISTS public.teams (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            logo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
          );
          
          -- Insert initial teams
          INSERT INTO public.teams (name, display_name, logo_url) 
          VALUES 
          ('ASOKE ANTEATERS', 'Anteaters', '../assets/Anteaters_Official_Logo.png'),
          ('BKK BAEBLADEZ', 'Bladez', '../assets/Bladez_Official_Logo.png'),
          ('RATTANAKORN RAIDERS', 'Raiders', '../assets/Raiders_Official_Logo.png');
        `);
      
      if (createError) {
        console.error('Failed to create teams table:', createError);
        console.error('Error details:', JSON.stringify(createError));
      } else {
        console.log('Teams table created successfully with initial data');
        
        // Verify data was inserted
        const { data: verifyData, error: verifyError } = await supabase
          .from('teams')
          .select('*');
          
        if (verifyError) {
          console.error('Error verifying team data:', verifyError);
        } else {
          console.log('Verified team data:', verifyData);
        }
      }
    } else if (checkError) {
      console.error('Error checking teams table:', checkError);
      console.error('Error details:', JSON.stringify(checkError));
    } else {
      console.log('Teams table already exists');
      
      // Show existing teams
      const { data, error } = await supabase
        .from('teams')
        .select('*');
        
      if (error) {
        console.error('Error fetching teams:', error);
      } else {
        console.log('Existing teams:', data);
      }
    }
  } catch (err) {
    console.error('Unexpected error during teams table creation:', err);
  }
}

// Run the function
createTeamsTable()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  }); 