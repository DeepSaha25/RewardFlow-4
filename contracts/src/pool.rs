use soroban_sdk::{contractimpl, contracttype, Env, Address, token::Client as TokenClient};

const LEDGER_THRESHOLD: u32 = 3110400; // ~6 months

#[derive(Clone)]
#[contracttype]
pub enum PoolDataKey {
    Token,
    Owner,
    RewardRateBps,
    TotalStaked,
    StakeOf(Address),
}

pub struct Pool;

#[contractimpl]
impl Pool {
    /// Initialize liquidity pool
    pub fn init(env: Env, token_address: Address, owner: Address, initial_reward_rate_bps: u32) {
        let storage = env.storage().persistent();
        
        if storage.has(&PoolDataKey::Owner) {
            panic!("Pool already initialized");
        }

        if initial_reward_rate_bps > 10_000 {
            panic!("invalid rate");
        }

        storage.set(&PoolDataKey::Token, &token_address);
        storage.set(&PoolDataKey::Owner, &owner);
        storage.set(&PoolDataKey::RewardRateBps, &initial_reward_rate_bps);
        storage.set(&PoolDataKey::TotalStaked, &0i128);

        env.storage().persistent().extend_ttl(&PoolDataKey::Owner, 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&PoolDataKey::Token, 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&PoolDataKey::RewardRateBps, 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&PoolDataKey::TotalStaked, 0, LEDGER_THRESHOLD);
    }

    /// Get total staked amount
    pub fn total_staked(env: Env) -> i128 {
        let storage = env.storage().persistent();
        storage.get(&PoolDataKey::TotalStaked)
            .unwrap_or(0i128)
    }

    /// Get user stake amount
    pub fn stake_of(env: Env, user: Address) -> i128 {
        let storage = env.storage().persistent();
        storage.get(&PoolDataKey::StakeOf(user))
            .unwrap_or(0i128)
    }

    /// Get reward rate (basis points)
    pub fn reward_rate_bps(env: Env) -> u32 {
        let storage = env.storage().persistent();
        storage.get(&PoolDataKey::RewardRateBps)
            .unwrap_or(0u32)
    }

    /// Deposit tokens into pool
    pub fn deposit(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("amount=0");
        }

        let storage = env.storage().persistent();
        let token = storage.get::<PoolDataKey, Address>(&PoolDataKey::Token)
            .unwrap_or_else(|| panic!("Token not initialized"));

        // Transfer tokens from user to pool
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&user, &env.current_contract_address(), &amount);

        // Update stake
        let current_stake = storage.get::<PoolDataKey, i128>(&PoolDataKey::StakeOf(user.clone()))
            .unwrap_or(0i128);
        storage.set(&PoolDataKey::StakeOf(user.clone()), &(current_stake + amount));

        // Update total
        let total = storage.get::<PoolDataKey, i128>(&PoolDataKey::TotalStaked)
            .unwrap_or(0i128);
        storage.set(&PoolDataKey::TotalStaked, &(total + amount));

        env.storage().persistent().extend_ttl(&PoolDataKey::StakeOf(user.clone()), 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&PoolDataKey::TotalStaked, 0, LEDGER_THRESHOLD);

        // Emit event
        let ts = env.ledger().timestamp();
        env.events().publish(
            ("Deposited",),
            (user, amount, ts),
        );
    }

    /// Withdraw tokens from pool and receive rewards
    pub fn withdraw(env: Env, user: Address, amount: i128) {
        user.require_auth();

        if amount <= 0 {
            panic!("amount=0");
        }

        let storage = env.storage().persistent();
        
        // Check stake
        let user_stake = storage.get::<PoolDataKey, i128>(&PoolDataKey::StakeOf(user.clone()))
            .unwrap_or(0i128);
        if user_stake < amount {
            panic!("insufficient stake");
        }

        // Get token and reward rate
        let token = storage.get::<PoolDataKey, Address>(&PoolDataKey::Token)
            .unwrap_or_else(|| panic!("Token not initialized"));
        let reward_rate = storage.get::<PoolDataKey, u32>(&PoolDataKey::RewardRateBps)
            .unwrap_or(0u32);

        // Calculate reward
        let reward = (amount as u128 * reward_rate as u128 / 10_000u128) as i128;

        // Update stake
        storage.set(&PoolDataKey::StakeOf(user.clone()), &(user_stake - amount));

        // Update total
        let total = storage.get::<PoolDataKey, i128>(&PoolDataKey::TotalStaked)
            .unwrap_or(0i128);
        storage.set(&PoolDataKey::TotalStaked, &(total - amount));

        env.storage().persistent().extend_ttl(&PoolDataKey::StakeOf(user.clone()), 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&PoolDataKey::TotalStaked, 0, LEDGER_THRESHOLD);

        // Transfer staked amount back to user
        let token_client = TokenClient::new(&env, &token);
        token_client.transfer(&env.current_contract_address(), &user, &amount);

        // Note: Rewards are calculated but not automatically minted
        // Pool must have MINTER_ROLE to mint rewards via separate admin call

        // Emit event
        let ts = env.ledger().timestamp();
        env.events().publish(
            ("Withdrawn",),
            (user, amount, reward, ts),
        );
    }

    /// Update reward rate (owner only)
    pub fn set_reward_rate_bps(env: Env, new_rate_bps: u32) {
        let storage = env.storage().persistent();
        let owner = storage.get::<PoolDataKey, Address>(&PoolDataKey::Owner)
            .unwrap_or_else(|| panic!("Owner not initialized"));

        owner.require_auth();

        if new_rate_bps > 10_000 {
            panic!("invalid rate");
        }

        storage.set(&PoolDataKey::RewardRateBps, &new_rate_bps);
        env.storage().persistent().extend_ttl(&PoolDataKey::RewardRateBps, 0, LEDGER_THRESHOLD);

        let ts = env.ledger().timestamp();
        env.events().publish(
            ("RewardRateUpdated",),
            (new_rate_bps, ts),
        );
    }
}
