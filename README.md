# Constituent Management System

This project is a comprehensive system for managing constituent data. Follow these steps to run the project:

## Prerequisites

- [Bun](https://bun.sh/) (JavaScript runtime and toolkit)
- [Docker](https://www.docker.com/) (Containerization platform)

## Getting Started

1. Clone the repository:
   ```
   git clone https://github.com/Bunchhieng/constituent-management-system.git
   cd constituent-management-system
   ```

2. Run the start script:
   ```
   ./start.sh
   ```

   This script will:
   - Start PostgreSQL using Docker Compose
   - Launch the frontend on `http://localhost:3000`
   - Start the backend server on `http://localhost:3001`
   - Populate the database with 500 sample constituents using Drizzle ORM

## Project Structure

- Frontend: React application
- Backend: Node.js server with Bun runtime
- Database: PostgreSQL (containerized)

## Tech Stack

- Bun (https://bun.sh/) - JavaScript runtime and toolkit
- Drizzle ORM (https://drizzle.dev/) - Database ORM
- PostgreSQL (https://www.postgresql.org/) - Database
- React (https://reactjs.org/) - Frontend framework
- Next.js (https://nextjs.org/) - Frontend framework
- TailwindCSS (https://tailwindcss.com/) - CSS framework
- shadCN UI (https://ui.shadcn.com/) - UI component library
- Biome (https://biomejs.dev/) - Linter and formatter