import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';
import { getJSONType } from '../config/database-helpers';

interface UserAttributes {
  id: string;
  organizationId: string;
  schoolId?: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'org_admin' | 'school_admin' | 'instructor' | 'student' | 'parent';
  phone?: string;
  avatar?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContact?: object;
  medicalInfo?: object;
  isActive: boolean;
  emailVerified: boolean;
  lastLogin?: Date;
  settings?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'isActive' | 'emailVerified'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public organizationId!: string;
  public schoolId?: string;
  public email!: string;
  public password!: string;
  public firstName!: string;
  public lastName!: string;
  public role!: 'super_admin' | 'org_admin' | 'school_admin' | 'instructor' | 'student' | 'parent';
  public phone?: string;
  public avatar?: string;
  public dateOfBirth?: Date;
  public address?: string;
  public city?: string;
  public state?: string;
  public zipCode?: string;
  public emergencyContact?: object;
  public medicalInfo?: object;
  public isActive!: boolean;
  public emailVerified!: boolean;
  public lastLogin?: Date;
  public settings?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}

User.init(
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
      references: {
        model: 'schools',
        key: 'id',
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('super_admin', 'org_admin', 'school_admin', 'instructor', 'student', 'parent'),
      allowNull: false,
    },
    phone: DataTypes.STRING,
    avatar: DataTypes.STRING,
    dateOfBirth: DataTypes.DATE,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    emergencyContact: getJSONType(),
    medicalInfo: getJSONType(),
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lastLogin: DataTypes.DATE,
    settings: {
      type: getJSONType(),
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;