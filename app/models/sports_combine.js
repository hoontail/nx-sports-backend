const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sports_combine', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    game_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sports_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sports_name_kr: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    league_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    match_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    market_type_1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bet_type_1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    period_type_1: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    market_type_2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    bet_type_2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    period_type_2: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    error_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sports_combine',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "sports_combine_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
