const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('mini_configs', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    coin_powerball_3_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_powerball_5_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_ladder_3_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_ladder_5_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_1_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_2_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_3_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_4_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_5_close_time: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_powerball_3_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    coin_powerball_3_close_message: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    coin_powerball_5_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    coin_powerball_5_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    coin_ladder_3_status: {
      type: DataTypes.TINYINT,
      allowNull: true
    },
    coin_ladder_3_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    coin_ladder_5_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    coin_ladder_5_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eos_powerball_1_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    eos_powerball_1_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eos_powerball_2_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    eos_powerball_2_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eos_powerball_3_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    eos_powerball_3_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eos_powerball_4_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    eos_powerball_4_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    eos_powerball_5_status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    eos_powerball_5_close_message: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    coin_powerball_3_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_powerball_5_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_ladder_3_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    coin_ladder_5_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_1_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_2_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_3_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_4_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    eos_powerball_5_max_bet_count: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'mini_configs',
    schema: 'dbo',
    timestamps: false,
    indexes: [
      {
        name: "PK__mini_con__3213E83FBF9D4EAC",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
