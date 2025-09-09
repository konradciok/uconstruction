-- Initialize PostgreSQL database for uconstruction
-- This script runs when the PostgreSQL container starts for the first time

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Set timezone
SET timezone = 'UTC';

-- Create a dedicated user for the application (optional, using default for simplicity)
-- The main user is already created via environment variables

-- Log successful initialization
DO $$
BEGIN
    RAISE NOTICE 'uconstruction database initialized successfully';
END $$;
