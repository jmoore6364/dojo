import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { getJSONType } from '../config/database-helpers';

interface SchoolAttributes {
  id: string;
  organizationId: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
  email: string;
  maxStudents?: number;
  timezone?: string;
  settings?: object;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

interface SchoolCreationAttributes extends Optional<SchoolAttributes, 'id' | 'isActive'> {}

class School extends Model<SchoolAttributes, SchoolCreationAttributes> implements SchoolAttributes {
  public id!: string;
  public organizationId!: string;
  public name!: string;
  public slug!: string;
  public address!: string;
  public city!: string;
  public state!: string;
  public zipCode!: string;
  public country!: string;
  public phone!: string;
  public email!: string;
  public maxStudents?: number;
  public timezone?: string;
  public settings?: object;
  public isActive!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

School.init(
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
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    state: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    zipCode: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    maxStudents: DataTypes.INTEGER,
    timezone: DataTypes.STRING,
    settings: {
      type: getJSONType(),
      defaultValue: {},
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    sequelize,
    modelName: 'School',
    tableName: 'schools',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['organizationId', 'slug'],
      },
    ],
  }
);

export default School;