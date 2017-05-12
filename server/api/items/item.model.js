'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Item', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true,
    },
    notes: DataTypes.TEXT,
    affinity: DataTypes.STRING,
    location: Datatypes.STRING,
    cost: DataTypes.STRING,
    aliases: DataTypes.STRING,
  });
}
