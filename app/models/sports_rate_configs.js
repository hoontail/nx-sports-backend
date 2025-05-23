const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "sports_rate_configs",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      sports_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      sports_name_kr: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      normal_winlose_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      normal_winlose_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      normal_winlose_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      normal_handicap_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      normal_handicap_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      normal_handicap_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      normal_underover_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      normal_underover_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      normal_underover_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      special_winlose_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      special_winlose_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      special_winlose_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      special_handicap_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      special_handicap_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      special_handicap_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      special_underover_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      special_underover_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      special_underover_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      inplay_winlose_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      inplay_winlose_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      inplay_winlose_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      inplay_handicap_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      inplay_handicap_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      inplay_handicap_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      inplay_underover_rate: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      inplay_underover_sum: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true,
      },
      inplay_underover_status: {
        type: DataTypes.TINYINT,
        allowNull: true,
        defaultValue: 0,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sports_rate_configs",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__sports_r__3213E83FF74A4408",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
