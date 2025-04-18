const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "sports_odds",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      match_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      market_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_market_stop: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_odds_stop: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      odds_line: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      home_odds: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      draw_odds: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      away_odds: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      result: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_auto: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 1,
      },
      is_delete: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      odds_key: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sports_odds",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "sports_odds_match_id_IDX",
          fields: [{ name: "match_id" }],
        },
        {
          name: "sports_odds_PK",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "sports_odds_sports_market_id_IDX",
          fields: [{ name: "sports_market_id" }],
        },
      ],
    }
  );
};
