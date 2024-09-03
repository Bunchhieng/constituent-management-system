#!/bin/bash

# Start PostgreSQL
docker-compose up -d

# Start backend
cd backend
bun install
bunx drizzle-kit generate
bunx drizzle-kit push # Run migrations
bun run src/migrate.ts # Run migrations script
bun run src/populate.ts & # Populate database
bun run --watch src/server.ts & # Enable hot reload for the server

# Start frontend
cd ../frontend
bun install
bun run dev