const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://xaakqhceogyxvcccstav.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWtxaGNlb2d5eHZjY2NzdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzksImV4cCI6MjA2MDU0MDQ3OX0.ALvUeCFh6dN8V1YCoDHhsue8-Gx13Z8OMLblH2DQuNg';
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

// Initialize game state
let gameState = {
  timer: {
    time: 900, // 15 minutes in seconds
    isRunning: false,
    intervalId: null
  },
  teams: {
    team1: {
      name: "ASOKE ANTEATERS",
      score: 0,
      logo: "../assets/Anteaters_Official_Logo.png"
    },
    team2: {
      name: "BKK BAEBLADEZ",
      score: 0,
      logo: "../assets/Bladez_Official_Logo.png"
    }
  },
  period: 1,
  gameInfo: {
    date: '',
    time: '',
    finished: false,
    result: ''
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

// Timer functions
function startTimer() {
  if (!gameState.timer.isRunning) {
    gameState.timer.isRunning = true;
    gameState.timer.intervalId = setInterval(() => {
      // Decrement timer if greater than 0
      if (gameState.timer.time > 0) {
        gameState.timer.time -= 1;
        io.emit('timeUpdate', gameState.timer.time);
      } else {
        // Stop timer when it reaches 0
        stopTimer();
      }
    }, 1000);
  }
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

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log('Client connected');
  
  // Send current game state to the client
  socket.emit('gameState', createSafeCopy(gameState));
  
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
  
  // Handle team events
  socket.on('updateTeam', (data) => {
    const { team, data: teamData } = data;
    
    // Update only the provided fields
    Object.keys(teamData).forEach(key => {
      gameState.teams[team][key] = teamData[key];
    });
    
    io.emit('teamUpdate', createSafeCopy(gameState.teams));
  });
  
  socket.on('updateScore', (data) => {
    const { team, score } = data;
    gameState.teams[team].score = score;
    io.emit('scoreUpdate', createSafeCopy(gameState.teams));
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
  
  // Handle game reset
  socket.on('resetGame', () => {
    // Stop timer if running
    stopTimer();
    
    // Reset game state
    gameState = {
      timer: {
        time: 900, // 15 minutes in seconds
        isRunning: false,
        intervalId: null
      },
      teams: {
        team1: {
          name: "ASOKE ANTEATERS",
          score: 0,
          logo: "../assets/Anteaters_Official_Logo.png"
        },
        team2: {
          name: "BKK BAEBLADEZ",
          score: 0,
          logo: "../assets/Bladez_Official_Logo.png"
        }
      },
      period: 1,
      gameInfo: {
        date: gameState.gameInfo.date,
        time: gameState.gameInfo.time,
        finished: false,
        result: ''
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
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 