-- MovieMate Database Setup Script
-- Run this script as the postgres superuser

-- Connect to the moviemate_db database
\c moviemate_db

-- Grant schema privileges to moviemate_user
GRANT ALL ON SCHEMA public TO moviemate_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moviemate_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO moviemate_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO moviemate_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO moviemate_user;

-- Verify the user's privileges
\du moviemate_user

-- Show database info
\l moviemate_db

-- Success message
\echo 'Database permissions configured successfully!'
