const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rolling_points', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    system_note: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    admin_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    vendor_key: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    record_type: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    rolling_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    rolling_percentage2: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: false,
      defaultValue: 1
    },
    prev_rolling_point: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    bet_amount: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    is_rolling_distributed: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'rolling_points',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__rolling___3213E83F93783530",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
