-- Create resolvedesk user and database
CREATE USER resolvedesk WITH PASSWORD 'resolvedesk' CREATEDB;
CREATE DATABASE resolvedesk OWNER resolvedesk;

-- Grant all on the new database to the user
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO resolvedesk;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO resolvedesk;

