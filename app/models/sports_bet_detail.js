const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sports_bet_detail', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    sports_bet_history_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sports_odds_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sports_market_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sports_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sports_name_kr: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country_kr: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    country_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    home_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    home_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    away_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    away_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    league_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    league_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    score: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    start_datetime: {
      type: DataTypes.DATE,
      allowNull: false
    },
    home_odds: {
      type: DataTypes.DECIMAL(38,2),
      allowNull: true
    },
    draw_odds: {
      type: DataTypes.DECIMAL(38,2),
      allowNull: true
    },
    away_odds: {
      type: DataTypes.DECIMAL(38,2),
      allowNull: true
    },
    odds_line: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    odds: {
      type: DataTypes.DECIMAL(38,2),
      allowNull: false
    },
    bet_type: {
      type: DataTypes.TINYINT,
      allowNull: false
    },
    result_type: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    resulted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'sports_bet_detail',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "sports_bet_detail_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
