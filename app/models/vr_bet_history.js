const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vr_bet_history', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    username: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    key: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    bet_amount: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_odds: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    bonus_odds: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    win_amount: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 0
    },
    prev_balance: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    after_balance: {
      type: DataTypes.INTEGER,
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
    deleted_ip: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('getdate')
    },
    created_ip: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    resulted_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'vr_bet_history',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "vr_bet_history_created_at_IDX",
        fields: [
          { name: "created_at" },
        ]
      },
      {
        name: "vr_bet_history_key_IDX",
        fields: [
          { name: "key" },
        ]
      },
      {
        name: "vr_bet_history_PK",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "vr_bet_history_status_IDX",
        fields: [
          { name: "status" },
        ]
      },
      {
        name: "vr_bet_history_username_IDX",
        fields: [
          { name: "username" },
        ]
      },
    ]
  });
};
