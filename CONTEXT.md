
# 🏒 Siam Inline Super League Scoreboard

A browser-based hockey scoreboard overlay for OBS Studio with a real-time controller to update time, score, team names, and logos.

---

## ⚙️ Tech Stack

| Part           | Tech                      |
|----------------|---------------------------|
| Overlay        | HTML + CSS + JavaScript   |
| Backend        | Node.js with Express      |
| Real-time Sync | WebSocket (or Socket.IO)  |
| Controller     | Web App (React or plain)  |
| Hosting        | Localhost / LAN / Docker  |
| OBS Integration| Browser Source            |

---

## 🧱 Project Structure

```
siam-inline-scoreboard/
├── overlay/         # Scoreboard overlay for OBS
├── controller/      # Web UI to control scoreboard
├── server/          # Node.js + WebSocket backend
├── assets/          # Team logos or shared files
```

---

## 🖥️ Overlay UI (`/overlay`)

A simple browser-based UI displayed in OBS via a Browser Source.

### Display Elements
- Team 1 name + logo
- Team 2 name + logo
- Timer (countdown/up)
- Score for both teams
- Period or game status

### Tech
- HTML/CSS (Tailwind or custom)
- JavaScript for WebSocket connection
- Transparent background (`background: transparent;`)

---

## 🎮 Controller UI (`/controller`)

A web-based interface to control the scoreboard in real time.

### Controls
| Function          | Type                |
|------------------|---------------------|
| Start/Stop Timer | Button              |
| Set Time (MM:SS) | Input               |
| Add/Sub Time      | +/- Buttons         |
| Team Names       | Text Inputs         |
| Team Logos       | File upload / URL   |
| Scores           | +/- Buttons per team|
| Period           | Dropdown / Buttons  |
| Reset Game       | Button              |

---

## 🔌 Real-time Backend (`/server`)

Node.js + Express backend to sync data between controller and overlay.

### WebSocket Events
- `startTimer`
- `stopTimer`
- `updateTime`
- `adjustTime`
- `updateScore`
- `setTeamName`
- `setTeamLogo`
- `setPeriod`
- `resetGame`

The server holds the game state and pushes updates to connected clients (overlay + controller).

---

## ⏱️ Timer Logic

- Timer runs centrally on the backend
- Sends updated time to clients every second
- Supports pause, resume, manual set, and adjustment
- Optional: keep-alive pings to reconnect clients

---

## 🎥 OBS Integration

1. Open OBS Studio
2. Add a **Browser Source**
3. URL: `http://localhost:PORT/overlay`
4. Set width & height (e.g. 1280x200)
5. Enable **"Transparent Background"**
6. Position the overlay in your scene layout

---

## 🎨 Styling Suggestions

- Responsive layout
- Smooth animations (e.g. ticking timer, score transitions)
- Team logos sized to fit
- Font suggestions: Oswald, Roboto Mono
- Transparent overlay background

---

## 📦 Optional Enhancements

- Persist scoreboard state locally (e.g. JSON file)
- Mobile-friendly controller UI
- Dockerized deployment
- Password protection for controller access
- Fullscreen mode for overlay preview

---

## 🧪 Example Workflow

1. Open `controller/index.html`
2. Set team names, logos, and period
3. Start timer and adjust score as needed
4. OBS displays `overlay/index.html` via browser source
5. Changes reflect in real-time on the stream

---

## 🚀 Future Ideas

- Stats tracking for players
- Game history export (CSV/JSON)
- Touchscreen-compatible controller UI
- Multiple overlay layouts (e.g. full scoreboard vs. minimal)
