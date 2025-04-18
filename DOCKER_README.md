# Docker Setup for Siam Inline Super League Scoreboard

This document explains how to run the Siam Inline Super League Scoreboard using Docker.

## Prerequisites

- Docker and Docker Compose installed on your system
- OBS Studio (for streaming)

## Environment Setup

1. The application uses a `.env` file for configuration.
2. Create a `.env` file in the root directory with the following structure:
   ```
   # Supabase credentials
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_key
   
   # Application settings
   NODE_ENV=production
   PORT=3000
   ```
3. Replace `your_supabase_url` and `your_supabase_key` with your actual Supabase credentials.

## Running with Docker

1. Clone this repository to your machine
2. Open a terminal in the project directory
3. Make sure your `.env` file is present in the root directory
4. Build and start the container:

```bash
docker-compose up -d
```

5. The app will be available at:
   - Controller interface: http://localhost:3000/controller
   - Overlay for OBS: http://localhost:3000/overlay

## Stopping the Application

To stop the running containers:

```bash
docker-compose down
```

## OBS Setup

1. Open OBS Studio
2. Add a new "Browser Source" to your scene
3. Set the URL to `http://localhost:3000/overlay`
4. Set width and height (recommended: 1280x150)
5. Check "Refresh browser when scene becomes active" 
6. Check "Shutdown source when not visible"
7. Enable "Control audio via OBS"
8. Check the "**Custom CSS**" option and add:
   ```css
   body { background-color: rgba(0, 0, 0, 0); margin: 0px; overflow: hidden; }
   ```
   This makes the background transparent.
9. Click "OK" to save the browser source

## Troubleshooting

- If you can't connect to the app, make sure the Docker container is running:
  ```bash
  docker-compose ps
  ```

- To view the logs:
  ```bash
  docker-compose logs -f
  ```

- If you need to rebuild the container after making changes:
  ```bash
  docker-compose up -d --build
  ``` 