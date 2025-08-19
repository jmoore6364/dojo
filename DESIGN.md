# Dojo Platform - System Design Document

## Project Overview
A comprehensive multi-tenant martial arts school management platform designed to handle the complete operational needs of martial arts organizations, from student enrollment to class scheduling and attendance tracking.

## Architecture Overview

### System Architecture
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express, TypeScript, Sequelize ORM
- **Database**: PostgreSQL (primary), Redis (caching)
- **Authentication**: JWT-based with bcrypt password hashing
- **Deployment**: Docker containers with docker-compose orchestration

### Multi-Tenant Architecture
The platform supports a hierarchical multi-tenant structure:
```
Organization (Top Level)
    ├── Schools (Multiple per Organization)
    │   ├── Users (Staff, Instructors)
    │   ├── Students
    │   ├── Classes
    │   └── Attendance Records
```

## User Roles & Permissions

### Role Hierarchy
1. **Super Admin**: Platform-wide administration
   - Manage all organizations
   - System configuration
   - Platform analytics

2. **Organization Admin**: Organization-level management
   - Manage multiple schools
   - Organization-wide reports
   - User management across schools

3. **School Admin**: School-level administration
   - Manage instructors and students
   - School scheduling
   - School-specific reports

4. **Instructor**: Teaching and class management
   - Manage assigned classes
   - Mark attendance
   - View student progress

5. **Student**: Student portal access
   - View class schedule
   - Check attendance history
   - View progress/achievements

6. **Parent**: Parent portal access
   - View child's attendance
   - Check schedule
   - Communication with school

## Database Schema

### Core Models

#### Organization
- id (UUID, PK)
- name
- subdomain
- settings (JSON)
- subscription_tier
- created_at
- updated_at

#### School
- id (UUID, PK)
- organization_id (FK)
- name
- address
- phone
- email
- settings (JSON)
- active
- created_at
- updated_at

#### User
- id (UUID, PK)
- organization_id (FK)
- school_id (FK, nullable)
- email (unique)
- password (hashed)
- first_name
- last_name
- role (enum)
- phone
- active
- last_login
- created_at
- updated_at

#### Student
- id (UUID, PK)
- user_id (FK)
- organization_id (FK)
- school_id (FK)
- parent_email
- date_of_birth
- belt_rank
- enrollment_date
- emergency_contact (JSON)
- medical_info (JSON)
- active
- created_at
- updated_at

#### Class
- id (UUID, PK)
- organization_id (FK)
- school_id (FK)
- instructor_id (FK to User)
- name
- description
- schedule (JSON - recurring schedule)
- max_students
- belt_requirements (JSON)
- active
- created_at
- updated_at

#### Attendance
- id (UUID, PK)
- organization_id (FK)
- school_id (FK)
- class_id (FK)
- student_id (FK)
- date
- status (present/absent/late/excused)
- marked_by (FK to User)
- notes
- created_at
- updated_at

## API Structure

### Authentication Endpoints
- POST /api/auth/login
- POST /api/auth/logout
- POST /api/auth/refresh
- POST /api/auth/forgot-password
- POST /api/auth/reset-password

### Organization Management
- GET /api/organizations
- GET /api/organizations/:id
- POST /api/organizations
- PUT /api/organizations/:id
- DELETE /api/organizations/:id

### School Management
- GET /api/schools
- GET /api/schools/:id
- POST /api/schools
- PUT /api/schools/:id
- DELETE /api/schools/:id

### User Management
- GET /api/users
- GET /api/users/:id
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id
- PUT /api/users/:id/role

### Student Management
- GET /api/students
- GET /api/students/:id
- POST /api/students
- PUT /api/students/:id
- DELETE /api/students/:id
- GET /api/students/:id/attendance
- GET /api/students/:id/classes

### Class Management
- GET /api/classes
- GET /api/classes/:id
- POST /api/classes
- PUT /api/classes/:id
- DELETE /api/classes/:id
- GET /api/classes/:id/students
- POST /api/classes/:id/enroll

### Attendance Management
- GET /api/attendance
- POST /api/attendance/mark
- PUT /api/attendance/:id
- GET /api/attendance/report

## Caching Strategy

### Redis Implementation
- **Cache Layer**: Middleware for GET requests
- **TTL**: 5 minutes default, configurable per endpoint
- **Invalidation Patterns**:
  - User updates: Clear user:userId:* and api:*/users/userId*
  - Organization updates: Clear org:orgId:* and api:*/organizations/orgId*
  - School updates: Clear school:schoolId:* and api:*/schools/schoolId*

### Cached Endpoints
- User profiles
- Organization settings
- School information
- Class schedules
- Student lists

## Security Measures

### Authentication & Authorization
- JWT tokens with 30-day expiration
- Refresh token rotation
- Role-based access control (RBAC)
- Organization-scoped data isolation

### API Security
- Helmet.js for security headers
- Rate limiting (100 requests per 15 minutes)
- CORS configuration
- Input validation with express-validator
- SQL injection prevention via Sequelize ORM

### Data Protection
- Password hashing with bcrypt (10 salt rounds)
- Environment variables for sensitive configuration
- HTTPS enforcement in production
- Audit logging for sensitive operations

## Frontend Architecture

### Page Structure
```
/                          - Landing page
/login                     - Authentication
/dashboard                 - Role-based dashboard
/organizations             - Super admin only
/schools                   - Organization/School admin
/students                  - Student management
/classes                   - Class management
/attendance               - Attendance tracking
/reports                  - Analytics and reporting
/settings                 - User/System settings
```

### Component Architecture
- Atomic design pattern
- Shared UI components via shadcn/ui
- Role-based component rendering
- Responsive design (mobile-first)

### State Management
- React Context for authentication
- SWR or React Query for data fetching
- Local state for forms
- Session storage for temporary data

## Deployment Architecture

### Docker Configuration
- **PostgreSQL**: Database container with persistent volume
- **Redis**: Cache container with AOF persistence
- **Backend**: Node.js application container
- **Frontend**: Next.js application container
- **Networks**: Bridge network for inter-container communication

### Environment Configuration
- Development: Local Docker Compose
- Staging: Docker Swarm or Kubernetes
- Production: Kubernetes with auto-scaling

## Performance Optimization

### Backend
- Redis caching for frequently accessed data
- Database indexing on foreign keys and search fields
- Query optimization with Sequelize eager loading
- Connection pooling for database

### Frontend
- Static generation for public pages
- Image optimization with Next.js Image
- Code splitting and lazy loading
- API response caching with SWR

## Monitoring & Logging

### Application Monitoring
- Health check endpoints (/health)
- Performance metrics collection
- Error tracking and reporting
- User activity logging

### Infrastructure Monitoring
- Container health checks
- Resource usage tracking
- Database performance metrics
- Cache hit/miss ratios

## Future Enhancements

### Phase 2 Features
- Payment processing integration
- Email notification system
- SMS reminders for classes
- Mobile applications (React Native)
- Advanced reporting with charts
- Belt progression tracking
- Tournament management
- Equipment inventory tracking

### Phase 3 Features
- Video streaming for online classes
- Student performance analytics
- AI-powered scheduling optimization
- Multi-language support
- White-label customization
- API for third-party integrations

## Development Workflow

### Git Strategy
- Main branch for production
- Develop branch for staging
- Feature branches for new features
- Hotfix branches for urgent fixes

### Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance testing for load handling

### CI/CD Pipeline
- Automated testing on pull requests
- Docker image building
- Automated deployment to staging
- Manual approval for production

## Documentation

### Technical Documentation
- API documentation (OpenAPI/Swagger)
- Database schema documentation
- Component library documentation
- Deployment guide

### User Documentation
- Admin user guide
- Instructor manual
- Student/Parent portal guide
- Video tutorials

## Support & Maintenance

### Backup Strategy
- Daily database backups
- Point-in-time recovery capability
- Backup retention: 30 days
- Disaster recovery plan

### Update Strategy
- Monthly security updates
- Quarterly feature releases
- Zero-downtime deployments
- Rollback capability

## Success Metrics

### Technical KPIs
- API response time < 200ms
- 99.9% uptime SLA
- Cache hit ratio > 80%
- Database query time < 50ms

### Business KPIs
- User adoption rate
- Daily active users
- Feature utilization metrics
- Customer satisfaction score

---

*Last Updated: 2025-08-18*
*Version: 1.0.0*