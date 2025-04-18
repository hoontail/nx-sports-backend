const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "sports_market",
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
      market_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      period: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      is_cross: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_winlose: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_handicap: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_special: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      is_inplay: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "sports_market",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "sports_market_PK",
          unique: true,
          fields: [{ name: "id" }],
        },
      ],
    }
  );
};
