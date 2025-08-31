const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vr_rate_configs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    vr_sports_configs_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    winlose_rate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    winlose_sum: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    winlose_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    handicap_rate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    handicap_sum: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    handicap_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    underover_rate: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    underover_sum: {
      type: DataTypes.DECIMAL(5,2),
      allowNull: true
    },
    underover_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vr_rate_configs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "vr_rate_configs_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
