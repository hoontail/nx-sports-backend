const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vr_bonus_odds', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    folder_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    home_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    away_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    odds: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    min_odds: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    error_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vr_bonus_odds',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "vr_bonus_odds_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
