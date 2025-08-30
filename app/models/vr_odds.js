const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "vr_odds",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      odds_key: {
        type: DataTypes.STRING(255),
        allowNull: true,
        unique: "vr_odds_UN",
      },
      match_id: {
        type: DataTypes.INTEGER,
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
      league_id: {
        type: DataTypes.INTEGER,
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
      status: {
        type: DataTypes.STRING(100),
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
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("getdate"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "vr_odds",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "vr_odds_league_name_IDX",
          fields: [{ name: "league_name" }],
        },
        {
          name: "vr_odds_PK",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "vr_odds_start_datetime_IDX",
          fields: [{ name: "start_datetime" }],
        },
        {
          name: "vr_odds_vr_sports_configs_id_IDX",
          fields: [{ name: "vr_sports_configs_id" }],
        },
        {
          name: "vr_odds_UN",
          unique: true,
          fields: [{ name: "odds_key" }],
        },
      ],
    }
  );
};
