import { DataTypes } from 'sequelize';

// Helper to use JSON for SQLite (testing) and JSONB for PostgreSQL (production)
export const getJSONType = () => {
  return process.env.NODE_ENV === 'test' ? DataTypes.JSON : DataTypes.JSONB;
};

// Helper to handle arrays - SQLite doesn't support arrays so we use JSON
export const getArrayType = (type: any) => {
  return process.env.NODE_ENV === 'test' ? DataTypes.JSON : DataTypes.ARRAY(type);
};