@echo off
echo Granting permissions to moviemate_user...
echo.
echo Please enter the postgres password when prompted
echo.

psql -U postgres -h localhost -p 5432 -d moviemate_db -c "GRANT ALL ON SCHEMA public TO moviemate_user;"
psql -U postgres -h localhost -p 5432 -d moviemate_db -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO moviemate_user;"
psql -U postgres -h localhost -p 5432 -d moviemate_db -c "GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO moviemate_user;"
psql -U postgres -h localhost -p 5432 -d moviemate_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO moviemate_user;"
psql -U postgres -h localhost -p 5432 -d moviemate_db -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO moviemate_user;"

echo.
echo Permissions granted successfully!
echo.
pause
