#!/bin/bash

# Function to check if port is in use
is_port_in_use() {
    lsof -i :$1 > /dev/null 2>&1
    return $?
}

# Function to kill processes using specific ports
kill_process_on_port() {
    local port=$1
    local pid=$(lsof -t -i :$port)
    if [ ! -z "$pid" ]; then
        echo "Killing process on port $port (PID: $pid)"
        kill $pid
    fi
}

# Function to cleanup background processes
cleanup() {
    echo "Cleaning up..."
    kill $(jobs -p) 2>/dev/null
    wait
}

# Set trap to call cleanup function on script exit
trap cleanup EXIT

# Ensure ports are free
kill_process_on_port 3000
kill_process_on_port 3001

# Check if Docker containers are running
if ! docker-compose ps | grep -q "Up"; then
    echo "Starting Docker containers..."
    docker-compose up -d
    # Wait for services to be ready
    sleep 5
else
    echo "Docker containers are already running."
fi

# Start backend
cd backend
bun install
bunx drizzle-kit generate
bunx drizzle-kit push # Run migrations
bun run src/migrate.ts || { echo "Error during migration"; exit 1; }
bun run src/populate.ts || { echo "Error populating database"; exit 1; }

# Run Biome checks for backend, but don't stop if they fail
echo "Running Biome checks for backend..."
bun run check || echo "Biome check failed, but continuing..."
bun run format || echo "Biome format failed, but continuing..."

# Start the backend server
echo "Starting backend server..."
bun run --watch src/server.ts &
backend_pid=$!

# Start frontend
cd ../frontend
bun install

# Run frontend development server
echo "Starting frontend server..."
bun run dev &
frontend_pid=$!

# Wait for all background jobs
wait