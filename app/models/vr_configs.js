const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vr_configs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    single_min_bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    multi_min_bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    single_max_bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    multi_max_bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    single_max_win_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    multi_max_win_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    single_max_win_odds: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    multi_max_win_odds: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vr_configs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "vr_configs_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
