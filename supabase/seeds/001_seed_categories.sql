-- Seed initial categories for the Nami personal finance app
-- These categories are pre-populated for the user to start tracking expenses

INSERT INTO categories (name, icon, color, type) VALUES
  -- Expense categories
  ('Rent & Amenities', 'Home', '#FF6B6B', 'expense'),
  ('Food', 'Utensils', '#4ECDC4', 'expense'),
  ('Transport', 'Car', '#45B7D1', 'expense'),
  ('Learning', 'BookOpen', '#96CEB4', 'expense'),
  ('Health', 'Heart', '#FFEAA7', 'expense'),
  ('Gifts', 'Gift', '#DFE6E9', 'expense'),
  ('Gym', 'Dumbbell', '#74B9FF', 'expense'),
  ('BodyCare', 'Sparkles', '#FDA7DF', 'expense'),
  ('Entertainment', 'Tv', '#A29BFE', 'expense'),
  ('Relationship', 'Users', '#FD79A8', 'expense'),
  ('Family', 'Users', '#FDCB6E', 'expense'),
  ('Investments', 'TrendingUp', '#00B894', 'expense'),
  ('Car', 'Car', '#636E72', 'expense'),
  ('Insurance', 'Shield', '#2D3436', 'expense'),
  
  -- Common income categories
  ('Salary', 'Briefcase', '#00B894', 'income'),
  ('Freelance', 'Laptop', '#6C5CE7', 'income'),
  ('Investment Returns', 'TrendingUp', '#FDCB6E', 'income'),
  ('Gift Received', 'Gift', '#FD79A8', 'income'),
  ('Other Income', 'DollarSign', '#74B9FF', 'income')
ON CONFLICT DO NOTHING;

-- Note: Icon names correspond to Lucide React icons
-- Colors are in hex format for easy use in the frontend

