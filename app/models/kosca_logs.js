const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('kosca_logs', {
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    game_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true
    },
    bet_data: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    transaction_id: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_by_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    updated_by_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    session: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    bet_result: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true
    },
    rolling_point: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true
    },
    rolling_point_percentage: {
      type: DataTypes.DECIMAL(5,3),
      allowNull: true
    },
    cancel_amount: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true
    },
    game_category: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    req_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    purchase_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reserve_id: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    net_loss: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true
    },
    bet_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    save_log_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    origin_idx: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    rollingStatus: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    bet_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    is_live: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    },
    odds_total: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true,
      defaultValue: 0
    },
    expected_amount: {
      type: DataTypes.DECIMAL(20,2),
      allowNull: true,
      defaultValue: 0
    },
    bti_number: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'kosca_logs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__kosca_lo__3213E83F9ACAA472",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
