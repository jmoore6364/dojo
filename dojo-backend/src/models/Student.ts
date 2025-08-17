import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { getJSONType, getArrayType } from '../config/database-helpers';

interface StudentAttributes {
  id: string;
  userId: string;
  organizationId: string;
  schoolId: string;
  studentId: string;
  beltRank: string;
  rankDate?: Date;
  joinDate: Date;
  status: 'active' | 'inactive' | 'suspended' | 'graduated';
  parentIds?: string[];
  notes?: string;
  achievements?: object[];
  attendanceRate?: number;
  lastAttendance?: Date;
  nextGradingDate?: Date;
  tuitionStatus: 'paid' | 'pending' | 'overdue';
  tuitionDueDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface StudentCreationAttributes extends Optional<StudentAttributes, 'id' | 'status' | 'tuitionStatus'> {}

class Student extends Model<StudentAttributes, StudentCreationAttributes> implements StudentAttributes {
  public id!: string;
  public userId!: string;
  public organizationId!: string;
  public schoolId!: string;
  public studentId!: string;
  public beltRank!: string;
  public rankDate?: Date;
  public joinDate!: Date;
  public status!: 'active' | 'inactive' | 'suspended' | 'graduated';
  public parentIds?: string[];
  public notes?: string;
  public achievements?: object[];
  public attendanceRate?: number;
  public lastAttendance?: Date;
  public nextGradingDate?: Date;
  public tuitionStatus!: 'paid' | 'pending' | 'overdue';
  public tuitionDueDate?: Date;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Student.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id',
      },
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
    studentId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    beltRank: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    rankDate: DataTypes.DATE,
    joinDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'suspended', 'graduated'),
      defaultValue: 'active',
    },
    parentIds: {
      type: getArrayType(DataTypes.UUID),
    },
    notes: DataTypes.TEXT,
    achievements: getJSONType(),
    attendanceRate: DataTypes.FLOAT,
    lastAttendance: DataTypes.DATE,
    nextGradingDate: DataTypes.DATE,
    tuitionStatus: {
      type: DataTypes.ENUM('paid', 'pending', 'overdue'),
      defaultValue: 'pending',
    },
    tuitionDueDate: DataTypes.DATE,
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: true,
  }
);

export default Student;