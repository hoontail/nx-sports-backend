const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "sports_configs",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      single_min_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      multi_min_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      single_max_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      multi_max_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      single_max_win_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      multi_max_win_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cancel_after_bet_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cancel_before_start_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cancel_daily_count: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cancel_message: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      single_minus_odds: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      two_minus_odds: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      alert_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      lose_point_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      single_max_win_odds: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      multi_max_win_odds: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sports_configs",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "sports_configs_PK",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
