const Sequelize = require("sequelize");
module.exports = function (sequelize, DataTypes) {
  return sequelize.define(
    "up_users",
    {
      id: {
        autoIncrement: true,
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: "UQ_Username",
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      reset_password_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      confirmation_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      confirmed: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      blocked: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.Sequelize.fn("getdate"),
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      created_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      updated_by_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      last_login: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      account_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      account_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      bank_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      phone_number: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      admin_level: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      user_level: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      last_bet_datetime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rolling_point: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      lossing_point: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      tree_depth: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      balance: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      mileage: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      user_status: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      system_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      nickname: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tple_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      last_active_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      rolling_point_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "LEVEL",
      },
      lossing_point_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "LEVEL",
      },
      lossing_point_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      tple_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      decode_password: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      rolling_slot_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
        defaultValue: 0,
      },
      rolling_mini_game_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
        defaultValue: 0,
      },
      rolling_sports_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
        defaultValue: 0,
      },
      rolling_casino_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
        defaultValue: 0,
      },
      user_real_name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      referral_point: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      birthday: {
        type: DataTypes.DATEONLY,
        allowNull: true,
      },
      user_memo_1: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_memo_2: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_memo_3: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_memo_4: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_memo_5: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      user_memo_6: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      sunday_balance: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      failed_login_attempts: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      deposit_total: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      withdrawal_total: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      agent_rolling_point: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      agent_rolling_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      agent_lossing_point: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      agent_lossing_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      settlement_cycle: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      settlement_cycle_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bet_total: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      level_type: {
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "AUTO",
      },
      dw_sum: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      bw_sum: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      token_uid: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      referral: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      agent_id: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      role: {
        type: DataTypes.STRING(45),
        allowNull: true,
      },
      referral_username: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      agent_username: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      role_name: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      token_expired: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      path: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      parentID: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bti_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tgame_token: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      initial_bet_total: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: false,
        defaultValue: 0,
      },
      ihn_balance: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      user_grade: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      agent_coupon: {
        type: DataTypes.STRING(1),
        allowNull: false,
        defaultValue: "0",
      },
      agent_rolling_slot_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      agent_rolling_mini_game_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      agent_rolling_sports_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      agent_rolling_casino_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      agent_lossing_point_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: false,
        defaultValue: 0,
      },
      evo_balance: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      sort_balance_order: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      agent_balance_total: {
        type: DataTypes.DECIMAL(38, 0),
        allowNull: true,
        defaultValue: 0,
      },
      agent_withdrawal_total: {
        type: DataTypes.DECIMAL(38, 2),
        allowNull: true,
        defaultValue: 0,
      },
      w_network: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      w_wallet_address: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      user_grade_day: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      local_deposit_method: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      local_usdt_deposit_mileage_onoff: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      local_usdt_min_deposit_amount: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      local_usdt_accumulation: {
        type: DataTypes.DECIMAL(20, 2),
        allowNull: true,
        defaultValue: 0,
      },
      local_usdt_point: {
        type: DataTypes.DECIMAL(18, 2),
        allowNull: false,
        defaultValue: 0,
      },
      local_rolling_per: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rolling_payment_onoff: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rolling_payment_live: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      rolling_payment_slot: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      rolling_payment_sports: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      rolling_payment_minigame: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      rolling_payment_fishing: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      rolling_payment_board: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      rolling_payment_etc: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 100,
      },
      deposit_bank_nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "(Nbank",
      },
      deposit_bank_name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "(N라이브챗 문의 부탁드립니다",
      },
      deposit_bank_account: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "(N-",
      },
      deposit_bank_holdername: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "(N-",
      },
      deposit_usdt_nickname: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "(NUSDT",
      },
      deposit_usdt_network: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "(N라이브챗 문의 부탁드립니다",
      },
      deposit_usdt_wallet: {
        type: DataTypes.STRING(500),
        allowNull: false,
        defaultValue: "(N-",
      },
      local_grade_config: {
        type: DataTypes.STRING(100),
        allowNull: true,
        defaultValue: "automatic",
      },
      sports_single_min_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sports_multi_min_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sports_single_max_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sports_multi_max_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sports_single_max_win_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sports_multi_max_win_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sports_single_rolling_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
      },
      sports_multi_rolling_percentage: {
        type: DataTypes.DECIMAL(5, 3),
        allowNull: true,
      },
      mini_min_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mini_max_bet_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      mini_max_win_amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      tableName: "up_users",
      schema: "dbo",
      timestamps: false,
      indexes: [
        {
          name: "PK__up_users__3213E83F6BC6A4D9",
          unique: true,
          fields: [{ name: "id" }],
        },
        {
          name: "UQ_Username",
          unique: true,
          fields: [{ name: "username" }],
        },
      ],
    }
  );
};
