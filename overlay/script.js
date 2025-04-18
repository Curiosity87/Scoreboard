// Connect to the server
const socket = io();

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
let goalHornVolume = 0.8; // Default volume is 80%

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
function updateScoreWithAnimation(element, score) {
  element.classList.add('score-changed');
  element.textContent = score;
  
  setTimeout(() => {
    element.classList.remove('score-changed');
  }, 500);
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

socket.on('scoreUpdate', (teams) => {
  updateScoreWithAnimation(team1Score, teams.team1.score);
  updateScoreWithAnimation(team2Score, teams.team2.score);
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