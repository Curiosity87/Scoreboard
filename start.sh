#!/bin/bash

# Start the scoreboard server with Supabase credentials
SUPABASE_URL=https://xaakqhceogyxvcccstav.supabase.co \
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhYWtxaGNlb2d5eHZjY2NzdGF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5NjQ0NzksImV4cCI6MjA2MDU0MDQ3OX0.ALvUeCFh6dN8V1YCoDHhsue8-Gx13Z8OMLblH2DQuNg \
npm start

# Exit with the npm exit code
exit $? 