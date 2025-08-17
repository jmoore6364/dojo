import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AttendanceAttributes {
  id: string;
  organizationId: string;
  schoolId: string;
  classId: string;
  studentId: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkInTime?: Date;
  checkOutTime?: Date;
  notes?: string;
  markedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface AttendanceCreationAttributes extends Optional<AttendanceAttributes, 'id'> {}

class Attendance extends Model<AttendanceAttributes, AttendanceCreationAttributes> implements AttendanceAttributes {
  public id!: string;
  public organizationId!: string;
  public schoolId!: string;
  public classId!: string;
  public studentId!: string;
  public date!: Date;
  public status!: 'present' | 'absent' | 'late' | 'excused';
  public checkInTime?: Date;
  public checkOutTime?: Date;
  public notes?: string;
  public markedBy?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Attendance.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    organizationId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id',
      },
    },
    schoolId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    classId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'classes',
        key: 'id',
      },
    },
    studentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'students',
        key: 'id',
      },
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('present', 'absent', 'late', 'excused'),
      allowNull: false,
    },
    checkInTime: DataTypes.DATE,
    checkOutTime: DataTypes.DATE,
    notes: DataTypes.TEXT,
    markedBy: {
      type: DataTypes.UUID,
      references: {
        model: 'users',
        key: 'id',
      },
    },
  },
  {
    sequelize,
    modelName: 'Attendance',
    tableName: 'attendance',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['classId', 'studentId', 'date'],
      },
    ],
  }
);

export default Attendance;