import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import { getJSONType } from '../config/database-helpers';

interface OrganizationAttributes {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  email: string;
  website?: string;
  subscription: 'free' | 'basic' | 'premium' | 'enterprise';
  subscriptionExpiry?: Date;
  isActive: boolean;
  settings?: object;
  createdAt?: Date;
  updatedAt?: Date;
}

interface OrganizationCreationAttributes extends Optional<OrganizationAttributes, 'id' | 'isActive' | 'subscription'> {}

class Organization extends Model<OrganizationAttributes, OrganizationCreationAttributes> implements OrganizationAttributes {
  public id!: string;
  public name!: string;
  public slug!: string;
  public logo?: string;
  public address?: string;
  public city?: string;
  public state?: string;
  public zipCode?: string;
  public country?: string;
  public phone?: string;
  public email!: string;
  public website?: string;
  public subscription!: 'free' | 'basic' | 'premium' | 'enterprise';
  public subscriptionExpiry?: Date;
  public isActive!: boolean;
  public settings?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Organization.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    slug: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    logo: DataTypes.STRING,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    zipCode: DataTypes.STRING,
    country: DataTypes.STRING,
    phone: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    website: DataTypes.STRING,
    subscription: {
      type: DataTypes.ENUM('free', 'basic', 'premium', 'enterprise'),
      defaultValue: 'free',
    },
    subscriptionExpiry: DataTypes.DATE,
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    settings: {
      type: getJSONType(),
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: 'Organization',
    tableName: 'organizations',
    timestamps: true,
  }
);

export default Organization;