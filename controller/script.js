// Connect to the server
const socket = io();

// DOM Elements - Connection
const connectionIndicator = document.getElementById('connection-indicator');
const connectionText = document.getElementById('connection-text');

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

// DOM Elements - Game History
const loadHistoryBtn = document.getElementById('load-history');
const historyTableBody = document.getElementById('history-table-body');
const noHistoryMessage = document.getElementById('no-history-message');

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
  }
};

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

// Socket event handlers
socket.on('connect', () => {
  connectionIndicator.classList.remove('disconnected');
  connectionIndicator.classList.add('connected');
  connectionText.textContent = 'Connected';
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
  
  if (gameState.timer.isRunning) {
    startTimerBtn.textContent = 'Stop';
    startTimerBtn.classList.remove('start');
    startTimerBtn.classList.add('stop');
  } else {
    startTimerBtn.textContent = 'Start';
    startTimerBtn.classList.remove('stop');
    startTimerBtn.classList.add('start');
  }
  
  setTimerDisplay();
  updateScoreDisplay();
  updatePeriodDisplay();
  updateGameInfoDisplay();
  
  // Automatically load game history on connection
  loadGameHistory();
});

socket.on('disconnect', () => {
  connectionIndicator.classList.remove('connected');
  connectionText.textContent = 'Disconnected';
  console.log('Disconnected from server');
});

socket.on('gameState', (state) => {
  // Update local state
  gameState = state;
  
  // Update UI with current game state
  timerDisplay.textContent = formatTime(state.timer.time);
  team1NameInput.value = state.teams.team1.name;
  team1ScoreDisplay.textContent = state.teams.team1.score;
  team1LogoInput.value = state.teams.team1.logo;
  
  team2NameInput.value = state.teams.team2.name;
  team2ScoreDisplay.textContent = state.teams.team2.score;
  team2LogoInput.value = state.teams.team2.logo;
  
  periodDisplay.textContent = state.period;
  
  // Update time inputs
  timeMinutesInput.value = Math.floor(state.timer.time / 60);
  timeSecondsInput.value = state.timer.time % 60;
  
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
});

socket.on('timeUpdate', (time) => {
  timerDisplay.textContent = formatTime(time);
  gameState.timer.time = time;
});

socket.on('timerStarted', () => {
  gameState.timer.isRunning = true;
  startTimerBtn.textContent = 'Stop';
  startTimerBtn.classList.remove('start');
  startTimerBtn.classList.add('stop');
});

socket.on('timerStopped', () => {
  gameState.timer.isRunning = false;
  startTimerBtn.textContent = 'Start';
  startTimerBtn.classList.remove('stop');
  startTimerBtn.classList.add('start');
});

socket.on('scoreUpdate', (teams) => {
  team1ScoreDisplay.textContent = teams.team1.score;
  team2ScoreDisplay.textContent = teams.team2.score;
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
  
  // Reset the timer to 15 minutes
  const seconds = 900;
  socket.emit('setTime', seconds);
  
  // Update local time inputs
  timeMinutesInput.value = 15;
  timeSecondsInput.value = 0;
  
  // Increment the period
  const newPeriod = gameState.period + 1;
  
  // If going beyond period 3, go straight to shootout (period 5)
  if (newPeriod === 4) {
    socket.emit('updatePeriod', 5); // Set to shootout
    
    // Reset timer for shootout to 5 minutes
    socket.emit('setTime', 300); // 5 minutes for shootout
    timeMinutesInput.value = 5;
    timeSecondsInput.value = 0;
  } else {
    socket.emit('updatePeriod', newPeriod);
  }
  
  // Update button text to show current period
  updateNextPeriodButtonText(newPeriod === 4 ? 5 : newPeriod);
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
});

setPeriod2Btn.addEventListener('click', () => {
  socket.emit('updatePeriod', 2);
});

setPeriod3Btn.addEventListener('click', () => {
  socket.emit('updatePeriod', 3);
});

setPeriodSOBtn.addEventListener('click', () => {
  socket.emit('updatePeriod', 5); // SO is period 5
  
  // Set timer to 5 minutes for shootout
  socket.emit('setTime', 300);
  timeMinutesInput.value = 5;
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
        socket.emit('updateScore', { team: 'team1', score: 0 });
        socket.emit('updateScore', { team: 'team2', score: 0 });
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
    startTimerBtn.textContent = 'Stop';
    startTimerBtn.classList.remove('start');
    startTimerBtn.classList.add('stop');
  } else {
    socket.emit('stopTimer');
    gameState.timer.isRunning = false;
    startTimerBtn.textContent = 'Start';
    startTimerBtn.classList.remove('stop');
    startTimerBtn.classList.add('start');
  }
});

stopTimerBtn.addEventListener('click', () => {
  socket.emit('stopTimer');
  gameState.timer.isRunning = false;
  startTimerBtn.textContent = 'Start';
  startTimerBtn.classList.remove('stop');
  startTimerBtn.classList.add('start');
});

resetTimerBtn.addEventListener('click', () => {
  // Reset to 15 minutes
  const seconds = 900;
  socket.emit('setTime', seconds);
  
  // Update local time inputs
  timeMinutesInput.value = 15;
  timeSecondsInput.value = 0;
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
  socket.emit('updateTeam', { team: 'team1', data: { name: newName } });
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
  const newScore = gameState.teams.team1.score + 1;
  socket.emit('updateScore', { team: 'team1', score: newScore });
});

team1ScoreMinusBtn.addEventListener('click', () => {
  const newScore = Math.max(0, gameState.teams.team1.score - 1);
  socket.emit('updateScore', { team: 'team1', score: newScore });
});

updateTeam2NameBtn.addEventListener('click', () => {
  const newName = team2NameInput.value;
  socket.emit('updateTeam', { team: 'team2', data: { name: newName } });
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
  const newScore = gameState.teams.team2.score + 1;
  socket.emit('updateScore', { team: 'team2', score: newScore });
});

team2ScoreMinusBtn.addEventListener('click', () => {
  const newScore = Math.max(0, gameState.teams.team2.score - 1);
  socket.emit('updateScore', { team: 'team2', score: newScore });
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
      // Toggle timer - if running, stop it; if stopped, start it
      if (gameState.timer.isRunning) {
        stopTimerBtn.click();
        showKeyboardFeedback('Timer Stopped');
      } else {
        startTimerBtn.click();
        showKeyboardFeedback('Timer Started');
      }
      break;
      
    case 'ArrowUp': // Up arrow - increase home team score
      e.preventDefault();
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