import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { getJSONType, getArrayType } from '../config/database-helpers';

interface ClassAttributes {
  id: string;
  organizationId: string;
  schoolId: string;
  name: string;
  description?: string;
  instructorId: string;
  assistantInstructorIds?: string[];
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  duration: number;
  maxStudents: number;
  currentStudents: number;
  beltLevels?: string[];
  ageGroups?: string[];
  location?: string;
  isRecurring: boolean;
  recurringPattern?: object;
  startDate: Date;
  endDate?: Date;
  status: 'active' | 'cancelled' | 'completed';
  createdAt?: Date;
  updatedAt?: Date;
}

interface ClassCreationAttributes extends Optional<ClassAttributes, 'id' | 'currentStudents' | 'isRecurring' | 'status'> {}

class Class extends Model<ClassAttributes, ClassCreationAttributes> implements ClassAttributes {
  public id!: string;
  public organizationId!: string;
  public schoolId!: string;
  public name!: string;
  public description?: string;
  public instructorId!: string;
  public assistantInstructorIds?: string[];
  public dayOfWeek!: string;
  public startTime!: string;
  public endTime!: string;
  public duration!: number;
  public maxStudents!: number;
  public currentStudents!: number;
  public beltLevels?: string[];
  public ageGroups?: string[];
  public location?: string;
  public isRecurring!: boolean;
  public recurringPattern?: object;
  public startDate!: Date;
  public endDate?: Date;
  public status!: 'active' | 'cancelled' | 'completed';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Class.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: DataTypes.TEXT,
    instructorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    assistantInstructorIds: {
      type: getArrayType(DataTypes.UUID),
    },
    dayOfWeek: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    startTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    endTime: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    maxStudents: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    currentStudents: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    beltLevels: {
      type: getArrayType(DataTypes.STRING),
    },
    ageGroups: {
      type: getArrayType(DataTypes.STRING),
    },
    location: DataTypes.STRING,
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    recurringPattern: getJSONType(),
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: DataTypes.DATE,
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'completed'),
      defaultValue: 'active',
    },
  },
  {
    sequelize,
    modelName: 'Class',
    tableName: 'classes',
    timestamps: true,
  }
);

export default Class;