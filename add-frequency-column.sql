-- Add missing columns to tontines table
ALTER TABLE tontines ADD COLUMN frequency TEXT NOT NULL DEFAULT 'monthly';
ALTER TABLE tontines ADD COLUMN max_subscriptions INTEGER NOT NULL DEFAULT 10;
ALTER TABLE tontines ADD COLUMN stake_amount DECIMAL(10, 2) NOT NULL DEFAULT 50000.00;

-- Add missing columns to users table
ALTER TABLE users ADD COLUMN image TEXT;

-- Update any existing records if needed
-- UPDATE tontines SET frequency = 'monthly' WHERE frequency IS NULL;
-- UPDATE tontines SET max_subscriptions = 10 WHERE max_subscriptions IS NULL;
-- UPDATE tontines SET stake_amount = 50000.00 WHERE stake_amount IS NULL;

-- You can run this in the Supabase SQL Editor
