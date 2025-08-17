# Dojo Platform - Project Context for Claude Code

## Project Overview
A multi-tenant martial arts dojo management platform with separate backend and frontend.

## Project Structure
```
/dojo-backend    - Node.js + Express + Sequelize API
/dojo-platform   - Next.js + TypeScript + Tailwind frontend
```

## Development Commands

### Backend
```bash
cd dojo-backend
npm run dev      # Start development server (port 5000)
npm run build    # Build TypeScript
npm run lint     # Run linting
```

### Frontend  
```bash
cd dojo-platform
npm run dev      # Start Next.js dev server (port 3000)
npm run build    # Build for production
npm run lint     # Run linting
```

## Database
- PostgreSQL with Sequelize ORM
- Multi-tenant architecture
- Models: Organization, School, User, Student, Class, Attendance

## Authentication
- JWT-based authentication
- 6 roles: super_admin, org_admin, school_admin, instructor, student, parent

## Tech Stack
- **Backend**: Node.js, Express, Sequelize, PostgreSQL, TypeScript
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Auth**: JWT, bcrypt

## Important Notes
- Always run TypeScript compilation checks before committing
- Backend runs without database connection (with warnings)
- Use environment variables from .env files
- Multi-tenant system: Each organization can have multiple schools

## Common Tasks
1. Adding new API endpoint: Update routes in `/dojo-backend/src/routes/`
2. Adding UI component: Use shadcn/ui components in `/dojo-platform/components/`
3. Database changes: Update models in `/dojo-backend/src/models/`

## Testing Endpoints
- Backend health: http://localhost:5000/health
- Frontend: http://localhost:3000

## Git Workflow
- Do NOT commit .env files
- Run linting before commits
- Test both backend and frontend before pushing