const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('level_configs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    deposit_required: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    rolling_required: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    level_up_mileage: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    mileage_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    weekly_lossing_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    maximum_lossing_amount: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    rolling_casino_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    rolling_slot_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    rolling_mini_game_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    rolling_sports_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'level_configs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__level_co__3213E83F0A37F3BC",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
