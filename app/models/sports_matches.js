const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('sports_matches', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    match_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    sports_name: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    sports_name_kr: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    prematch_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    inplay_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status_kr: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    period_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    period_kr: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    is_inplay_ing: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    league_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    league_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    league_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    home_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    home_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    home_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    away_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    away_name: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    away_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_kr: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    country_image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    start_datetime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    score: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_delete: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    is_hot: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    is_result: {
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
    tableName: 'sports_matches',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "sports_matches_is_hot_IDX",
        fields: [
          { name: "is_hot" },
        ]
      },
      {
        name: "sports_matches_league_id_IDX",
        fields: [
          { name: "league_id" },
        ]
      },
      {
        name: "sports_matches_match_id_IDX",
        fields: [
          { name: "match_id" },
        ]
      },
      {
        name: "sports_matches_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "sports_matches_sports_name_IDX",
        fields: [
          { name: "sports_name" },
        ]
      },
      {
        name: "sports_matches_start_datetime_IDX",
        fields: [
          { name: "start_datetime" },
        ]
      },
    ]
  });
};
