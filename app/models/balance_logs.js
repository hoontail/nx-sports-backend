const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "balance_logs",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      system_note: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      admin_id: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      record_type: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      prev_balance: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      after_balance: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
      },
      game_id: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      game_category: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "balance_logs",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__balance___3213E83F9F7D172C",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
