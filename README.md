# Dojo Platform - Martial Arts School Management System

A comprehensive multi-tenant platform for martial arts schools to manage their operations, students, classes, and more.

## 🥋 Features

### For Students
- Personal dashboard with class schedule
- Attendance tracking
- Progress monitoring and belt ranking
- Access to learning materials
- Equipment ordering
- Class registration

### For Instructors
- Class management
- Student progress tracking
- Attendance marking
- Material distribution
- Performance analytics

### For School Administrators
- Complete school management
- Student enrollment
- Class scheduling
- Billing and payments
- Inventory management
- Multi-location support
- Custom reporting

## 🚀 Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Modern component library
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **Sequelize** - ORM
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Testing
- **Jest** - Unit testing
- **React Testing Library** - Component testing
- **Playwright** - E2E testing
- **Supertest** - API testing

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/dojo-platform.git
cd dojo-platform
```

2. Install backend dependencies:
```bash
cd dojo-backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../dojo-platform
npm install
```

4. Set up environment variables:

Backend (.env):
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=dojo_platform
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d

# CORS
CLIENT_URL=http://localhost:3000
```

5. Set up the database:
```bash
# Create PostgreSQL database
createdb dojo_platform

# Run backend (will auto-create tables in development)
cd dojo-backend
npm run dev
```

6. Start the development servers:

Backend:
```bash
cd dojo-backend
npm run dev
```

Frontend:
```bash
cd dojo-platform
npm run dev
```

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd dojo-backend
npm test

# Frontend tests
cd dojo-platform
npm test
```

### E2E Tests
```bash
cd dojo-platform
npm run test:e2e
```

### Test Coverage
```bash
npm run test:coverage
```

## 📁 Project Structure

```
dojo-platform/
├── dojo-backend/           # Backend API
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Sequelize models
│   │   ├── routes/        # API routes
│   │   ├── tests/         # Unit & integration tests
│   │   └── server.ts      # Main server file
│   └── package.json
│
├── dojo-platform/          # Frontend application
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility functions
│   ├── e2e/               # E2E tests
│   └── package.json
│
└── README.md
```

## 🔐 Authentication & Authorization

The platform uses JWT-based authentication with role-based access control:

- **super_admin** - Platform administrator
- **org_admin** - Organization administrator
- **school_admin** - School administrator
- **instructor** - Class instructor
- **student** - Student user
- **parent** - Parent/guardian access

## 🗄️ Database Schema

### Core Entities
- **Organizations** - Multi-tenant support
- **Schools** - Multiple locations per organization
- **Users** - All system users
- **Students** - Student-specific data
- **Classes** - Class schedules and information
- **Attendance** - Attendance records

## 🚢 Deployment

### Production Build

Backend:
```bash
cd dojo-backend
npm run build
npm start
```

Frontend:
```bash
cd dojo-platform
npm run build
npm start
```

### Environment Variables

Ensure all production environment variables are set:
- Database credentials
- JWT secrets
- API URLs
- CORS origins

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/register-organization` - Register new organization
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Protected Routes

All protected routes require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

- Your Name - Initial work

## 🙏 Acknowledgments

- Built with Next.js and Node.js
- UI components from shadcn/ui
- Icons from Lucide React

## 📞 Support

For support, email support@dojoplatform.com or open an issue in the GitHub repository.

---

**Status**: 🚧 Under Active Development

**Current Version**: 0.1.0

**Last Updated**: 2024