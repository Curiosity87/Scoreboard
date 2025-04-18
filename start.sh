#!/bin/bash

# Load environment variables from .env file
if [ -f .env ]; then
  export $(cat .env | grep -v '#' | sed 's/\r$//' | xargs)
else
  echo "Error: .env file not found!"
  exit 1
fi

# Start the scoreboard server with Supabase credentials
npm start

# Exit with the npm exit code
exit $? 