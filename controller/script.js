// Initialize socket
const socket = io();

// DOM Elements - Connection Status
const connectionIndicator = document.getElementById('connection-indicator');
const connectionStatus = document.getElementById('connection-text');

// DOM Elements - Game Info
const gameDateInput = document.getElementById('game-date');
const gameTimeInput = document.getElementById('game-time');
const updateGameInfoBtn = document.getElementById('update-game-info');
const currentGameInfo = document.getElementById('current-game-info');

// DOM Elements - Timer
const timerDisplay = document.getElementById('timer-display');
const startTimerBtn = document.getElementById('start-timer');
const stopTimerBtn = document.getElementById('stop-timer');
const resetTimerBtn = document.getElementById('reset-timer');
const nextPeriodBtn = document.getElementById('next-period');
const timeMinutesInput = document.getElementById('time-minutes');
const timeSecondsInput = document.getElementById('time-seconds');
const setTimeBtn = document.getElementById('set-time');
const addMinuteBtn = document.getElementById('add-minute');
const subMinuteBtn = document.getElementById('sub-minute');
const addSecondsBtn = document.getElementById('add-seconds');
const subSecondsBtn = document.getElementById('sub-seconds');

// DOM Elements - Teams
const switchTeamsBtn = document.getElementById('switch-teams');

const team1NameInput = document.getElementById('team1-name-input');
const updateTeam1NameBtn = document.getElementById('update-team1-name');
const team1LogoInput = document.getElementById('team1-logo-input');
const team1LogoFile = document.getElementById('team1-logo-file');
const updateTeam1LogoBtn = document.getElementById('update-team1-logo');
const team1ScoreDisplay = document.getElementById('team1-score-display');
const team1ScorePlusBtn = document.getElementById('team1-score-plus');
const team1ScoreMinusBtn = document.getElementById('team1-score-minus');

const team2NameInput = document.getElementById('team2-name-input');
const updateTeam2NameBtn = document.getElementById('update-team2-name');
const team2LogoInput = document.getElementById('team2-logo-input');
const team2LogoFile = document.getElementById('team2-logo-file');
const updateTeam2LogoBtn = document.getElementById('update-team2-logo');
const team2ScoreDisplay = document.getElementById('team2-score-display');
const team2ScorePlusBtn = document.getElementById('team2-score-plus');
const team2ScoreMinusBtn = document.getElementById('team2-score-minus');

// DOM Elements - Team Presets
const presetButtons = document.querySelectorAll('.preset-btn');

// DOM Elements - Period
const periodDisplay = document.getElementById('period-display');
const periodPlusBtn = document.getElementById('period-plus');
const periodMinusBtn = document.getElementById('period-minus');
const setPeriod1Btn = document.getElementById('set-period-1');
const setPeriod2Btn = document.getElementById('set-period-2');
const setPeriod3Btn = document.getElementById('set-period-3');
const setPeriodSOBtn = document.getElementById('set-period-so');

// DOM Elements - Game
const finishGameBtn = document.getElementById('finish-game');
const gameResultDisplay = document.getElementById('game-result-display');
const resetGameBtn = document.getElementById('reset-game');
const toggleTeam1PenaltyBtn = document.getElementById('toggle-team1-penalty');
const toggleTeam2PenaltyBtn = document.getElementById('toggle-team2-penalty');

// DOM Elements - Game History
const loadHistoryBtn = document.getElementById('load-history');
const historyTableBody = document.getElementById('history-table-body');
const noHistoryMessage = document.getElementById('no-history-message');

// DOM Elements - Game Configuration
const defaultPeriodMinutesInput = document.getElementById('default-period-minutes');
const defaultTotalPeriodsInput = document.getElementById('default-total-periods');
const defaultShootoutMinutesInput = document.getElementById('default-shootout-minutes');
const saveGameConfigBtn = document.getElementById('save-game-config');

// DOM Elements - Team Management
const toggleTeamMgmtBtn = document.getElementById('toggle-team-mgmt');
const teamManagementPanel = document.getElementById('team-management-panel');
const teamsList = document.getElementById('teams-list');
const teamForm = document.getElementById('team-form');
const teamFormTitle = document.getElementById('team-form-title');
const teamIdInput = document.getElementById('team-id');
const teamNameInput = document.getElementById('team-name');
const teamDisplayNameInput = document.getElementById('team-display-name');
const teamAbbreviationInput = document.getElementById('team-abbreviation');
const teamLogoUrlInput = document.getElementById('team-logo-url');
const teamLogoFileInput = document.getElementById('team-logo-file');
const saveTeamBtn = document.getElementById('save-team');
const cancelTeamBtn = document.getElementById('cancel-team');

// DOM Elements - Toggle Game Info
const toggleGameInfoBtn = document.getElementById('toggle-game-info');
const gameInfoPanel = document.getElementById('game-info-panel');

// DOM Elements - Sound Settings Toggle
const toggleSoundSettingsBtn = document.getElementById('toggle-sound-settings');
const soundSettingsPanel = document.getElementById('sound-settings-panel');

// DOM elements for penalty controls
const team1PenaltyTime = document.getElementById('team1-penalty-time');
const team1PenaltyEnabled = document.getElementById('team1-penalty-enabled');
const team1PenaltyMins = document.getElementById('team1-penalty-mins');
const team1PenaltySecs = document.getElementById('team1-penalty-secs');
const team1PenaltySet = document.getElementById('team1-penalty-set');
const team1PenaltyClear = document.getElementById('team1-penalty-clear');

const team2PenaltyTime = document.getElementById('team2-penalty-time');
const team2PenaltyEnabled = document.getElementById('team2-penalty-enabled');
const team2PenaltyMins = document.getElementById('team2-penalty-mins');
const team2PenaltySecs = document.getElementById('team2-penalty-secs');
const team2PenaltySet = document.getElementById('team2-penalty-set');
const team2PenaltyClear = document.getElementById('team2-penalty-clear');

// DOM Elements - Goal Horn Controls
const team1GoalHornEnabled = document.getElementById('team1-goal-horn-enabled');
const team1TestHorn = document.getElementById('team1-test-horn');
const team2GoalHornEnabled = document.getElementById('team2-goal-horn-enabled');
const team2TestHorn = document.getElementById('team2-test-horn');
const goalHornMasterEnabled = document.getElementById('goal-horn-master-enabled');
const goalHornFile = document.getElementById('goal-horn-file');
const goalHornVolume = document.getElementById('goal-horn-volume');
const volumeValue = document.getElementById('volume-value');

// Variables to track penalty times
let team1PenaltyTimeRemaining = 0;
let team2PenaltyTimeRemaining = 0;
let team1PenaltyActive = false;
let team2PenaltyActive = false;
let team1PenaltyInterval;
let team2PenaltyInterval;

// Add variables to track penalty display state
let team1PenaltyVisible = true;
let team2PenaltyVisible = true;

// Add these variables for score tracking at the top of the file
let team1Score = 0;
let team2Score = 0;

// Game state
let gameState = {
  timer: {
    time: 900, // 15 minutes in seconds
    isRunning: false
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
  },
  config: {
    periodMinutes: 15,
    totalPeriods: 3,
    shootoutMinutes: 5
  }
};

// Add this variable to store teams data
let teamsData = [];

// Format time from seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Convert MM:SS to seconds
function timeToSeconds(minutes, seconds) {
  return (parseInt(minutes) * 60) + parseInt(seconds);
}

// Update game info display
function updateGameInfoDisplay() {
  if (gameState.gameInfo.date && gameState.gameInfo.time) {
    currentGameInfo.textContent = `${gameState.gameInfo.date} at ${gameState.gameInfo.time}`;
  } else {
    const dateValue = gameDateInput.value;
    const timeValue = gameTimeInput.value;
    
    if (dateValue && timeValue) {
      currentGameInfo.textContent = `${dateValue} at ${timeValue}`;
    } else {
      currentGameInfo.textContent = 'Not set';
    }
  }
}

// Initialize connection status indicator
connectionStatus.innerHTML = 'Disconnected';
connectionIndicator.classList.remove('connected');

// Initialize document ready function
document.addEventListener('DOMContentLoaded', () => {
  // Explicitly set initial styles to ensure they're properly applied
  gameInfoPanel.style.display = 'none';
  
  // Initialize toggle functionality for sections
  // Game Info toggle
  toggleGameInfoBtn.addEventListener('click', function() {
    console.log('Toggle game info button clicked');
    // Use getComputedStyle to accurately determine current visibility
    const computedStyle = window.getComputedStyle(gameInfoPanel);
    const isVisible = computedStyle.display !== 'none';
    
    if (!isVisible) {
      // Show panel
      gameInfoPanel.style.display = 'block';
      toggleGameInfoBtn.textContent = 'Hide Game Date/Time';
      console.log('Game info panel shown');
    } else {
      // Hide panel
      gameInfoPanel.style.display = 'none';
      toggleGameInfoBtn.textContent = 'Show Game Date/Time';
      console.log('Game info panel hidden');
    }
  });
  
  // Sound Settings toggle
  toggleSoundSettingsBtn.addEventListener('click', () => {
    if (soundSettingsPanel.style.display === 'none') {
      soundSettingsPanel.style.display = 'block';
      toggleSoundSettingsBtn.textContent = 'Hide Sound Settings';
    } else {
      soundSettingsPanel.style.display = 'none';
      toggleSoundSettingsBtn.textContent = 'Show Sound Settings';
    }
  });
});

// Socket event handlers
socket.on('connect', () => {
  connectionIndicator.classList.remove('disconnected');
  connectionIndicator.classList.add('connected');
  connectionStatus.textContent = 'Connected';
  console.log('Connected to server');
  
  if (gameState.team1 && gameState.team2) {
    team1NameInput.value = gameState.team1.name;
    team2NameInput.value = gameState.team2.name;
    team1LogoInput.value = gameState.team1.logo;
    team2LogoInput.value = gameState.team2.logo;
    updateTeamLogos();
  }

  updateGameDateTime();
  
  // Set timer display
  timerDisplay.textContent = formatTime(gameState.timer.time);
  
  setTimerDisplay();
  updateScoreDisplay();
  updatePeriodDisplay();
  updateGameInfoDisplay();
  
  // Automatically load game history on connection
  loadGameHistory();
  
  // Load teams on connect
  loadTeams();
  
  // Always show team management panel
  teamManagementPanel.style.display = 'flex';
  toggleTeamMgmtBtn.textContent = 'Hide Team Management';
});

socket.on('disconnect', () => {
  connectionIndicator.classList.remove('connected');
  connectionStatus.textContent = 'Disconnected';
  console.log('Disconnected from server');
});

socket.on('gameState', (state) => {
  console.log('Game state received:', state);
  gameState = state;
  
  // Update UI with current game state
  timerDisplay.textContent = formatTime(state.timer.time);
  team1NameInput.value = state.teams.team1.name;
  team1ScoreDisplay.textContent = state.teams.team1.score;
  team1LogoInput.value = state.teams.team1.logo;
  
  team2NameInput.value = state.teams.team2.name;
  team2ScoreDisplay.textContent = state.teams.team2.score;
  team2LogoInput.value = state.teams.team2.logo;
  
  // Update local score tracking variables
  team1Score = state.teams.team1.score;
  team2Score = state.teams.team2.score;
  
  periodDisplay.textContent = state.period;
  
  // Update time inputs
  timeMinutesInput.value = Math.floor(state.timer.time / 60);
  timeSecondsInput.value = state.timer.time % 60;
  
  // Update game configuration inputs if available
  if (state.config) {
    defaultPeriodMinutesInput.value = state.config.periodMinutes;
    defaultTotalPeriodsInput.value = state.config.totalPeriods;
    defaultShootoutMinutesInput.value = state.config.shootoutMinutes;
  }
  
  // Initialize goal horn settings if available
  if (state.goalHorn) {
    goalHornSettings = {
      ...goalHornSettings,
      ...state.goalHorn
    };
    
    // Update UI controls
    goalHornMasterEnabled.checked = state.goalHorn.enabled !== undefined ? state.goalHorn.enabled : goalHornSettings.enabled;
    team1GoalHornEnabled.checked = state.goalHorn.team1Enabled !== undefined ? state.goalHorn.team1Enabled : goalHornSettings.team1Enabled;
    team2GoalHornEnabled.checked = state.goalHorn.team2Enabled !== undefined ? state.goalHorn.team2Enabled : goalHornSettings.team2Enabled;
    
    if (state.goalHorn.volume !== undefined) {
      goalHornVolume.value = state.goalHorn.volume;
      volumeValue.textContent = `${state.goalHorn.volume}%`;
    }
  }
  
  // Update game info if available
  if (state.gameInfo) {
    gameState.gameInfo = state.gameInfo;
    if (state.gameInfo.date) {
      gameDateInput.value = state.gameInfo.date;
    }
    if (state.gameInfo.time) {
      gameTimeInput.value = state.gameInfo.time;
    }
    updateGameInfoDisplay();
    
    // Handle finished game state
    if (state.gameInfo.finished) {
      finishGameBtn.textContent = "Game Finished";
      finishGameBtn.disabled = true;
      gameResultDisplay.textContent = state.gameInfo.result;
      gameResultDisplay.style.display = 'block';
    } else {
      finishGameBtn.textContent = "Finish Game";
      finishGameBtn.disabled = false;
      gameResultDisplay.style.display = 'none';
    }
  }
  
  // Sync local penalty state with server state
  if (state.teams && state.teams.team1 && state.teams.team1.penalty) {
    team1PenaltyActive = state.teams.team1.penalty.active;
    team1PenaltyTimeRemaining = state.teams.team1.penalty.time;
    team1PenaltyEnabled.checked = team1PenaltyActive;
    updatePenaltyDisplay(1);
    
    // Update penalty visibility state
    team1PenaltyVisible = state.teams.team1.penalty.visible !== false;
    toggleTeam1PenaltyBtn.textContent = team1PenaltyVisible ? 'Hide Home Penalty' : 'Show Home Penalty';
    toggleTeam1PenaltyBtn.classList.toggle('active', !team1PenaltyVisible);
  }
  
  if (state.teams && state.teams.team2 && state.teams.team2.penalty) {
    team2PenaltyActive = state.teams.team2.penalty.active;
    team2PenaltyTimeRemaining = state.teams.team2.penalty.time;
    team2PenaltyEnabled.checked = team2PenaltyActive;
    updatePenaltyDisplay(2);
    
    // Update penalty visibility state
    team2PenaltyVisible = state.teams.team2.penalty.visible !== false;
    toggleTeam2PenaltyBtn.textContent = team2PenaltyVisible ? 'Hide Away Penalty' : 'Show Away Penalty';
    toggleTeam2PenaltyBtn.classList.toggle('active', !team2PenaltyVisible);
  }
});

socket.on('timeUpdate', (time) => {
  timerDisplay.textContent = formatTime(time);
  gameState.timer.time = time;
});

socket.on('timerStarted', () => {
  gameState.timer.isRunning = true;
});

socket.on('timerStopped', () => {
  gameState.timer.isRunning = false;
});

socket.on('scoreUpdate', (data) => {
  // Extract the teams data properly from the response structure
  const teams = data.teams;
  
  // Update displayed scores
  team1ScoreDisplay.textContent = teams.team1.score;
  team2ScoreDisplay.textContent = teams.team2.score;
  
  // Also update local score tracking variables
  team1Score = parseInt(teams.team1.score) || 0;
  team2Score = parseInt(teams.team2.score) || 0;
  
  // Update gameState
  gameState.teams = teams;
});

socket.on('teamUpdate', (teams) => {
  team1NameInput.value = teams.team1.name;
  team1LogoInput.value = teams.team1.logo;
  
  team2NameInput.value = teams.team2.name;
  team2LogoInput.value = teams.team2.logo;
  
  gameState.teams = teams;
});

socket.on('periodUpdate', (period) => {
  periodDisplay.textContent = period;
  gameState.period = period;
  
  // Briefly show current period on the button
  updateNextPeriodButtonText(period);
  
  // If advancing to period 4, automatically go to shootout
  if (period === 4) {
    setPeriodSOBtn.click();
  }
});

socket.on('gameInfoUpdate', (gameInfo) => {
  gameState.gameInfo = gameInfo;
  updateGameInfoDisplay();
  
  // Handle finished game state
  if (gameInfo.finished) {
    finishGameBtn.textContent = "Game Finished";
    finishGameBtn.disabled = true;
    gameResultDisplay.textContent = gameInfo.result;
    gameResultDisplay.style.display = 'block';
  }
});

// Listen for game saved events
socket.on('gameSaved', (response) => {
  // Skip handling if this is for the Finish Game button (handled by the once listener)
  if (finishGameBtn.textContent === "Finish Game") {
    return;
  }
  
  if (response.success) {
    // Show success notification
    const savedNote = document.createElement('div');
    savedNote.className = 'save-notification success';
    savedNote.textContent = 'Game saved to history!';
    gameResultDisplay.appendChild(savedNote);
    
    // Remove notification after 5 seconds
    setTimeout(() => {
      savedNote.remove();
    }, 5000);
  } else {
    // Show error notification
    const errorNote = document.createElement('div');
    errorNote.className = 'save-notification error';
    errorNote.textContent = 'Failed to save game: ' + (response.error || 'Unknown error');
    gameResultDisplay.appendChild(errorNote);
  }
});

// Listen for game history data
socket.on('gameHistoryData', (response) => {
  if (response.success && response.data && response.data.length > 0) {
    // Hide no history message
    noHistoryMessage.style.display = 'none';
    
    // Clear existing table rows
    historyTableBody.innerHTML = '';
    
    // Populate table with history data
    response.data.forEach(game => {
      const row = document.createElement('tr');
      
      // Format date for display
      const gameDate = new Date(game.date);
      const formattedDate = `${gameDate.toLocaleDateString()} ${game.time}`;
      
      // Create table cells
      row.innerHTML = `
        <td>${formattedDate}</td>
        <td>${game.team1_name} vs ${game.team2_name}</td>
        <td>${game.team1_score} - ${game.team2_score}</td>
        <td>${game.result}</td>
      `;
      
      historyTableBody.appendChild(row);
    });
  } else {
    // Show no history message
    historyTableBody.innerHTML = '';
    
    if (response.error) {
      // Show error message instead of no history
      noHistoryMessage.textContent = `Error loading history: ${response.error.message || 'Database error'}`;
      noHistoryMessage.style.color = '#f44336';
      noHistoryMessage.style.display = 'block';
      console.error('Error fetching game history:', response.error);
    } else {
      // Just show no history available message
      noHistoryMessage.textContent = 'No game history available. Finish a game to record it.';
      noHistoryMessage.style.color = '#757575';
      noHistoryMessage.style.display = 'block';
    }
  }
});

// Game info update
updateGameInfoBtn.addEventListener('click', () => {
  const date = gameDateInput.value;
  const time = gameTimeInput.value;
  
  if (date && time) {
    const gameInfo = {
      date,
      time,
      finished: gameState.gameInfo.finished,
      result: gameState.gameInfo.result
    };
    
    socket.emit('updateGameInfo', gameInfo);
    updateGameInfoDisplay();
  }
});

// Next Period Button - advances to next period and resets timer
nextPeriodBtn.addEventListener('click', () => {
  // Stop the timer if it's running
  if (gameState.timer.isRunning) {
    socket.emit('stopTimer');
  }
  
  // Get period time from config (default to 15 minutes if not set)
  const periodMinutes = gameState.config?.periodMinutes || 15;
  const periodSeconds = periodMinutes * 60;
  
  // Set the timer based on configuration
  socket.emit('setTime', periodSeconds);
  
  // Update local time inputs
  timeMinutesInput.value = periodMinutes;
  timeSecondsInput.value = 0;
  
  // Increment the period
  const newPeriod = gameState.period + 1;
  
  // Get total periods from config (default to 3 if not set)
  const totalPeriods = gameState.config?.totalPeriods || 3;
  const shootoutMinutes = gameState.config?.shootoutMinutes || 5;
  
  // If going beyond configured total periods, go to shootout (period 5)
  if (newPeriod > totalPeriods) {
    socket.emit('updatePeriod', 5); // Set to shootout
    
    // Reset timer for shootout based on config
    const shootoutSeconds = shootoutMinutes * 60;
    socket.emit('setTime', shootoutSeconds);
    timeMinutesInput.value = shootoutMinutes;
    timeSecondsInput.value = 0;
  } else {
    socket.emit('updatePeriod', newPeriod);
  }
  
  // Update button text to show current period
  updateNextPeriodButtonText(newPeriod > totalPeriods ? 5 : newPeriod);
});

// Helper function to update Next Period button text
function updateNextPeriodButtonText(period) {
  let periodText = '';
  switch(period) {
    case 1: periodText = '1st'; break;
    case 2: periodText = '2nd'; break;
    case 3: periodText = '3rd'; break;
    case 5: periodText = 'SO'; break;
    default: periodText = `${period}th`; break;
  }
  
  nextPeriodBtn.textContent = `Now Playing: ${periodText} Period`;
  nextPeriodBtn.classList.add('active');
  
  // Reset text after 3 seconds
  setTimeout(() => {
    nextPeriodBtn.textContent = "Next Period";
    nextPeriodBtn.classList.remove('active');
  }, 3000);
}

// Period preset buttons
setPeriod1Btn.addEventListener('click', () => {
  socket.emit('updatePeriod', 1);
  
  // Get period time from config (default to 15 minutes if not set)
  const periodMinutes = gameState.config?.periodMinutes || 15;
  const periodSeconds = periodMinutes * 60;
  
  // Set timer for regular period based on config
  socket.emit('setTime', periodSeconds);
  timeMinutesInput.value = periodMinutes;
  timeSecondsInput.value = 0;
});

setPeriod2Btn.addEventListener('click', () => {
  socket.emit('updatePeriod', 2);
  
  // Get period time from config (default to 15 minutes if not set)
  const periodMinutes = gameState.config?.periodMinutes || 15;
  const periodSeconds = periodMinutes * 60;
  
  // Set timer for regular period based on config
  socket.emit('setTime', periodSeconds);
  timeMinutesInput.value = periodMinutes;
  timeSecondsInput.value = 0;
});

setPeriod3Btn.addEventListener('click', () => {
  socket.emit('updatePeriod', 3);
  
  // Get period time from config (default to 15 minutes if not set)
  const periodMinutes = gameState.config?.periodMinutes || 15;
  const periodSeconds = periodMinutes * 60;
  
  // Set timer for regular period based on config
  socket.emit('setTime', periodSeconds);
  timeMinutesInput.value = periodMinutes;
  timeSecondsInput.value = 0;
});

setPeriodSOBtn.addEventListener('click', () => {
  socket.emit('updatePeriod', 5); // SO is period 5
  
  // Get shootout minutes from config (default to 5 if not set)
  const shootoutMinutes = gameState.config?.shootoutMinutes || 5;
  const shootoutSeconds = shootoutMinutes * 60;
  
  // Set timer for shootout based on config
  socket.emit('setTime', shootoutSeconds);
  timeMinutesInput.value = shootoutMinutes;
  timeSecondsInput.value = 0;
});

// Finish Game button
finishGameBtn.addEventListener('click', () => {
  // Confirm before finishing
  if (confirm('Are you sure you want to finish the game? This will record the final score.')) {
    // Stop the timer if it's running
    if (gameState.timer.isRunning) {
      socket.emit('stopTimer');
    }
    
    // Determine the winner
    const team1Score = parseInt(team1ScoreDisplay.textContent);
    const team2Score = parseInt(team2ScoreDisplay.textContent);
    let result = '';
    
    if (team1Score > team2Score) {
      result = `${team1NameInput.value} wins ${team1Score}-${team2Score}`;
    } else if (team2Score > team1Score) {
      result = `${team2NameInput.value} wins ${team2Score}-${team1Score}`;
    } else {
      result = `Game tied ${team1Score}-${team2Score}`;
    }
    
    // Update game info with result
    const gameInfo = {
      date: gameDateInput.value,
      time: gameTimeInput.value,
      finished: true,
      result: result
    };
    
    socket.emit('updateGameInfo', gameInfo);
    
    // Show message that the game is being saved
    gameResultDisplay.textContent = `${result} - Saving...`;
    gameResultDisplay.style.display = 'block';
    
    // Wait for game to be saved before resetting UI
    socket.once('gameSaved', (response) => {
      if (response.success) {
        // Reset scores to 0 and period to 1
        socket.emit('updateScore', { team: 'team1', value: 0 });
        socket.emit('updateScore', { team: 'team2', value: 0 });
        socket.emit('updatePeriod', 1);
        
        // Reset timer to 15 minutes
        const seconds = 900;
        socket.emit('setTime', seconds);
        timeMinutesInput.value = 15;
        timeSecondsInput.value = 0;
        
        // Update game date and time to current computer time
        updateGameDateTime();
        
        // Reset the game finished state
        finishGameBtn.textContent = "Finish Game";
        finishGameBtn.disabled = false;
        
        // Display success message
        const savedNote = document.createElement('div');
        savedNote.className = 'save-notification success';
        savedNote.textContent = 'Game saved and new game ready!';
        gameResultDisplay.textContent = result;
        gameResultDisplay.appendChild(savedNote);
        
        // Remove notification after 5 seconds and hide the result
        setTimeout(() => {
          savedNote.remove();
          gameResultDisplay.style.display = 'none';
        }, 5000);
      }
    });
  }
});

// Switch Teams Button - swaps the positions of teams
switchTeamsBtn.addEventListener('click', () => {
  // Cache current team states
  const team1 = { ...gameState.teams.team1 };
  const team2 = { ...gameState.teams.team2 };
  
  // Swap team data
  socket.emit('updateTeam', { team: 'team1', data: team2 });
  socket.emit('updateTeam', { team: 'team2', data: team1 });
  
  // Provide user feedback
  switchTeamsBtn.textContent = "Teams Switched!";
  setTimeout(() => {
    switchTeamsBtn.textContent = "↔️ Switch Team Sides";
  }, 1500);
});

// Team Preset Handlers
presetButtons.forEach(button => {
  button.addEventListener('click', () => {
    const team = button.dataset.team;
    const name = button.dataset.name;
    const logo = button.dataset.logo;
    
    // Update form fields based on which team was selected
    if (team === 'team1') {
      team1NameInput.value = name;
      team1LogoInput.value = logo;
      socket.emit('updateTeam', { team: team, data: { name: name, logo: logo } });
    } else if (team === 'team2') {
      team2NameInput.value = name;
      team2LogoInput.value = logo;
      socket.emit('updateTeam', { team: team, data: { name: name, logo: logo } });
    }
  });
});

// Timer Controls
startTimerBtn.addEventListener('click', () => {
  if (!gameState.timer.isRunning) {
    socket.emit('startTimer');
    gameState.timer.isRunning = true;
  } else {
    socket.emit('stopTimer');
    gameState.timer.isRunning = false;
  }
});

stopTimerBtn.addEventListener('click', () => {
  socket.emit('stopTimer');
  gameState.timer.isRunning = false;
});

resetTimerBtn.addEventListener('click', () => {
  // Determine which period time to use based on current period
  let periodMinutes;
  
  if (gameState.period === 5) { // Shootout period
    // Get shootout minutes from config (default to 5 if not set)
    periodMinutes = gameState.config?.shootoutMinutes || 5;
  } else {
    // Get regular period minutes from config (default to 15 if not set)
    periodMinutes = gameState.config?.periodMinutes || 15;
  }
  
  const periodSeconds = periodMinutes * 60;
  
  // Reset timer based on configuration
  socket.emit('setTime', periodSeconds);
  
  // Update local time inputs
  timeMinutesInput.value = periodMinutes;
  timeSecondsInput.value = 0;
  
  console.log(`Timer reset to ${periodMinutes} minutes based on current period (${gameState.period})`);
});

setTimeBtn.addEventListener('click', () => {
  const minutes = parseInt(timeMinutesInput.value) || 0;
  const seconds = parseInt(timeSecondsInput.value) || 0;
  const totalSeconds = timeToSeconds(minutes, seconds);
  socket.emit('setTime', totalSeconds);
});

addMinuteBtn.addEventListener('click', () => {
  const newTime = gameState.timer.time + 60;
  socket.emit('setTime', newTime);
});

subMinuteBtn.addEventListener('click', () => {
  const newTime = Math.max(0, gameState.timer.time - 60);
  socket.emit('setTime', newTime);
});

addSecondsBtn.addEventListener('click', () => {
  const newTime = gameState.timer.time + 30;
  socket.emit('setTime', newTime);
});

subSecondsBtn.addEventListener('click', () => {
  const newTime = Math.max(0, gameState.timer.time - 30);
  socket.emit('setTime', newTime);
});

// Team Controls
updateTeam1NameBtn.addEventListener('click', () => {
  const newName = team1NameInput.value;
  // Find team data to get the abbreviation
  const teamData = teamsData.find(t => 
    t.name.toUpperCase() === newName.toUpperCase() || 
    newName.includes(t.name) || 
    t.name.includes(newName)
  );
  
  const abbreviation = teamData ? teamData.abbreviation : '';
  socket.emit('updateTeam', { 
    team: 'team1', 
    data: { 
      name: newName,
      abbreviation: abbreviation
    } 
  });
});

updateTeam1LogoBtn.addEventListener('click', () => {
  const logoUrl = team1LogoInput.value;
  if (logoUrl) {
    socket.emit('updateTeam', { team: 'team1', data: { logo: logoUrl } });
  }
});

team1LogoFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const logoDataUrl = event.target.result;
      team1LogoInput.value = logoDataUrl;
      socket.emit('updateTeam', { team: 'team1', data: { logo: logoDataUrl } });
    };
    reader.readAsDataURL(file);
  }
});

team1ScorePlusBtn.addEventListener('click', () => {
  if (connectionStatus) {
    team1Score = parseInt(team1Score) || 0;
    team1Score++;
    team1ScoreDisplay.textContent = team1Score;
    socket.emit('updateScore', { team: 'team1', value: team1Score });
    saveEvent('Team 1 scored: ' + team1Score);
  }
});

team1ScoreMinusBtn.addEventListener('click', () => {
  if (connectionStatus && team1Score > 0) {
    team1Score = parseInt(team1Score) || 0;
    team1Score--;
    team1ScoreDisplay.textContent = team1Score;
    socket.emit('updateScore', { team: 'team1', value: team1Score });
    saveEvent('Team 1 score adjusted: ' + team1Score);
  }
});

updateTeam2NameBtn.addEventListener('click', () => {
  const newName = team2NameInput.value;
  // Find team data to get the abbreviation
  const teamData = teamsData.find(t => 
    t.name.toUpperCase() === newName.toUpperCase() || 
    newName.includes(t.name) || 
    t.name.includes(newName)
  );
  
  const abbreviation = teamData ? teamData.abbreviation : '';
  socket.emit('updateTeam', { 
    team: 'team2', 
    data: { 
      name: newName,
      abbreviation: abbreviation
    } 
  });
});

updateTeam2LogoBtn.addEventListener('click', () => {
  const logoUrl = team2LogoInput.value;
  if (logoUrl) {
    socket.emit('updateTeam', { team: 'team2', data: { logo: logoUrl } });
  }
});

team2LogoFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const logoDataUrl = event.target.result;
      team2LogoInput.value = logoDataUrl;
      socket.emit('updateTeam', { team: 'team2', data: { logo: logoDataUrl } });
    };
    reader.readAsDataURL(file);
  }
});

team2ScorePlusBtn.addEventListener('click', () => {
  if (connectionStatus) {
    team2Score = parseInt(team2Score) || 0;
    team2Score++;
    team2ScoreDisplay.textContent = team2Score;
    socket.emit('updateScore', { team: 'team2', value: team2Score });
    saveEvent('Team 2 scored: ' + team2Score);
  }
});

team2ScoreMinusBtn.addEventListener('click', () => {
  if (connectionStatus && team2Score > 0) {
    team2Score = parseInt(team2Score) || 0;
    team2Score--;
    team2ScoreDisplay.textContent = team2Score;
    socket.emit('updateScore', { team: 'team2', value: team2Score });
    saveEvent('Team 2 score adjusted: ' + team2Score);
  }
});

// Period Controls
periodPlusBtn.addEventListener('click', () => {
  const newPeriod = gameState.period + 1;
  socket.emit('updatePeriod', newPeriod);
});

periodMinusBtn.addEventListener('click', () => {
  const newPeriod = Math.max(1, gameState.period - 1);
  socket.emit('updatePeriod', newPeriod);
});

// Game Controls
resetGameBtn.addEventListener('click', () => {
  if (confirm('Are you sure you want to reset the game? This will reset all scores, team names, and the timer.')) {
    socket.emit('resetGame');
    
    // Also reset game info status
    finishGameBtn.textContent = "Finish Game";
    finishGameBtn.disabled = false;
    gameResultDisplay.textContent = '';
    gameResultDisplay.style.display = 'none';
    
    // Update game date and time to current computer time
    updateGameDateTime();
  }
});

// Function to update game date and time to current computer time
function updateGameDateTime() {
  const now = new Date();
  const dateString = now.toISOString().slice(0, 10); // YYYY-MM-DD
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  gameDateInput.value = dateString;
  gameTimeInput.value = timeString;
  
  // Update game info
  const gameInfo = {
    date: dateString,
    time: timeString,
    finished: false,
    result: ''
  };
  
  socket.emit('updateGameInfo', gameInfo);
  updateGameInfoDisplay();
}

// Game History Controls
loadHistoryBtn.addEventListener('click', () => {
  loadGameHistory();
});

// Function to load game history from the server
function loadGameHistory() {
  // Request game history data from server
  socket.emit('fetchGameHistory');
  
  // Change button text temporarily
  loadHistoryBtn.textContent = 'Loading...';
  loadHistoryBtn.disabled = true;
  
  // Reset button after 2 seconds
  setTimeout(() => {
    loadHistoryBtn.textContent = 'Refresh Game History';
    loadHistoryBtn.disabled = false;
  }, 2000);
}

// Keyboard shortcuts for game controls
document.addEventListener('keydown', (e) => {
  // Only process keyboard shortcuts if not typing in an input field
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
    return;
  }
  
  switch (e.key) {
    case ' ': // Spacebar
      e.preventDefault(); // Prevent page scroll
      // Toggle timer - if running, use Pause button; if stopped, use Start button
      if (gameState.timer.isRunning) {
        stopTimerBtn.click();
        showKeyboardFeedback('Timer Paused');
      } else {
        startTimerBtn.click();
        showKeyboardFeedback('Timer Started');
      }
      break;
      
    case 'ArrowUp': // Up arrow - increase home team score
      e.preventDefault();
      // We need to manually click the button to ensure goal horn plays
      team1ScorePlusBtn.click();
      showKeyboardFeedback('Home +1');
      break;
      
    case 'ArrowDown': // Down arrow - decrease home team score
      e.preventDefault();
      team1ScoreMinusBtn.click();
      showKeyboardFeedback('Home -1');
      break;
      
    case 'ArrowLeft': // Left arrow - decrease away team score
      e.preventDefault();
      team2ScoreMinusBtn.click();
      showKeyboardFeedback('Away -1');
      break;
      
    case 'ArrowRight': // Right arrow - increase away team score
      e.preventDefault();
      // We need to manually click the button to ensure goal horn plays
      team2ScorePlusBtn.click();
      showKeyboardFeedback('Away +1');
      break;
  }
});

// Show visual feedback when keyboard shortcuts are used
function showKeyboardFeedback(message) {
  const feedback = document.createElement('div');
  feedback.className = 'keyboard-feedback';
  feedback.textContent = message;
  document.body.appendChild(feedback);
  
  // Animate in
  setTimeout(() => {
    feedback.classList.add('active');
    
    // Animate out and remove
    setTimeout(() => {
      feedback.classList.remove('active');
      setTimeout(() => {
        document.body.removeChild(feedback);
      }, 300);
    }, 800);
  }, 10);
}

// Add these functions for team management

// Function to load teams from the server
function loadTeams() {
  socket.emit('fetchTeams');
}

// Function to render teams list
function renderTeamsList() {
  teamsList.innerHTML = '';
  
  if (teamsData.length === 0) {
    teamsList.innerHTML = '<div class="no-teams-message">No teams available. Add a team to get started.</div>';
    return;
  }
  
  teamsData.forEach(team => {
    const teamItem = document.createElement('div');
    teamItem.className = 'team-item';
    
    // Use a default SVG logo if logo_url is missing
    const logoSrc = team.logo_url || '../assets/default-logo.svg';
    
    teamItem.innerHTML = `
      <img src="${logoSrc}" alt="${team.name}" class="team-item-logo" onerror="this.src='../assets/default-logo.svg'">
      <div class="team-item-info">
        <div class="team-item-name">${team.name}</div>
        <div class="team-item-display">Display: ${team.display_name}</div>
        ${team.abbreviation ? `<div class="team-item-abbr">Abbreviation: ${team.abbreviation}</div>` : ''}
      </div>
      <div class="team-item-actions">
        <button class="btn team-item-edit" data-id="${team.id}">Edit</button>
        <button class="btn team-item-delete" data-id="${team.id}">Delete</button>
      </div>
    `;
    teamsList.appendChild(teamItem);
  });
  
  // Add event listeners to edit and delete buttons
  document.querySelectorAll('.team-item-edit').forEach(button => {
    button.addEventListener('click', () => {
      const teamId = button.getAttribute('data-id');
      editTeam(teamId);
    });
  });
  
  document.querySelectorAll('.team-item-delete').forEach(button => {
    button.addEventListener('click', () => {
      const teamId = button.getAttribute('data-id');
      deleteTeam(teamId);
    });
  });
  
  // Also update the team presets with the latest data
  updateTeamPresets();
}

// Function to update team presets
function updateTeamPresets() {
  // Clear existing presets
  const team1Presets = document.querySelector('.team1-control .team-presets');
  const team2Presets = document.querySelector('.team2-control .team-presets');
  
  team1Presets.innerHTML = '';
  team2Presets.innerHTML = '';
  
  // Add new presets based on teams data
  teamsData.forEach(team => {
    const team1Button = document.createElement('button');
    team1Button.className = 'btn preset-btn';
    team1Button.setAttribute('data-team', 'team1');
    team1Button.setAttribute('data-name', team.name);
    team1Button.setAttribute('data-logo', team.logo_url || ''); // Empty string if no logo
    team1Button.setAttribute('data-abbreviation', team.abbreviation || ''); // Add abbreviation
    team1Button.textContent = team.display_name;
    
    const team2Button = document.createElement('button');
    team2Button.className = 'btn preset-btn';
    team2Button.setAttribute('data-team', 'team2');
    team2Button.setAttribute('data-name', team.name);
    team2Button.setAttribute('data-logo', team.logo_url || ''); // Empty string if no logo
    team2Button.setAttribute('data-abbreviation', team.abbreviation || ''); // Add abbreviation
    team2Button.textContent = team.display_name;
    
    team1Presets.appendChild(team1Button);
    team2Presets.appendChild(team2Button);
  });
  
  // Add event listeners to new preset buttons
  document.querySelectorAll('.preset-btn').forEach(button => {
    button.addEventListener('click', () => {
      const team = button.dataset.team;
      const name = button.dataset.name;
      const logo = button.dataset.logo;
      const abbreviation = button.dataset.abbreviation;
      
      if (team === 'team1') {
        team1NameInput.value = name;
        team1LogoInput.value = logo;
        socket.emit('updateTeam', { 
          team: team, 
          data: { 
            name: name, 
            logo: logo,
            abbreviation: abbreviation 
          } 
        });
      } else if (team === 'team2') {
        team2NameInput.value = name;
        team2LogoInput.value = logo;
        socket.emit('updateTeam', { 
          team: team, 
          data: { 
            name: name, 
            logo: logo,
            abbreviation: abbreviation 
          } 
        });
      }
    });
  });
}

// Function to reset the form for adding a new team
function resetTeamForm() {
  teamFormTitle.textContent = 'Add New Team';
  teamIdInput.value = '';
  teamNameInput.value = '';
  teamDisplayNameInput.value = '';
  teamAbbreviationInput.value = '';
  teamLogoUrlInput.value = '';
  teamLogoFileInput.value = '';
  saveTeamBtn.textContent = 'Save Team';
}

// Function to edit a team
function editTeam(teamId) {
  const team = teamsData.find(t => t.id === parseInt(teamId));
  if (!team) return;
  
  teamFormTitle.textContent = 'Edit Team';
  teamIdInput.value = team.id;
  teamNameInput.value = team.name;
  teamDisplayNameInput.value = team.display_name;
  teamAbbreviationInput.value = team.abbreviation || '';
  teamLogoUrlInput.value = team.logo_url || '';
  saveTeamBtn.textContent = 'Update Team';
  
  // Scroll to the form
  teamForm.scrollIntoView({ behavior: 'smooth' });
}

// Function to delete a team
function deleteTeam(teamId) {
  if (confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
    socket.emit('deleteTeam', parseInt(teamId));
  }
}

// Add these Socket.IO event listeners for team management
socket.on('teamsData', (result) => {
  if (result.success) {
    teamsData = result.data;
    renderTeamsList();
    
    // Always update team presets when we get new teams data
    updateTeamPresets();
    
    // Make sure the panel is visible by default
    if (teamManagementPanel.style.display !== 'flex') {
      teamManagementPanel.style.display = 'flex';
      toggleTeamMgmtBtn.textContent = 'Hide Team Management';
    }
  } else {
    console.error('Failed to load teams:', (result.error ? result.error.message : 'Unknown error'));
  }
});

socket.on('teamAdded', (team) => {
  teamsData.push(team);
  renderTeamsList();
  resetTeamForm();
  
  // Always update team presets when a team is added
  updateTeamPresets();
});

socket.on('teamUpdated', (updatedTeam) => {
  const index = teamsData.findIndex(t => t.id === updatedTeam.id);
  if (index !== -1) {
    teamsData[index] = updatedTeam;
    renderTeamsList();
    resetTeamForm();
    
    // Always update team presets when a team is updated
    updateTeamPresets();
  }
});

socket.on('teamDeleted', (id) => {
  teamsData = teamsData.filter(t => t.id !== parseInt(id));
  renderTeamsList();
  
  // Always update team presets when a team is deleted
  updateTeamPresets();
});

socket.on('teamAddResult', (result) => {
  console.log('Received teamAddResult:', result);
  saveTeamBtn.textContent = 'Save Team';
  saveTeamBtn.disabled = false;
  
  if (!result.success) {
    alert('Failed to add team: ' + (result.error ? JSON.stringify(result.error) : 'Unknown error'));
  } else {
    alert('Team added successfully!');
  }
});

socket.on('teamUpdateResult', (result) => {
  if (!result.success) {
    alert('Failed to update team: ' + (result.error ? result.error.message : 'Unknown error'));
  }
});

socket.on('teamDeleteResult', (result) => {
  if (!result.success) {
    alert('Failed to delete team: ' + (result.error ? result.error.message : 'Unknown error'));
  }
});

// Add these event listeners
// Team logo file input handler
teamLogoFileInput.addEventListener('change', function() {
  if (this.files && this.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      teamLogoUrlInput.value = e.target.result;
    };
    reader.readAsDataURL(this.files[0]);
  }
});

// Toggle team management panel
toggleTeamMgmtBtn.addEventListener('click', () => {
  const isVisible = teamManagementPanel.style.display !== 'none';
  teamManagementPanel.style.display = isVisible ? 'none' : 'flex';
  toggleTeamMgmtBtn.textContent = isVisible ? 'Show Team Management' : 'Hide Team Management';
  
  // If we're showing the panel, force a reload immediately
  if (!isVisible) {
    loadTeams();
  }
});

teamForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const teamData = {
    name: teamNameInput.value,
    display_name: teamDisplayNameInput.value,
    abbreviation: teamAbbreviationInput.value || null, // Set to null if empty
    logo_url: teamLogoUrlInput.value || null  // Set to null if empty
  };
  
  console.log('Submitting team form with data:', teamData);
  
  const teamId = teamIdInput.value;
  
  if (teamId) {
    // Update existing team
    console.log('Updating existing team with ID:', teamId);
    socket.emit('updateTeam', { id: parseInt(teamId), teamData });
  } else {
    // Add new team
    console.log('Adding new team');
    socket.emit('addTeam', teamData);
  }
  
  // Show processing indicator
  saveTeamBtn.textContent = 'Processing...';
  saveTeamBtn.disabled = true;
});

cancelTeamBtn.addEventListener('click', () => {
  resetTeamForm();
});

// Add socket event handlers for game configuration
socket.on('gameConfigUpdate', (config) => {
  // Update local game configuration
  gameState.config = config;
  
  // Update UI form inputs
  defaultPeriodMinutesInput.value = config.periodMinutes;
  defaultTotalPeriodsInput.value = config.totalPeriods;
  defaultShootoutMinutesInput.value = config.shootoutMinutes;
  
  // If resetTimerBtn is clicked, it will now use these new values
  console.log("Game configuration updated:", config);
});

socket.on('gameConfigSaved', (response) => {
  if (response.success) {
    // Show a temporary notification
    const savedNote = document.createElement('div');
    savedNote.className = 'save-notification success';
    savedNote.textContent = 'Game configuration saved!';
    saveGameConfigBtn.parentNode.appendChild(savedNote);
    
    // Remove notification after 3 seconds
    setTimeout(() => {
      savedNote.remove();
    }, 3000);
  }
});

// Game Configuration Save Button
saveGameConfigBtn.addEventListener('click', () => {
  // Get values from inputs
  const periodMinutes = parseInt(defaultPeriodMinutesInput.value) || 15;
  const totalPeriods = parseInt(defaultTotalPeriodsInput.value) || 3;
  const shootoutMinutes = parseInt(defaultShootoutMinutesInput.value) || 5;
  
  // Create configuration object
  const config = {
    periodMinutes: periodMinutes,
    totalPeriods: totalPeriods,
    shootoutMinutes: shootoutMinutes
  };
  
  // Update local gameState with the new config
  gameState.config = config;
  
  // If it's not a shootout period, update the timer input immediately to reflect the new default
  if (gameState.period !== 5) {
    // Set the timer inputs based on the current period time
    timeMinutesInput.value = periodMinutes;
    timeSecondsInput.value = 0;
    
    // Also update the actual timer if requested
    if (confirm("Apply new period minutes to current timer?")) {
      const newTimeInSeconds = periodMinutes * 60;
      socket.emit('setTime', newTimeInSeconds);
      timerDisplay.textContent = formatTime(newTimeInSeconds);
    }
  } else {
    // If currently in shootout period, ask to update with shootout minutes
    if (confirm("Apply new shootout minutes to current timer?")) {
      const newTimeInSeconds = shootoutMinutes * 60;
      socket.emit('setTime', newTimeInSeconds);
      timerDisplay.textContent = formatTime(newTimeInSeconds);
      timeMinutesInput.value = shootoutMinutes;
      timeSecondsInput.value = 0;
    }
  }
  
  // Send the updated configuration to the server
  socket.emit('updateGameConfig', config);
  
  // Provide immediate feedback
  const savedNote = document.createElement('div');
  savedNote.className = 'save-notification success';
  savedNote.textContent = 'Game configuration saved and applied!';
  saveGameConfigBtn.parentNode.appendChild(savedNote);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    savedNote.remove();
  }, 3000);
});

// Add this variable to track the team reload interval
let teamReloadInterval;

// Autoload teams when the page loads
document.addEventListener('DOMContentLoaded', () => {
  // Load teams data immediately
  loadTeams();
  
  // Show team management panel by default
  setTimeout(() => {
    teamManagementPanel.style.display = 'flex';
    toggleTeamMgmtBtn.textContent = 'Hide Team Management';
  }, 500); // Slight delay to ensure socket connection is established
  
  // Set up auto-reload for teams every 10 seconds
  teamReloadInterval = setInterval(() => {
    // Only reload if the team management panel is visible
    if (teamManagementPanel.style.display === 'flex') {
      console.log('Auto-reloading teams data');
      loadTeams();
    }
  }, 10000); // 10 seconds interval
});

// Add socket event listener for penalty updates
socket.on('penaltyUpdate', (data) => {
  console.log('Penalty update received:', data);
  const team = data.team;
  const active = data.active;
  const time = data.time || 0;
  
  // Update local penalty state
  if (team === 'team1') {
    team1PenaltyActive = active;
    team1PenaltyTimeRemaining = time;
    team1PenaltyEnabled.checked = active;
    updatePenaltyDisplay(1);
  } else if (team === 'team2') {
    team2PenaltyActive = active;
    team2PenaltyTimeRemaining = time;
    team2PenaltyEnabled.checked = active;
    updatePenaltyDisplay(2);
  }
});

// Event listeners for penalty controls
team1PenaltySet.addEventListener('click', () => setPenalty(1));
team1PenaltyClear.addEventListener('click', () => clearPenalty(1));
team2PenaltySet.addEventListener('click', () => setPenalty(2));
team2PenaltyClear.addEventListener('click', () => clearPenalty(2));
team1PenaltyEnabled.addEventListener('change', () => togglePenalty(1));
team2PenaltyEnabled.addEventListener('change', () => togglePenalty(2));

// Penalty timer toggle buttons - initialize and set up event listeners
const team1PenaltyToggleBtn = document.getElementById('team1-penalty-toggle-btn');
const team2PenaltyToggleBtn = document.getElementById('team2-penalty-toggle-btn');
const team1PenaltyControl = document.querySelector('.team1-control .penalty-control');
const team2PenaltyControl = document.querySelector('.team2-control .penalty-control');

// Event listeners for penalty toggle buttons
team1PenaltyToggleBtn.addEventListener('click', () => {
  const isVisible = team1PenaltyControl.style.display === 'block';
  team1PenaltyControl.style.display = isVisible ? 'none' : 'block';
  team1PenaltyToggleBtn.textContent = isVisible ? 'Show Penalty Timer' : 'Hide Penalty Timer';
  team1PenaltyToggleBtn.classList.toggle('active', !isVisible);
});

team2PenaltyToggleBtn.addEventListener('click', () => {
  const isVisible = team2PenaltyControl.style.display === 'block';
  team2PenaltyControl.style.display = isVisible ? 'none' : 'block';
  team2PenaltyToggleBtn.textContent = isVisible ? 'Show Penalty Timer' : 'Hide Penalty Timer';
  team2PenaltyToggleBtn.classList.toggle('active', !isVisible);
});

// Goal horn settings
let goalHornSettings = {
  enabled: false,
  volume: 80,
  team1Enabled: false,
  team2Enabled: false,
  customSound: null
};

// Goal Horn Event Listeners
team1GoalHornEnabled.addEventListener('change', () => {
  goalHornSettings.team1Enabled = team1GoalHornEnabled.checked;
  socket.emit('updateGoalHornSettings', { team1Enabled: team1GoalHornEnabled.checked });
});

team2GoalHornEnabled.addEventListener('change', () => {
  goalHornSettings.team2Enabled = team2GoalHornEnabled.checked;
  socket.emit('updateGoalHornSettings', { team2Enabled: team2GoalHornEnabled.checked });
});

goalHornMasterEnabled.addEventListener('change', () => {
  goalHornSettings.enabled = goalHornMasterEnabled.checked;
  socket.emit('updateGoalHornSettings', { enabled: goalHornMasterEnabled.checked });
});

goalHornVolume.addEventListener('input', () => {
  goalHornSettings.volume = goalHornVolume.value;
  volumeValue.textContent = `${goalHornVolume.value}%`;
  socket.emit('updateGoalHornSettings', { volume: goalHornVolume.value });
});

// Test goal horn buttons
team1TestHorn.addEventListener('click', () => {
  if (goalHornSettings.enabled && goalHornSettings.team1Enabled) {
    socket.emit('playGoalHorn', { 
      team: 'team1', 
      volume: goalHornSettings.volume,
      customSound: goalHornSettings.customSound,
      isTest: true
    });
  }
});

team2TestHorn.addEventListener('click', () => {
  if (goalHornSettings.enabled && goalHornSettings.team2Enabled) {
    socket.emit('playGoalHorn', { 
      team: 'team2', 
      volume: goalHornSettings.volume,
      customSound: goalHornSettings.customSound,
      isTest: true
    });
  }
});

// Custom goal horn file upload
goalHornFile.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(event) {
      const soundDataUrl = event.target.result;
      goalHornSettings.customSound = soundDataUrl;
      socket.emit('updateGoalHornSettings', { customSound: soundDataUrl });
    };
    reader.readAsDataURL(file);
  }
});

// Update goal horn settings from server
socket.on('goalHornSettings', (settings) => {
  // Update local settings
  goalHornSettings = {
    ...goalHornSettings,
    ...settings
  };
  
  // Update UI controls
  goalHornMasterEnabled.checked = settings.enabled !== undefined ? settings.enabled : goalHornSettings.enabled;
  team1GoalHornEnabled.checked = settings.team1Enabled !== undefined ? settings.team1Enabled : goalHornSettings.team1Enabled;
  team2GoalHornEnabled.checked = settings.team2Enabled !== undefined ? settings.team2Enabled : goalHornSettings.team2Enabled;
  
  if (settings.volume !== undefined) {
    goalHornVolume.value = settings.volume;
    volumeValue.textContent = `${settings.volume}%`;
  }
});

// Initialize penalty toggle buttons 
document.addEventListener('DOMContentLoaded', () => {
  const team1PenaltyToggleBtn = document.getElementById('team1-penalty-toggle-btn');
  const team2PenaltyToggleBtn = document.getElementById('team2-penalty-toggle-btn');
  const team1PenaltyControl = document.querySelector('.team1-control .penalty-control');
  const team2PenaltyControl = document.querySelector('.team2-control .penalty-control');

  if (team1PenaltyToggleBtn && team1PenaltyControl) {
    team1PenaltyToggleBtn.addEventListener('click', () => {
      const isVisible = team1PenaltyControl.style.display === 'block';
      team1PenaltyControl.style.display = isVisible ? 'none' : 'block';
      team1PenaltyToggleBtn.textContent = isVisible ? 'Show Penalty Timer' : 'Hide Penalty Timer';
      team1PenaltyToggleBtn.classList.toggle('active', !isVisible);
    });
  }

  if (team2PenaltyToggleBtn && team2PenaltyControl) {
    team2PenaltyToggleBtn.addEventListener('click', () => {
      const isVisible = team2PenaltyControl.style.display === 'block';
      team2PenaltyControl.style.display = isVisible ? 'none' : 'block';
      team2PenaltyToggleBtn.textContent = isVisible ? 'Show Penalty Timer' : 'Hide Penalty Timer';
      team2PenaltyToggleBtn.classList.toggle('active', !isVisible);
    });
  }
});

// Period toggle
const togglePeriodBtn = document.getElementById('toggle-period');

// Add these missing helper functions
function setTimerDisplay() {
  timerDisplay.textContent = formatTime(gameState.timer.time);
}

function updateScoreDisplay() {
  team1ScoreDisplay.textContent = gameState.teams.team1.score || 0;
  team2ScoreDisplay.textContent = gameState.teams.team2.score || 0;
  
  // Also update local score tracking variables
  team1Score = parseInt(gameState.teams.team1.score) || 0;
  team2Score = parseInt(gameState.teams.team2.score) || 0;
}

function updatePeriodDisplay() {
  periodDisplay.textContent = gameState.period;
}

function updatePenaltyDisplay(teamNum) {
  if (teamNum === 1) {
    team1PenaltyTime.textContent = formatTime(team1PenaltyTimeRemaining);
  } else if (teamNum === 2) {
    team2PenaltyTime.textContent = formatTime(team2PenaltyTimeRemaining);
  }
}

function setPenalty(teamNum) {
  const minutes = teamNum === 1 ? parseInt(team1PenaltyMins.value) || 0 : parseInt(team2PenaltyMins.value) || 0;
  const seconds = teamNum === 1 ? parseInt(team1PenaltySecs.value) || 0 : parseInt(team2PenaltySecs.value) || 0;
  const totalSeconds = (minutes * 60) + seconds;
  
  if (totalSeconds > 0) {
    socket.emit('setPenalty', { 
      team: `team${teamNum}`, 
      active: true,
      time: totalSeconds
    });
  }
}

function clearPenalty(teamNum) {
  socket.emit('setPenalty', { 
    team: `team${teamNum}`, 
    active: false,
    time: 0
  });
}

function togglePenalty(teamNum) {
  const isEnabled = teamNum === 1 ? team1PenaltyEnabled.checked : team2PenaltyEnabled.checked;
  
  if (isEnabled) {
    // Enable penalty
    setPenalty(teamNum);
  } else {
    // Disable penalty
    clearPenalty(teamNum);
  }
}

function updateTeamLogos() {
  // If this function is referenced but not defined, add a simple implementation
  // This is just a placeholder if it's not defined elsewhere
  if (team1LogoInput.value) {
    // If we had a team logo element, we would update it here
    console.log('Updated team1 logo: ' + team1LogoInput.value);
  }
  if (team2LogoInput.value) {
    // If we had a team logo element, we would update it here
    console.log('Updated team2 logo: ' + team2LogoInput.value);
  }
} 