-- Create the teams table
CREATE TABLE IF NOT EXISTS public.teams (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  display_name TEXT NOT NULL,
  logo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Insert initial teams
INSERT INTO public.teams (name, display_name, logo_url) 
VALUES 
('ASOKE ANTEATERS', 'Anteaters', '../assets/Anteaters_Official_Logo.png'),
('BKK BAEBLADEZ', 'Bladez', '../assets/Bladez_Official_Logo.png'),
('RATTANAKORN RAIDERS', 'Raiders', '../assets/Raiders_Official_Logo.png');

-- View the teams
SELECT * FROM public.teams; 