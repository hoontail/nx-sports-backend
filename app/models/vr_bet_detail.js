const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "vr_bet_detail",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      vr_bet_history_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      odds_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      vr_sports_configs_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      league_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      vr_market_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      market_type: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      home_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      away_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      home_odds: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      draw_odds: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      away_odds: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      home_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      away_image: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      start_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      result_1: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      result_2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      result_3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      odds: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      bet_type: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      result_type: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      score: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      resulted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "vr_bet_detail",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "vr_bet_deatail_PK",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
