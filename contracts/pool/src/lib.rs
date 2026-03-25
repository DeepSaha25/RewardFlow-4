#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Address, token::Client as TokenClient};

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

#[contract]
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

    /// Stake tokens in the pool
    pub fn stake(env: Env, user: Address, amount: i128) {
        user.require_auth();
        
        if amount <= 0 {
            panic!("amount must be positive");
        }
        
        let storage = env.storage().persistent();
        let token_address: Address = storage.get(&PoolDataKey::Token)
            .expect("Token not set");
        
        let token_client = TokenClient::new(&env, &token_address);
        token_client.transfer(&user, &env.current_contract_address(), &amount);
        
        let mut current_stake = storage.get::<_, i128>(&PoolDataKey::StakeOf(user.clone()))
            .unwrap_or(0i128);
        current_stake += amount;
        storage.set(&PoolDataKey::StakeOf(user), &current_stake);
        
        let mut total = storage.get::<_, i128>(&PoolDataKey::TotalStaked)
            .unwrap_or(0i128);
        total += amount;
        storage.set(&PoolDataKey::TotalStaked, &total);
    }

    /// Unstake tokens from the pool
    pub fn unstake(env: Env, user: Address, amount: i128) {
        user.require_auth();
        
        if amount <= 0 {
            panic!("amount must be positive");
        }
        
        let storage = env.storage().persistent();
        let current_stake = storage.get::<_, i128>(&PoolDataKey::StakeOf(user.clone()))
            .unwrap_or(0i128);
        
        if current_stake < amount {
            panic!("insufficient stake");
        }
        
        let token_address: Address = storage.get(&PoolDataKey::Token)
            .expect("Token not set");
        
        let token_client = TokenClient::new(&env, &token_address);
        token_client.transfer(&env.current_contract_address(), &user, &amount);
        
        storage.set(&PoolDataKey::StakeOf(user), &(current_stake - amount));
        
        let mut total = storage.get::<_, i128>(&PoolDataKey::TotalStaked)
            .unwrap_or(0i128);
        total -= amount;
        storage.set(&PoolDataKey::TotalStaked, &total);
    }
}
