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

// Try direct insert method - this should work even if the table doesn't exist yet
async function createTeamsTableDirect() {
  console.log('\nAttempting direct creation of teams table...');
  
  try {
    // First check if the teams table exists by trying to select from it
    console.log('Checking if teams table exists...');
    const { data: checkData, error: checkError } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (checkError) {
      if (checkError.code === '42P01') {  // Table doesn't exist error
        console.log('Teams table does not exist. Need to create it first.');
        console.log(`
To create the teams table, please follow these steps:

1. Go to the Supabase dashboard at https://app.supabase.com
2. Select your project
3. Go to the SQL Editor (in the left sidebar)
4. Create a new query
5. Paste the following SQL and run it:

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
        
        return { success: false, error: checkError };
      } else {
        console.error('Error checking teams table:', checkError);
        return { success: false, error: checkError };
      }
    } else {
      console.log('Teams table already exists with data:', checkData);
      
      // If we're here, the table exists. Let's test inserting a team
      return await testInsertTeam();
    }
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
}

async function testInsertTeam() {
  console.log('\nTesting team insertion...');
  
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: 'TEST TEAM',
        display_name: 'Test',
        logo_url: null
      })
      .select();
    
    if (error) {
      console.error('Error inserting team:', error);
      return { success: false, error };
    } else {
      console.log('Successfully inserted team:', data);
      
      // Successful insertion! Now delete the test team
      if (data && data[0] && data[0].id) {
        const { error: deleteError } = await supabase
          .from('teams')
          .delete()
          .eq('id', data[0].id);
        
        if (deleteError) {
          console.error('Error deleting test team:', deleteError);
        } else {
          console.log('Test team deleted successfully');
        }
      }
      
      return { success: true, data };
    }
  } catch (err) {
    console.error('Unexpected error during team insertion:', err);
    return { success: false, error: err };
  }
}

// Run the function
createTeamsTableDirect()
  .then(result => {
    if (result.success) {
      console.log('\nSuccess! Your teams table is working correctly.');
      console.log('You can now use the team management feature in the application.');
    } else {
      console.log('\nFailed to create or use the teams table.');
      console.log('Please follow the SQL instructions above to create the table manually in the Supabase dashboard.');
    }
    console.log('\nDone!');
  })
  .catch(err => {
    console.error('Script failed:', err);
  })
  .finally(() => {
    process.exit(0);
  }); 