# 🏒 Siam Inline Super League Scoreboard

A real-time hockey scoreboard overlay for OBS Studio with a controller interface to manage game state.

## Features

- Real-time scoreboard overlay for OBS
- Web-based controller interface
- Timer with start/stop/reset functionality
- Team name and logo customization
- Score tracking
- Period tracking
- Game history with Supabase integration
- Responsive design for both overlay and controller

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)
- OBS Studio (for streaming)
- Supabase account (for game history)

### Installation

1. Clone this repository or download it to your computer
2. Open a terminal in the project directory
3. Install dependencies:

```bash
npm install
```

4. Start the server using one of the provided scripts:

On macOS/Linux:
```bash
./start.sh
```

On Windows:
```bash
start.bat
```

Or manually with environment variables:
```bash
SUPABASE_URL=https://xaakqhceogyxvcccstav.supabase.co SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWtxaGNlb2d5eHZjY2NzdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzksImV4cCI6MjA2MDU0MDQ3OX0.ALvUeCFh6dN8V1YCoDHhsue8-Gx13Z8OMLblH2DQuNg npm start
```

5. The server will start on port 3000 by default. You should see a message like:
   `Server running on port 3000` followed by a database connection message.

### Setting up the Database

The application will attempt to create the necessary database table in Supabase automatically. If this fails, you can:

1. Go to the Supabase dashboard
2. Open the SQL Editor
3. Run the following SQL to create the required table:

```sql
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
```

### Setting up OBS Studio

1. Open OBS Studio
2. Add a new "Browser Source" to your scene
3. Set the URL to `http://localhost:3000/overlay`
4. Set an appropriate width and height (recommended: 1280x150)
5. Check "Refresh browser when scene becomes active" 
6. Check "Shutdown source when not visible"
7. Enable "Control audio via OBS"
8. Most importantly, check the "**Custom CSS**" option and add:
   ```css
   body { background-color: rgba(0, 0, 0, 0); margin: 0px; overflow: hidden; }
   ```
   This makes the background transparent.
9. Click "OK" to save the browser source

## Usage

### Controller Interface

Open the controller interface in your browser:
```
http://localhost:3000/controller
```

From here you can:

1. **Control the Timer**
   - Start/Stop the timer
   - Reset the timer (to 15:00)
   - Set a custom time
   - Add/subtract time increments

2. **Manage Teams**
   - Set team names
   - Upload team logos (or use URL)
   - Update scores

3. **Set Period**
   - Increment/decrement the period number

4. **Game Management**
   - Finish the game and record the result
   - View history of past games
   - Reset the entire game state
   - Open the overlay in a new tab for preview

5. **Game History**
   - Automatically saves completed games to Supabase
   - View a log of past games with teams, scores, and results
   - Data is persistent between sessions

### Overlay

The overlay is displayed at:
```
http://localhost:3000/overlay
```

This is what appears in your OBS Browser Source, featuring:
- Team logos and names
- Current score
- Game timer
- Current period

## Developer Notes

### Project Structure

- `/server` - Backend Node.js + Express + Socket.IO server
- `/overlay` - The OBS scoreboard overlay
- `/controller` - The web-based control interface
- `/assets` - Static assets like default logos

### Making Modifications

- Edit CSS in `overlay/style.css` to change the scoreboard appearance
- Modify `controller/style.css` to update the controller interface
- Backend logic is in `server/index.js`

## Troubleshooting

- **Overlay not updating**: Check if the server is running and reload the browser source in OBS
- **Controller not connecting**: Ensure you're accessing the correct URL and the server is running
- **Missing team logos**: Check if the file paths are correct or if the images are accessible
- **Database errors**: Make sure the Supabase URL and key are correct and the table exists

## License

MIT License