const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vr_sports_configs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sports_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sports_name_kr: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 1
    },
    close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    order: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vr_sports_configs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "vr_sports_configs_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
