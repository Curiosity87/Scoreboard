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

// Team name mapping for display
const teamDisplayNames = {
  'ASOKE ANTEATERS': 'Anteaters',
  'BKK BAEBLADEZ': 'Bladez',
  'RATTANAKORN RAIDERS': 'Raiders'
};

// Get display name for a team
function getTeamDisplayName(fullName) {
  // Check if we have a predefined display name
  if (teamDisplayNames[fullName]) {
    return teamDisplayNames[fullName];
  }
  
  // If no mapping exists, just return the full name
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

// Socket event handlers
socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('gameState', (state) => {
  // Update all elements with the current game state
  const team1DisplayName = getTeamDisplayName(state.teams.team1.name);
  const team2DisplayName = getTeamDisplayName(state.teams.team2.name);
  
  team1Name.textContent = team1DisplayName;
  team1Score.textContent = state.teams.team1.score;
  if (state.teams.team1.logo) {
    team1Logo.src = state.teams.team1.logo;
  }
  
  team2Name.textContent = team2DisplayName;
  team2Score.textContent = state.teams.team2.score;
  if (state.teams.team2.logo) {
    team2Logo.src = state.teams.team2.logo;
  }
  
  timerElement.textContent = formatTime(state.timer.time);
  periodElement.textContent = formatPeriod(state.period);
});

socket.on('timeUpdate', (time) => {
  timerElement.textContent = formatTime(time);
});

socket.on('scoreUpdate', (teams) => {
  updateScoreWithAnimation(team1Score, teams.team1.score);
  updateScoreWithAnimation(team2Score, teams.team2.score);
});

socket.on('teamUpdate', (teams) => {
  const team1DisplayName = getTeamDisplayName(teams.team1.name);
  const team2DisplayName = getTeamDisplayName(teams.team2.name);
  
  team1Name.textContent = team1DisplayName;
  team2Name.textContent = team2DisplayName;
  
  if (teams.team1.logo) {
    team1Logo.src = teams.team1.logo;
  }
  
  if (teams.team2.logo) {
    team2Logo.src = teams.team2.logo;
  }
});

socket.on('periodUpdate', (period) => {
  periodElement.textContent = formatPeriod(period);
}); 