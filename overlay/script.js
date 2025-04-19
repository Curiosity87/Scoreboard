// Connect to the server with reconnection options
const socket = io({
  reconnection: true,
  reconnectionAttempts: Infinity,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000
});

// Add reconnection event handlers
socket.on('reconnect', (attemptNumber) => {
  console.log(`Reconnected to server after ${attemptNumber} attempts`);
  // Request current game state after reconnection
  socket.emit('requestGameState');
});

socket.on('reconnect_attempt', (attemptNumber) => {
  console.log(`Reconnection attempt ${attemptNumber}`);
});

socket.on('reconnect_error', (error) => {
  console.error('Reconnection error:', error);
});

socket.on('reconnect_failed', () => {
  console.error('Failed to reconnect to server');
});

// DOM Elements
const team1Name = document.getElementById('team1-name');
const team1Score = document.getElementById('team1-score');
const team1Logo = document.getElementById('team1-logo');
const team2Name = document.getElementById('team2-name');
const team2Score = document.getElementById('team2-score');
const team2Logo = document.getElementById('team2-logo');
const timerElement = document.getElementById('timer');
const periodElement = document.getElementById('period');
const team1Penalty = document.getElementById('team1-penalty');
const team2Penalty = document.getElementById('team2-penalty');
const goalHornAudio = document.getElementById('goal-horn-audio');

// Set default goal horn
goalHornAudio.src = '../assets/sounds/goal_horn.mp3';
let customGoalHornDataUrl = null;
let goalHornVolume = 0.0; // Default volume is 0% (disabled)

// Make sure audio can autoplay
goalHornAudio.preload = 'auto';
// Add this to enable autoplay without user interaction
document.addEventListener('DOMContentLoaded', () => {
  // Create a user interaction context by clicking the document
  document.body.addEventListener('click', () => {
    // Try to play and immediately pause to enable audio
    goalHornAudio.play().then(() => {
      goalHornAudio.pause();
      goalHornAudio.currentTime = 0;
      console.log('Audio context activated');
    }).catch(err => {
      console.log('Audio couldn\'t be activated:', err);
    });
  }, { once: true });
});

// Team name mapping for display
const teamDisplayNames = {
  'ASOKE ANTEATERS': 'Anteaters',
  'BKK BAEBLADEZ': 'Bladez',
  'RATTANAKORN RAIDERS': 'Raiders'
};

// Get display name for a team
function getTeamDisplayName(fullName, teamsData = []) {
  console.log('Getting display name for:', fullName);
  console.log('Available teams data:', teamsData);
  
  // First check if we have the team in teamsData using case-insensitive comparison
  const teamData = teamsData.find(t => 
    t.name.toUpperCase() === fullName.toUpperCase() ||
    (fullName.includes(t.name) || t.name.includes(fullName))
  );
  console.log('Found team data:', teamData);
  
  if (teamData) {
    // If display name is too long and abbreviation exists, use abbreviation
    if (teamData.display_name.length > 15 && teamData.abbreviation) {
      console.log('Using abbreviation:', teamData.abbreviation);
      return teamData.abbreviation;
    }
    console.log('Using display name:', teamData.display_name);
    return teamData.display_name;
  }
  
  // Fall back to the predefined mapping
  if (teamDisplayNames[fullName]) {
    console.log('Using predefined display name:', teamDisplayNames[fullName]);
    return teamDisplayNames[fullName];
  }
  
  // If no mapping exists, just return the full name
  console.log('No mapping found, using full name:', fullName);
  return fullName;
}

// Format time from seconds to MM:SS
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Update score with animation
const updateScoreWithAnimation = (element, newScore) => {
  const currentScore = parseInt(element.textContent);
  if (currentScore !== newScore) {
    // Update the text content first to preserve position
    element.textContent = newScore;
    
    // Add the flash animation class
    element.classList.add('score-changed');
    
    // Add flash effect to the entire scoreboard when score changes
    if (newScore > currentScore) {
      const scoreboardEl = document.querySelector('.scoreboard');
      scoreboardEl.classList.add('goal-scored');
      
      // Play goal horn automatically when a goal is scored
      playGoalHorn();
      
      // Remove the classes after the animation completes
      setTimeout(() => {
        scoreboardEl.classList.remove('goal-scored');
      }, 1500);
    }
    
    // Remove the animation class after it completes
    setTimeout(() => {
      element.classList.remove('score-changed');
    }, 800);
  }
};

// Function to play the goal horn
function playGoalHorn() {
  if (goalHornVolume <= 0) {
    console.log('Goal horn not played: volume is 0 or disabled');
    return;
  }
  
  // Ensure we have a sound source
  if (!goalHornAudio.src || goalHornAudio.src === '') {
    console.log('No goal horn source, setting default');
    goalHornAudio.src = '../assets/sounds/goal_horn.mp3';
  }
  
  // Set volume and play
  goalHornAudio.volume = goalHornVolume;
  goalHornAudio.currentTime = 0; // Reset to beginning
  
  // Create a promise to play the sound
  const playPromise = goalHornAudio.play();
  
  // Handle play errors
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('Goal horn playing successfully');
    }).catch(error => {
      console.error('Error playing goal horn:', error);
      
      // Try again with user interaction simulation
      document.body.click();
      setTimeout(() => {
        goalHornAudio.play().catch(e => console.error('Second attempt failed:', e));
      }, 100);
    });
  }
}

// Format period display
function formatPeriod(period) {
  switch(period) {
    case 1: return '1st';
    case 2: return '2nd';
    case 3: return '3rd';
    case 4: return 'OT';
    case 5: return 'SO';
    default: return `${period}th`;
  }
}

// Update penalty display
function updatePenaltyDisplay(team, time, active, visible) {
  const penaltyElement = team === 'team1' ? team1Penalty : team2Penalty;
  const penaltyTimeElement = penaltyElement.querySelector('.penalty-time');
  
  // Set the time value
  penaltyTimeElement.textContent = formatTime(time);
  
  // Apply visibility setting
  const shouldShow = visible !== false && active === true;
  
  // Toggle visibility based on active and visible state
  if (shouldShow) {
    penaltyElement.classList.add('active');
  } else {
    penaltyElement.classList.remove('active');
  }
}

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server');
  socket.emit('fetchTeams');
});

socket.on('gameState', (state) => {
  console.log('Game state received:', state);
  
  // Use _teamsInfo if available
  const teamsData = state._teamsInfo || window.teamsData || [];
  
  // Update all elements with the current game state
  const team1DisplayName = getTeamDisplayName(state.teams.team1.name, teamsData);
  const team2DisplayName = getTeamDisplayName(state.teams.team2.name, teamsData);
  
  team1Name.textContent = team1DisplayName;
  team1Score.textContent = state.teams.team1.score;
  if (state.teams.team1.logo) {
    team1Logo.src = state.teams.team1.logo;
  } else {
    team1Logo.src = '../assets/default-logo.svg';
  }
  
  team2Name.textContent = team2DisplayName;
  team2Score.textContent = state.teams.team2.score;
  if (state.teams.team2.logo) {
    team2Logo.src = state.teams.team2.logo;
  } else {
    team2Logo.src = '../assets/default-logo.svg';
  }
  
  timerElement.textContent = formatTime(state.timer.time);
  periodElement.textContent = formatPeriod(state.period);
  
  // Initialize penalty displays with visibility
  if (state.teams.team1.penalty) {
    updatePenaltyDisplay(
      'team1', 
      state.teams.team1.penalty.time, 
      state.teams.team1.penalty.active,
      state.teams.team1.penalty.visible
    );
  }
  
  if (state.teams.team2.penalty) {
    updatePenaltyDisplay(
      'team2', 
      state.teams.team2.penalty.time, 
      state.teams.team2.penalty.active,
      state.teams.team2.penalty.visible
    );
  }
});

socket.on('timeUpdate', (time) => {
  timerElement.textContent = formatTime(time);
});

socket.on('scoreUpdate', (data) => {
  // Extract teams and the team that was updated
  const { teams, updatedTeam } = data;
  
  // Only animate the team that was updated
  if (updatedTeam === 'team1') {
    updateScoreWithAnimation(team1Score, teams.team1.score);
    // Update team2 score without animation
    team2Score.textContent = teams.team2.score;
  } else if (updatedTeam === 'team2') {
    updateScoreWithAnimation(team2Score, teams.team2.score);
    // Update team1 score without animation
    team1Score.textContent = teams.team1.score;
  } else {
    // Fallback to updating both if no specific team is provided
    // This helps maintain backward compatibility
    updateScoreWithAnimation(team1Score, teams.team1.score);
    updateScoreWithAnimation(team2Score, teams.team2.score);
  }
});

socket.on('teamUpdate', (teams) => {
  console.log('Team update received:', teams);
  
  // Use _teamsInfo if available for better name matching
  const teamsData = teams._teamsInfo || window.teamsData || [];
  
  // Find the team in our teamsData or use fallback display name
  let team1DisplayName = getTeamDisplayName(teams.team1.name, teamsData);
  let team2DisplayName = getTeamDisplayName(teams.team2.name, teamsData);
  
  team1Name.textContent = team1DisplayName;
  team2Name.textContent = team2DisplayName;
  
  // Set logo with fallback to placeholder if not provided
  if (teams.team1.logo) {
    team1Logo.src = teams.team1.logo;
  } else {
    team1Logo.src = '../assets/default-logo.svg';
  }
  
  if (teams.team2.logo) {
    team2Logo.src = teams.team2.logo;
  } else {
    team2Logo.src = '../assets/default-logo.svg';
  }
});

socket.on('periodUpdate', (period) => {
  periodElement.textContent = formatPeriod(period);
});

socket.on('penaltyUpdate', (data) => {
  console.log('Penalty update received:', data);
  
  // Ensure we have all required data
  if (!data || !data.team) {
    console.error('Invalid penalty data received:', data);
    return;
  }
  
  // Default values if not provided
  const time = data.time || 0;
  const active = data.active === true;
  const visible = data.visible !== false;
  
  // Update the penalty display
  updatePenaltyDisplay(data.team, time, active, visible);
});

// Listen for penalty visibility updates
socket.on('penaltyVisibilityUpdate', (data) => {
  console.log('Penalty visibility update received:', data);
  
  if (!data || !data.team) {
    console.error('Invalid penalty visibility data received:', data);
    return;
  }
  
  const team = data.team;
  const visible = data.visible;
  
  // Get current penalty state from DOM
  const penaltyElement = team === 'team1' ? team1Penalty : team2Penalty;
  const isActive = penaltyElement.classList.contains('active');
  const timeElement = penaltyElement.querySelector('.penalty-time');
  const timeText = timeElement ? timeElement.textContent : '00:00';
  
  // Convert time display back to seconds
  const timeParts = timeText.split(':');
  const minutes = parseInt(timeParts[0]) || 0;
  const seconds = parseInt(timeParts[1]) || 0;
  const time = (minutes * 60) + seconds;
  
  // Update the display
  updatePenaltyDisplay(team, time, isActive, visible);
});

socket.on('teamsData', (result) => {
  console.log('Received teams data:', result);
  if (result.success) {
    window.teamsData = result.data;
    console.log('Teams data stored:', window.teamsData);
  } else {
    console.error('Failed to load teams data:', result.error);
  }
});

// Handle goal horn play requests
socket.on('playGoalHorn', (data) => {
  console.log('Goal horn request received:', data);
  
  // If goal horn is disabled or the volume is 0, don't play
  if (data.volume <= 0) {
    console.log('Goal horn not played: volume is 0 or disabled');
    return;
  }
  
  // Set the volume (convert percentage to 0-1 scale)
  goalHornVolume = data.volume / 100;
  goalHornAudio.volume = goalHornVolume;
  
  // If there's a custom sound, use it
  if (data.customSound && data.customSound !== customGoalHornDataUrl) {
    try {
      customGoalHornDataUrl = data.customSound;
      goalHornAudio.src = customGoalHornDataUrl;
      console.log('Custom goal horn sound set');
    } catch (error) {
      console.error('Error setting custom goal horn:', error);
      // Reset to default if custom sound fails
      goalHornAudio.src = '../assets/sounds/goal_horn.mp3';
    }
  }
  
  // Ensure we have a sound source
  if (!goalHornAudio.src || goalHornAudio.src === '') {
    console.log('No goal horn source, setting default');
    goalHornAudio.src = '../assets/sounds/goal_horn.mp3';
  }
  
  // Play the sound with error handling
  goalHornAudio.currentTime = 0; // Reset to beginning
  
  // Create a promise to play the sound
  const playPromise = goalHornAudio.play();
  
  // Handle play errors
  if (playPromise !== undefined) {
    playPromise.then(() => {
      console.log('Goal horn playing successfully');
    }).catch(error => {
      console.error('Error playing goal horn:', error);
      
      // Try again with user interaction simulation
      document.body.click();
      setTimeout(() => {
        goalHornAudio.play().catch(e => console.error('Second attempt failed:', e));
      }, 100);
    });
  }
});

// Update goal horn settings
socket.on('goalHornSettings', (settings) => {
  if (settings.volume !== undefined) {
    goalHornVolume = settings.volume / 100;
  }
  
  if (settings.customSound !== undefined && settings.customSound !== null) {
    customGoalHornDataUrl = settings.customSound;
    goalHornAudio.src = customGoalHornDataUrl;
  }
});

// Add connection monitoring to detect disconnects
let lastPingResponse = Date.now();
let lastStateUpdate = Date.now();
let connectionMonitorInterval;
let consecutiveFailedUpdates = 0;

// Ping the server every 1 seconds to verify connection
function startConnectionMonitor() {
  connectionMonitorInterval = setInterval(() => {
    const now = Date.now();
    
    // Force a refresh if no ping response in 8 seconds
    if (now - lastPingResponse > 8000) {
      console.error('No server response for 8 seconds, refreshing page...');
      window.location.reload();
      return;
    }
    
    // Force a refresh if no state update in 10 seconds
    if (now - lastStateUpdate > 10000) {
      console.error('No state updates for 10 seconds, refreshing page...');
      consecutiveFailedUpdates++;
      
      if (consecutiveFailedUpdates >= 3) {
        window.location.reload();
        return;
      } else {
        // Request a new state update
        socket.emit('requestGameState');
      }
    } else {
      consecutiveFailedUpdates = 0;
    }
    
    // Send a ping if socket is connected
    if (socket.connected) {
      socket.emit('ping');
      
      // Also request game state occasionally
      if (now % 5000 < 1000) {
        socket.emit('requestGameState');
      }
    } else {
      console.warn('Socket disconnected, attempting to reconnect...');
      socket.connect();
      
      // Try to force a reconnection if socket methods fail
      setTimeout(() => {
        if (!socket.connected) {
          console.warn('Socket still disconnected, forcing page refresh');
          window.location.reload();
        }
      }, 2000);
    }
  }, 1000); // Check every second
}

// Listen for online/offline events
window.addEventListener('online', () => {
  console.log('Browser reports network connection is back online');
  socket.connect();
  socket.emit('requestGameState');
  lastStateUpdate = Date.now(); // Reset the timer
});

window.addEventListener('offline', () => {
  console.log('Browser reports network connection is offline');
});

// Add visibility change detection
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    console.log('Page became visible, requesting current state');
    socket.emit('requestGameState');
    lastStateUpdate = Date.now(); // Reset the timer
  }
});

// Start the connection monitor when the page loads
document.addEventListener('DOMContentLoaded', () => {
  startConnectionMonitor();
  
  // Initial request for game state
  socket.emit('requestGameState');
});

// Listen for pong response from server
socket.on('pong', () => {
  lastPingResponse = Date.now();
});

// Update lastStateUpdate whenever we receive a game state update
socket.on('gameState', () => {
  lastStateUpdate = Date.now();
});

socket.on('scoreUpdate', () => {
  lastStateUpdate = Date.now();
});

socket.on('teamUpdate', () => {
  lastStateUpdate = Date.now();
});

socket.on('periodUpdate', () => {
  lastStateUpdate = Date.now();
});

socket.on('timeUpdate', () => {
  lastStateUpdate = Date.now();
});

// Add handler for direct overlay updates
socket.on('overlayUpdate', (update) => {
  console.log('Received overlay update:', update);

  // Get teams data from stored value if available
  const teamsData = window.teamsData || [];

  // Update team names
  const team1DisplayName = getTeamDisplayName(update.teams.team1.name, teamsData);
  const team2DisplayName = getTeamDisplayName(update.teams.team2.name, teamsData);
  
  team1Name.textContent = team1DisplayName;
  team2Name.textContent = team2DisplayName;
  
  // Update scores with animation if they changed
  const current1Score = parseInt(team1Score.textContent);
  const current2Score = parseInt(team2Score.textContent);
  const new1Score = update.teams.team1.score;
  const new2Score = update.teams.team2.score;
  
  if (current1Score !== new1Score) {
    updateScoreWithAnimation(team1Score, new1Score);
  }
  
  if (current2Score !== new2Score) {
    updateScoreWithAnimation(team2Score, new2Score);
  }
  
  // Update logos
  if (update.teams.team1.logo) {
    team1Logo.src = update.teams.team1.logo;
  } else {
    team1Logo.src = '../assets/default-logo.svg';
  }
  
  if (update.teams.team2.logo) {
    team2Logo.src = update.teams.team2.logo;
  } else {
    team2Logo.src = '../assets/default-logo.svg';
  }
  
  // Update timer
  timerElement.textContent = formatTime(update.timer.time);
  
  // Update period
  periodElement.textContent = formatPeriod(update.period);
  
  // Update penalty displays
  if (update.teams.team1.penalty) {
    updatePenaltyDisplay(
      'team1', 
      update.teams.team1.penalty.time, 
      update.teams.team1.penalty.active,
      update.teams.team1.penalty.visible
    );
  }
  
  if (update.teams.team2.penalty) {
    updatePenaltyDisplay(
      'team2', 
      update.teams.team2.penalty.time, 
      update.teams.team2.penalty.active,
      update.teams.team2.penalty.visible
    );
  }
  
  // Update timestamp for connection monitoring
  lastStateUpdate = Date.now();
}); 