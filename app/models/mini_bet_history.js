const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "mini_bet_history",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      game: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
      mini_bet_type_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      odds: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      win_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      prev_balance: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      after_balance: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      is_delete: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      deleted_ip: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: Sequelize.Sequelize.fn("getdate"),
      },
      created_ip: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      resulted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "mini_bet_history",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "mini_bet_history_date_IDX",
          fields: [{ name: "date" }],
        },
        {
          name: "mini_bet_history_date_round_IDX",
          fields: [{ name: "date_round" }],
        },
        {
          name: "mini_bet_history_game_IDX",
          fields: [{ name: "game" }],
        },
        {
          name: "mini_bet_history_key_IDX",
          fields: [{ name: "key" }],
        },
        {
          name: "mini_bet_history_minute_IDX",
          fields: [{ name: "minute" }],
        },
        {
          name: "mini_bet_history_start_datetime_IDX",
          fields: [{ name: "start_datetime" }],
        },
        {
          name: "mini_bet_history_username_IDX",
          fields: [{ name: "username" }],
        },
        {
          name: "PK__mini_bet__3213E83F06849C4D",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
