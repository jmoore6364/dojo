import sequelize from '../config/database';
import Organization from './Organization';
import School from './School';
import User from './User';
import Student from './Student';
import Class from './Class';
import Attendance from './Attendance';

// Organization associations
Organization.hasMany(School, { foreignKey: 'organizationId', as: 'schools' });
Organization.hasMany(User, { foreignKey: 'organizationId', as: 'users' });

// School associations
School.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
School.hasMany(User, { foreignKey: 'schoolId', as: 'users' });
School.hasMany(Student, { foreignKey: 'schoolId', as: 'students' });
School.hasMany(Class, { foreignKey: 'schoolId', as: 'classes' });

// User associations
User.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
User.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
User.hasOne(Student, { foreignKey: 'userId', as: 'studentProfile' });

// Student associations
Student.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Student.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Student.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
Student.hasMany(Attendance, { foreignKey: 'studentId', as: 'attendanceRecords' });

// Class associations
Class.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Class.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
Class.belongsTo(User, { foreignKey: 'instructorId', as: 'instructor' });
Class.hasMany(Attendance, { foreignKey: 'classId', as: 'attendanceRecords' });

// Attendance associations
Attendance.belongsTo(Organization, { foreignKey: 'organizationId', as: 'organization' });
Attendance.belongsTo(School, { foreignKey: 'schoolId', as: 'school' });
Attendance.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
Attendance.belongsTo(Student, { foreignKey: 'studentId', as: 'student' });
Attendance.belongsTo(User, { foreignKey: 'markedBy', as: 'marker' });

export {
  sequelize,
  Organization,
  School,
  User,
  Student,
  Class,
  Attendance,
};