const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Error: Supabase credentials not found in environment variables.");
  console.error("Please make sure SUPABASE_URL and SUPABASE_KEY are set in your .env file.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Enable CORS for all routes
app.use(cors());
app.use(express.json());

// Serve static files
app.use('/overlay', express.static(path.join(__dirname, '../overlay')));
app.use('/controller', express.static(path.join(__dirname, '../controller')));
app.use('/assets', express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '..'))); // Serve root directory

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../controller/index.html'));
});

app.get('/overlay', (req, res) => {
  res.sendFile(path.join(__dirname, '../overlay/index.html'));
});

app.get('/debug', (req, res) => {
  res.sendFile(path.join(__dirname, '../debug-team-form.html'));
});

// Initialize game state
let gameState = {
  timer: {
    time: 900, // 15 minutes in seconds for the game clock
    isRunning: false,
    intervalId: null
  },
  teams: {
    team1: {
      name: "ASOKE ANTEATERS",
      score: 0,
      logo: "../assets/Anteaters_Official_Logo.png",
      penalty: {
        active: false,
        time: 0,
        visible: true
      }
    },
    team2: {
      name: "BKK BAEBLADEZ",
      score: 0,
      logo: "../assets/Bladez_Official_Logo.png",
      penalty: {
        active: false,
        time: 0,
        visible: true
      }
    }
  },
  period: 1,
  gameInfo: {
    date: '',
    time: '',
    finished: false,
    result: ''
  },
  config: {
    periodMinutes: 15,
    totalPeriods: 3,
    shootoutMinutes: 5
  },
  goalHorn: {
    enabled: true,
    volume: 80,
    team1Enabled: true,
    team2Enabled: true
  }
};

// Helper function to initialize game info with current date and time
function initializeGameInfo() {
  const now = new Date();
  const dateString = now.toISOString().slice(0, 10);
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  gameState.gameInfo = {
    date: dateString,
    time: timeString,
    finished: false,
    result: ''
  };
}

// Initialize game info when server starts
initializeGameInfo();

// Helper function to create a safe copy of an object (removes circular references)
function createSafeCopy(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // For Date objects, return a new Date
  if (obj instanceof Date) {
    return new Date(obj.getTime());
  }

  // For arrays, map each item to a safe copy
  if (Array.isArray(obj)) {
    return obj.map(item => createSafeCopy(item));
  }

  // For objects, create a new object with safe copies of each property
  const safeCopy = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key) && key !== 'intervalId') {
      safeCopy[key] = createSafeCopy(obj[key]);
    }
  }
  return safeCopy;
}

// Helper function to save game results to Supabase
async function saveGameToSupabase(gameData) {
  try {
    // Check if the table exists first
    const { error: checkError } = await supabase
      .from('game_history')
      .select('id')
      .limit(1);
    
    // If table doesn't exist, create it
    if (checkError && checkError.code === '42P01') {
      console.log('Table game_history does not exist, creating it first...');
      
      const { error: createError } = await supabase
        .from('_sql')
        .select(`
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
      
      if (createError) {
        console.error('Error creating game_history table:', createError);
        return false;
      }
    } else if (checkError) {
      console.error('Error checking game_history table:', checkError);
      return false;
    }
    
    // Now try to insert the data
    const { data, error } = await supabase
      .from('game_history')
      .insert([gameData]);
    
    if (error) {
      console.error('Error saving game to Supabase:', error);
      return false;
    }
    
    console.log('Game saved to Supabase successfully');
    return true;
  } catch (err) {
    console.error('Exception when saving game to Supabase:', err);
    return false;
  }
}

// Helper function to fetch game history from Supabase
async function fetchGameHistory() {
  try {
    const { data, error } = await supabase
      .from('game_history')
      .select('*')
      .order('finished_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('Error fetching game history from Supabase:', error);
      return { success: false, error };
    }
    
    return { success: true, data };
  } catch (err) {
    console.error('Exception when fetching game history from Supabase:', err);
    return { success: false, error: err.message };
  }
}

// Function to initialize teams table
async function initializeTeamsTable() {
  try {
    // Check if teams table exists
    const { error } = await supabase
      .from('teams')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Teams table does not exist. Creating it now...');
      
      // Create the teams table
      const { error: createError } = await supabase
        .from('_sql')
        .select(`
          CREATE TABLE IF NOT EXISTS public.teams (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            display_name TEXT NOT NULL,
            abbreviation TEXT,
            logo_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
          );
          
          -- Insert initial teams
          INSERT INTO public.teams (name, display_name, abbreviation, logo_url) 
          VALUES 
          ('ASOKE ANTEATERS', 'Anteaters', 'ANT', '../assets/Anteaters_Official_Logo.png'),
          ('BKK BAEBLADEZ', 'Bladez', 'BLZ', '../assets/Bladez_Official_Logo.png'),
          ('RATTANAKORN RAIDERS', 'Raiders', 'RAI', '../assets/Raiders_Official_Logo.png');
        `);
      
      if (createError) {
        console.error('Failed to create teams table:', createError);
      } else {
        console.log('Teams table created successfully with initial data');
      }
    } else if (error) {
      console.error('Error checking teams table:', error);
    } else {
      console.log('Connected to Supabase - teams table exists');
    }
  } catch (err) {
    console.error('Unexpected error during teams table initialization:', err);
  }
}

// Function to fetch all teams
async function fetchTeams() {
  try {
    console.log('Attempting to fetch teams from Supabase...');
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching teams from Supabase:', error);
      console.error('Error details:', JSON.stringify(error));
      return { success: false, error };
    }
    
    console.log(`Successfully fetched ${data ? data.length : 0} teams from Supabase`);
    return { success: true, data };
  } catch (err) {
    console.error('Exception when fetching teams from Supabase:', err);
    return { success: false, error: err.message };
  }
}

// Function to add a new team
async function addTeam(teamData) {
  try {
    console.log('Attempting to add team to Supabase:', teamData);
    const { data, error } = await supabase
      .from('teams')
      .insert([teamData])
      .select();
    
    if (error) {
      console.error('Error adding team to Supabase:', error);
      console.error('Error details:', JSON.stringify(error));
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      return { success: false, error };
    }
    
    console.log('Successfully added team to Supabase:', data[0]);
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Exception when adding team to Supabase:', err);
    return { success: false, error: err.message };
  }
}

// Function to update a team
async function updateTeam(id, teamData) {
  try {
    const { data, error } = await supabase
      .from('teams')
      .update(teamData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating team in Supabase:', error);
      return { success: false, error };
    }
    
    return { success: true, data: data[0] };
  } catch (err) {
    console.error('Exception when updating team in Supabase:', err);
    return { success: false, error: err.message };
  }
}

// Function to delete a team
async function deleteTeam(id) {
  try {
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting team from Supabase:', error);
      return { success: false, error };
    }
    
    return { success: true };
  } catch (err) {
    console.error('Exception when deleting team from Supabase:', err);
    return { success: false, error: err.message };
  }
}

// Timer functions
function startTimer() {
  if (gameState.timer.isRunning) return;
  
  gameState.timer.isRunning = true;
  clearInterval(gameState.timer.intervalId);
  
  gameState.timer.intervalId = setInterval(() => {
    if (gameState.timer.time > 0) {
      gameState.timer.time--;
      io.emit('timeUpdate', gameState.timer.time);
      
      // Handle penalty timers if active
      ['team1', 'team2'].forEach(team => {
        if (gameState.teams[team].penalty.active && gameState.teams[team].penalty.time > 0) {
          gameState.teams[team].penalty.time--;
          io.emit('penaltyUpdate', { team, time: gameState.teams[team].penalty.time });
          
          // Clear penalty when it reaches zero
          if (gameState.teams[team].penalty.time === 0) {
            gameState.teams[team].penalty.active = false;
            io.emit('penaltyUpdate', { team, time: 0, active: false });
          }
        }
      });
    } else {
      stopTimer();
    }
  }, 1000);
  
  io.emit('timerStarted');
}

function stopTimer() {
  if (gameState.timer.isRunning) {
    clearInterval(gameState.timer.intervalId);
    gameState.timer.isRunning = false;
    gameState.timer.intervalId = null;
  }
}

// Initialize Supabase by ensuring the game_history table exists
async function initializeSupabase() {
  try {
    // Check if table exists by attempting to select from it
    const { error } = await supabase
      .from('game_history')
      .select('id')
      .limit(1);
    
    if (error && error.code === '42P01') {
      console.log('Game history table does not exist. Creating it now...');
      
      // Create the game_history table
      const { error: createError } = await supabase
        .from('_sql')
        .select(`
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
      
      if (createError) {
        console.error('Failed to create game_history table:', createError);
        console.log('\nIMPORTANT: You need to create the game_history table manually in Supabase.');
        console.log('Please go to the Supabase dashboard, open the SQL editor, and run the SQL shown in setupDb.js');
      } else {
        console.log('Game history table created successfully');
      }
    } else if (error) {
      console.error('Error checking game_history table:', error);
    } else {
      console.log('Connected to Supabase - game_history table exists');
    }
  } catch (err) {
    console.error('Unexpected error during Supabase initialization:', err);
  }
}

// Call initialization function
initializeSupabase();
initializeTeamsTable();

// Helper function to get logo with fallback to default
function getLogoWithFallback(logoUrl) {
  return logoUrl || '../assets/default-logo.svg';
}

// Socket.IO event handlers
io.on('connection', async (socket) => {
  console.log('Client connected');
  
  // Get team info to include with game state
  const teamsResult = await fetchTeams();
  const teamsInfo = teamsResult.success ? teamsResult.data : [];
  
  // Send current game state to the client
  socket.emit('gameState', {
    ...createSafeCopy(gameState),
    _teamsInfo: teamsInfo
  });
  
  // Handle timer events
  socket.on('startTimer', () => {
    startTimer();
    socket.broadcast.emit('timerStarted');
  });
  
  socket.on('stopTimer', () => {
    stopTimer();
    socket.broadcast.emit('timerStopped');
  });
  
  socket.on('setTime', (seconds) => {
    gameState.timer.time = seconds;
    io.emit('timeUpdate', gameState.timer.time);
  });
  
  // Handle team management
  socket.on('fetchTeams', async () => {
    const result = await fetchTeams();
    socket.emit('teamsData', result);
  });

  socket.on('addTeam', async (teamData) => {
    console.log('Received addTeam request with data:', teamData);
    try {
      const result = await addTeam(teamData);
      console.log('Add team result:', result);
      if (result.success) {
        io.emit('teamAdded', result.data);
      }
      socket.emit('teamAddResult', result);
    } catch (err) {
      console.error('Unexpected error in addTeam handler:', err);
      socket.emit('teamAddResult', { success: false, error: err.message });
    }
  });

  socket.on('updateTeam', async (data) => {
    // Check if this is a team update for the game state or a team in the database
    if (data.team && (data.team === 'team1' || data.team === 'team2')) {
      // This is a team update for the game state
      const { team, data: teamData } = data;
      
      // Update only the provided fields
      Object.keys(teamData).forEach(key => {
        if (key === 'logo') {
          gameState.teams[team][key] = getLogoWithFallback(teamData[key]);
        } else {
          gameState.teams[team][key] = teamData[key];
        }
      });
      
      // Look up full team info for abbreviations
      const result = await fetchTeams();
      const teamsInfo = result.success ? result.data : [];
      
      // Add teamsInfo to the broadcast so clients have access to abbreviations
      io.emit('teamUpdate', {
        ...createSafeCopy(gameState.teams),
        _teamsInfo: teamsInfo
      });
    } else {
      // This is a team update for the database
      const { id, teamData } = data;
      const result = await updateTeam(id, teamData);
      if (result.success) {
        io.emit('teamUpdated', result.data);
      }
      socket.emit('teamUpdateResult', result);
    }
  });

  socket.on('deleteTeam', async (id) => {
    const result = await deleteTeam(id);
    if (result.success) {
      io.emit('teamDeleted', id);
    }
    socket.emit('teamDeleteResult', result);
  });
  
  socket.on('updateScore', (data) => {
    const { team, score } = data;
    gameState.teams[team].score = score;
    io.emit('scoreUpdate', createSafeCopy(gameState.teams));
  });
  
  // Handle goal horn requests
  socket.on('playGoalHorn', (data) => {
    // Play goal horn for all clients
    io.emit('playGoalHorn', data);
  });
  
  // Handle goal horn settings updates
  socket.on('updateGoalHornSettings', (settings) => {
    // Store settings in game state if not already there
    if (!gameState.goalHorn) {
      gameState.goalHorn = {};
    }
    
    // Update settings
    gameState.goalHorn = {
      ...gameState.goalHorn,
      ...settings
    };
    
    // Broadcast the updated settings to all clients
    io.emit('goalHornSettings', createSafeCopy(gameState.goalHorn));
  });
  
  // Handle period updates
  socket.on('updatePeriod', (period) => {
    gameState.period = period;
    io.emit('periodUpdate', period);
  });
  
  // Handle game info updates
  socket.on('updateGameInfo', (gameInfo) => {
    gameState.gameInfo = {
      ...gameState.gameInfo,
      ...gameInfo
    };
    io.emit('gameInfoUpdate', createSafeCopy(gameState.gameInfo));
    
    // If game is finished, save to Supabase
    if (gameInfo.finished) {
      const gameRecord = {
        date: gameState.gameInfo.date,
        time: gameState.gameInfo.time,
        team1_name: gameState.teams.team1.name,
        team2_name: gameState.teams.team2.name,
        team1_score: gameState.teams.team1.score,
        team2_score: gameState.teams.team2.score,
        result: gameState.gameInfo.result,
        finished_at: new Date().toISOString()
      };
      
      // Save game to Supabase
      saveGameToSupabase(createSafeCopy(gameRecord))
        .then(success => {
          if (success) {
            socket.emit('gameSaved', { success: true });
          } else {
            socket.emit('gameSaved', { success: false, error: 'Failed to save game' });
          }
        });
    }
  });
  
  // Handle game configuration updates
  socket.on('updateGameConfig', (config) => {
    gameState.config = {
      ...gameState.config,
      ...config
    };
    
    // Broadcast the updated configuration to all clients
    io.emit('gameConfigUpdate', createSafeCopy(gameState.config));
    
    // Send confirmation to the sender
    socket.emit('gameConfigSaved', { success: true });
  });
  
  // Handle game reset
  socket.on('resetGame', () => {
    // Stop timer if running
    stopTimer();
    
    // Get period time in seconds from config
    const periodTimeInSeconds = gameState.config.periodMinutes * 60;
    
    // Reset game state
    gameState = {
      timer: {
        time: periodTimeInSeconds,
        isRunning: false,
        intervalId: null
      },
      teams: {
        team1: {
          name: "ASOKE ANTEATERS",
          score: 0,
          logo: getLogoWithFallback("../assets/Anteaters_Official_Logo.png"),
          penalty: {
            active: false,
            time: 0,
            visible: true
          }
        },
        team2: {
          name: "BKK BAEBLADEZ",
          score: 0,
          logo: getLogoWithFallback("../assets/Bladez_Official_Logo.png"),
          penalty: {
            active: false,
            time: 0,
            visible: true
          }
        }
      },
      period: 1,
      gameInfo: {
        date: gameState.gameInfo.date,
        time: gameState.gameInfo.time,
        finished: false,
        result: ''
      },
      config: {
        ...gameState.config // Keep existing config
      },
      goalHorn: {
        enabled: true,
        volume: 80,
        team1Enabled: true,
        team2Enabled: true
      }
    };
    
    // Broadcast reset state to all clients
    io.emit('gameState', createSafeCopy(gameState));
  });
  
  // Handle game history requests
  socket.on('fetchGameHistory', async () => {
    const result = await fetchGameHistory();
    socket.emit('gameHistoryData', createSafeCopy(result));
  });
  
  // Add this to the socket.io event handlers to handle initialization request
  socket.on('initTeamsTable', async () => {
    console.log('Received request to initialize teams table');
    try {
      // Check if teams table exists
      const { error } = await supabase
        .from('teams')
        .select('id')
        .limit(1);
      
      if (error && error.code === '42P01') {
        console.log('Teams table does not exist. Creating it now...');
        
        // Create the teams table
        const { error: createError } = await supabase
          .from('_sql')
          .select(`
            CREATE TABLE IF NOT EXISTS public.teams (
              id SERIAL PRIMARY KEY,
              name TEXT NOT NULL,
              display_name TEXT NOT NULL,
              abbreviation TEXT,
              logo_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
            );
            
            -- Insert initial teams
            INSERT INTO public.teams (name, display_name, abbreviation, logo_url) 
            VALUES 
            ('ASOKE ANTEATERS', 'Anteaters', 'ANT', '../assets/Anteaters_Official_Logo.png'),
            ('BKK BAEBLADEZ', 'Bladez', 'BLZ', '../assets/Bladez_Official_Logo.png'),
            ('RATTANAKORN RAIDERS', 'Raiders', 'RAI', '../assets/Raiders_Official_Logo.png');
          `);
        
        if (createError) {
          console.error('Failed to create teams table:', createError);
          socket.emit('initTeamsTableResult', { success: false, error: createError });
        } else {
          console.log('Teams table created successfully with initial data');
          socket.emit('initTeamsTableResult', { success: true });
        }
      } else if (error) {
        console.error('Error checking teams table:', error);
        socket.emit('initTeamsTableResult', { success: false, error });
      } else {
        console.log('Teams table already exists');
        socket.emit('initTeamsTableResult', { success: true, message: 'Teams table already exists' });
      }
    } catch (err) {
      console.error('Unexpected error during teams table initialization:', err);
      socket.emit('initTeamsTableResult', { success: false, error: err.message });
    }
  });
  
  // Handle penalty settings
  socket.on('setPenalty', (data) => {
    const { team, minutes, seconds, active } = data;
    if (!gameState.teams[team]) return;
    
    gameState.teams[team].penalty.active = active;
    if (active) {
      gameState.teams[team].penalty.time = (minutes * 60) + seconds;
    } else {
      gameState.teams[team].penalty.time = 0;
    }
    
    io.emit('penaltyUpdate', { 
      team, 
      time: gameState.teams[team].penalty.time,
      active: gameState.teams[team].penalty.active,
      visible: gameState.teams[team].penalty.visible
    });
  });
  
  // Handle penalty visibility toggle
  socket.on('togglePenaltyVisibility', (data) => {
    const { team, visible } = data;
    if (!gameState.teams[team]) return;
    
    // Update visibility state
    gameState.teams[team].penalty.visible = visible;
    
    // Broadcast the update to all clients
    io.emit('penaltyVisibilityUpdate', {
      team,
      visible
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 