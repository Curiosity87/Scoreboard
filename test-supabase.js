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

async function testSupabase() {
  console.log('Testing Supabase connection...');
  
  try {
    // Try creating a simple test table
    const testTableName = `test_table_${Math.floor(Math.random() * 1000)}`;
    console.log(`Creating test table: ${testTableName}`);
    
    const { error: createError } = await supabase.rpc('execute_sql', {
      sql_string: `
        CREATE TABLE public.${testTableName} (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
        );
      `
    });
    
    if (createError) {
      console.error('Error creating test table:', createError);
      console.error('Error details:', JSON.stringify(createError));
      
      // Check if RPC method doesn't exist
      if (createError.message.includes('function') && createError.message.includes('does not exist')) {
        console.log('\nTrying alternative method...');
        // Just test inserting into an existing table
        await testExistingTables();
      }
    } else {
      console.log(`Test table ${testTableName} created successfully!`);
      
      // Clean up - drop the test table
      const { error: dropError } = await supabase.rpc('execute_sql', {
        sql_string: `DROP TABLE public.${testTableName};`
      });
      
      if (dropError) {
        console.error(`Error dropping test table ${testTableName}:`, dropError);
      } else {
        console.log(`Test table ${testTableName} dropped successfully`);
      }
    }
  } catch (err) {
    console.error('Unexpected error during Supabase test:', err);
  }
}

async function testExistingTables() {
  // Try to get all tables
  console.log('Checking available tables...');
  
  try {
    const { data, error } = await supabase
      .from('pg_tables')
      .select('schemaname, tablename')
      .eq('schemaname', 'public');
    
    if (error) {
      console.error('Error getting tables:', error);
    } else {
      console.log('Available tables:', data);
      
      // Check if game_history exists
      const gameHistoryTable = data.find(t => t.tablename === 'game_history');
      if (gameHistoryTable) {
        console.log('Found game_history table, testing insertion...');
        await testInsert('game_history');
      } else {
        console.log('game_history table not found');
      }
      
      // Check if teams exists
      const teamsTable = data.find(t => t.tablename === 'teams');
      if (teamsTable) {
        console.log('Found teams table, testing insertion...');
        await testInsert('teams');
      } else {
        console.log('teams table not found');
      }
    }
  } catch (err) {
    console.error('Error checking tables:', err);
  }
}

async function testInsert(tableName) {
  try {
    if (tableName === 'teams') {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: 'TEST TEAM',
          display_name: 'Test',
          logo_url: null
        })
        .select();
      
      if (error) {
        console.error(`Error inserting into ${tableName}:`, error);
      } else {
        console.log(`Successfully inserted into ${tableName}:`, data);
        
        // Clean up
        if (data && data[0] && data[0].id) {
          const { error: deleteError } = await supabase
            .from('teams')
            .delete()
            .eq('id', data[0].id);
          
          if (deleteError) {
            console.error(`Error deleting from ${tableName}:`, deleteError);
          } else {
            console.log(`Successfully deleted from ${tableName}`);
          }
        }
      }
    } else if (tableName === 'game_history') {
      const { data, error } = await supabase
        .from('game_history')
        .insert({
          date: '2024-04-20',
          time: '10:00',
          team1_name: 'TEST TEAM 1',
          team2_name: 'TEST TEAM 2',
          team1_score: 0,
          team2_score: 0,
          result: 'TEST RESULT'
        })
        .select();
      
      if (error) {
        console.error(`Error inserting into ${tableName}:`, error);
      } else {
        console.log(`Successfully inserted into ${tableName}:`, data);
        
        // Clean up
        if (data && data[0] && data[0].id) {
          const { error: deleteError } = await supabase
            .from('game_history')
            .delete()
            .eq('id', data[0].id);
          
          if (deleteError) {
            console.error(`Error deleting from ${tableName}:`, deleteError);
          } else {
            console.log(`Successfully deleted from ${tableName}`);
          }
        }
      }
    }
  } catch (err) {
    console.error(`Error testing insertion into ${tableName}:`, err);
  }
}

// Run the tests
testSupabase()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch(err => {
    console.error('Script failed:', err);
    process.exit(1);
  }); 