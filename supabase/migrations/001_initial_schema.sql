-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (references auth.users)
-- Populated by a trigger from auth.users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tournaments table (simplified for single elimination)
CREATE TABLE tournaments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'ongoing', 'completed', 'cancelled')),
  organizer_id UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Participants table (replaces tournament_entries and competition_entries)
CREATE TABLE participants (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  seed INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Matches table (simplified for single elimination)
CREATE TABLE matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_number_in_round INTEGER NOT NULL,
  player1_id UUID REFERENCES participants(id),
  player2_id UUID REFERENCES participants(id),
  winner_id UUID REFERENCES participants(id),
  status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed')),
  next_match_id UUID REFERENCES matches(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_tournaments_organizer_id ON tournaments(organizer_id);
CREATE INDEX idx_participants_tournament_id ON participants(tournament_id);
CREATE INDEX idx_matches_tournament_id ON matches(tournament_id);

-- Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Anyone can view ongoing or completed tournaments" ON tournaments FOR SELECT USING (status IN ('ongoing', 'completed'));
CREATE POLICY "Organizers can do anything with their own tournaments" ON tournaments FOR ALL USING (auth.uid() = organizer_id);
CREATE POLICY "Authenticated users can create tournaments" ON tournaments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Anyone can view participants of public tournaments" ON participants FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    WHERE t.id = participants.tournament_id AND t.status IN ('ongoing', 'completed')
  )
);
CREATE POLICY "Users can join/withdraw from a tournament" ON participants FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Organizers can manage participants" ON participants FOR ALL USING (
    EXISTS (SELECT 1 FROM tournaments t WHERE t.id = participants.tournament_id AND t.organizer_id = auth.uid())
);
CREATE POLICY "Anyone can view matches of public tournaments" ON matches FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM tournaments t
    WHERE t.id = matches.tournament_id AND t.status IN ('ongoing', 'completed')
  )
);
CREATE POLICY "Organizers can manage matches" ON matches FOR ALL USING (
    EXISTS (SELECT 1 FROM tournaments t WHERE t.id = matches.tournament_id AND t.organizer_id = auth.uid())
);

-- Function to automatically create a user entry from auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'username');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update the 'updated_at' column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tournaments_updated_at BEFORE UPDATE ON tournaments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();