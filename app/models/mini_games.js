const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "mini_games",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.BIGINT,
        allowNull: false,
        primaryKey: true,
      },
      game: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      minute: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date_round: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      start_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_result: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      result_data: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      resulted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "mini_games",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "mini_game_date_IDX",
          fields: [{ name: "date" }],
        },
        {
          name: "mini_game_date_round_IDX",
          fields: [{ name: "date_round" }],
        },
        {
          name: "mini_game_game_IDX",
          fields: [{ name: "game" }],
        },
        {
          name: "mini_game_minute_IDX",
          fields: [{ name: "minute" }],
        },
        {
          name: "mini_game_start_datetime_IDX",
          fields: [{ name: "start_datetime" }],
        },
        {
          name: "PK__mini_gam__3213E83FD538B2B6",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
