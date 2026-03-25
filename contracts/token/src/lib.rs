#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Env, Symbol, Address};

const LEDGER_THRESHOLD: u32 = 3110400; // ~6 months

#[derive(Clone)]
#[contracttype]
pub enum TokenDataKey {
    Balance(Address),
    Allowance(Address, Address),
    Admin,
    TotalSupply,
    Paused,
    MinterRole(Address),
    PauserRole(Address),
}

#[contract]
pub struct Token;

#[contractimpl]
impl Token {
    /// Initialize token with admin
    pub fn init(env: Env, admin: Address) {
        let storage = env.storage().persistent();
        
        if storage.has(&TokenDataKey::Admin) {
            panic!("Token already initialized");
        }
        
        storage.set(&TokenDataKey::Admin, &admin);
        storage.set(&TokenDataKey::TotalSupply, &0i128);
        storage.set(&TokenDataKey::Paused, &false);
        storage.set(&TokenDataKey::MinterRole(admin.clone()), &true);
        storage.set(&TokenDataKey::PauserRole(admin.clone()), &true);
        
        env.storage().persistent().extend_ttl(&TokenDataKey::Admin, 0, LEDGER_THRESHOLD);
    }

    /// Get token symbol
    pub fn symbol(_env: Env) -> Symbol {
        Symbol::new(&_env, "L4ST")
    }

    /// Get token name
    pub fn name(_env: Env) -> Symbol {
        Symbol::new(&_env, "Level4 Stellar Token")
    }

    /// Get token decimals
    pub fn decimals(_env: Env) -> u32 {
        7
    }

    /// Get total supply
    pub fn total_supply(env: Env) -> i128 {
        let storage = env.storage().persistent();
        storage.get(&TokenDataKey::TotalSupply)
            .unwrap_or(0i128)
    }

    /// Get balance of an address
    pub fn balance_of(env: Env, account: Address) -> i128 {
        env.storage().persistent()
            .get(&TokenDataKey::Balance(account))
            .unwrap_or(0i128)
    }

    /// Get allowance for spender
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        env.storage().persistent()
            .get(&TokenDataKey::Allowance(from, spender))
            .unwrap_or(0i128)
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();
        
        if amount <= 0 {
            panic!("amount must be positive");
        }
        
        let storage = env.storage().persistent();
        let from_balance = storage.get::<_, i128>(&TokenDataKey::Balance(from.clone()))
            .unwrap_or(0i128);
        
        if from_balance < amount {
            panic!("insufficient balance");
        }
        
        storage.set(&TokenDataKey::Balance(from), &(from_balance - amount));
        
        let to_balance = storage.get::<_, i128>(&TokenDataKey::Balance(to.clone()))
            .unwrap_or(0i128);
        storage.set(&TokenDataKey::Balance(to), &(to_balance + amount));
    }

    /// Approve spender
    pub fn approve(env: Env, from: Address, spender: Address, amount: i128) {
        from.require_auth();
        let storage = env.storage().persistent();
        storage.set(&TokenDataKey::Allowance(from, spender), &amount);
    }

    /// Mint tokens (only minter role)
    pub fn mint(env: Env, to: Address, amount: i128) {
        let storage = env.storage().persistent();
        let admin = storage.get::<_, Address>(&TokenDataKey::Admin)
            .expect("Admin not set");
        
        admin.require_auth();
        
        if !storage.get::<_, bool>(&TokenDataKey::MinterRole(admin.clone()))
            .unwrap_or(false) {
            panic!("caller is not a minter");
        }
        
        if amount <= 0 {
            panic!("amount must be positive");
        }
        
        let to_balance = storage.get::<_, i128>(&TokenDataKey::Balance(to.clone()))
            .unwrap_or(0i128);
        storage.set(&TokenDataKey::Balance(to), &(to_balance + amount));
        
        let mut total_supply = storage.get::<_, i128>(&TokenDataKey::TotalSupply)
            .unwrap_or(0i128);
        total_supply += amount;
        storage.set(&TokenDataKey::TotalSupply, &total_supply);
    }

    /// Pause token transfers (only pauser role)
    pub fn pause(env: Env) {
        let storage = env.storage().persistent();
        let admin = storage.get::<_, Address>(&TokenDataKey::Admin)
            .expect("Admin not set");
        
        admin.require_auth();
        
        if !storage.get::<_, bool>(&TokenDataKey::PauserRole(admin))
            .unwrap_or(false) {
            panic!("caller is not a pauser");
        }
        
        storage.set(&TokenDataKey::Paused, &true);
    }

    /// Resume token transfers
    pub fn resume(env: Env) {
        let storage = env.storage().persistent();
        let admin = storage.get::<_, Address>(&TokenDataKey::Admin)
            .expect("Admin not set");
        
        admin.require_auth();
        storage.set(&TokenDataKey::Paused, &false);
    }
}
