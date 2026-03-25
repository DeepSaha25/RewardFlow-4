use soroban_sdk::{contractimpl, contracttype, Env, Symbol, Address};

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

    /// Get user balance
    pub fn balance_of(env: Env, account: Address) -> i128 {
        let storage = env.storage().persistent();
        storage.get(&TokenDataKey::Balance(account))
            .unwrap_or(0i128)
    }

    /// Mint tokens (requires MINTER_ROLE)
    pub fn mint(env: Env, caller: Address, to: Address, amount: i128) {
        let storage = env.storage().persistent();
        caller.require_auth();
        
        // Check if caller has MINTER_ROLE
        if !storage.get::<TokenDataKey, bool>(&TokenDataKey::MinterRole(caller))
            .unwrap_or(false) {
            panic!("Caller does not have MINTER_ROLE");
        }

        if amount <= 0 {
            panic!("amount=0");
        }

        // Verify not paused
        let paused = storage.get::<TokenDataKey, bool>(&TokenDataKey::Paused)
            .unwrap_or(false);
        if paused {
            panic!("Token is paused");
        }

        // Update balance
        let current_balance = storage.get::<TokenDataKey, i128>(&TokenDataKey::Balance(to.clone()))
            .unwrap_or(0i128);
        storage.set(&TokenDataKey::Balance(to.clone()), &(current_balance + amount));

        // Update total supply
        let total = storage.get::<TokenDataKey, i128>(&TokenDataKey::TotalSupply)
            .unwrap_or(0i128);
        storage.set(&TokenDataKey::TotalSupply, &(total + amount));
        
        let ts = env.ledger().timestamp();

        // Extend TTL
        env.storage().persistent().extend_ttl(&TokenDataKey::Balance(to.clone()), 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&TokenDataKey::TotalSupply, 0, LEDGER_THRESHOLD);
        
        // Emit event
        env.events().publish(
            ("Mint",),
            (to, amount, ts),
        );
    }

    /// Transfer tokens
    pub fn transfer(env: Env, from: Address, to: Address, amount: i128) {
        from.require_auth();

        let storage = env.storage().persistent();

        // Check paused
        let paused = storage.get::<TokenDataKey, bool>(&TokenDataKey::Paused)
            .unwrap_or(false);
        if paused {
            panic!("Token is paused");
        }

        if amount <= 0 {
            panic!("amount=0");
        }

        // Check balance
        let from_balance = storage.get::<TokenDataKey, i128>(&TokenDataKey::Balance(from.clone()))
            .unwrap_or(0i128);
        if from_balance < amount {
            panic!("insufficient balance");
        }

        // Update balances
        storage.set(&TokenDataKey::Balance(from.clone()), &(from_balance - amount));
        let to_balance = storage.get::<TokenDataKey, i128>(&TokenDataKey::Balance(to.clone()))
            .unwrap_or(0i128);
        storage.set(&TokenDataKey::Balance(to.clone()), &(to_balance + amount));

        // Extend TTL
        env.storage().persistent().extend_ttl(&TokenDataKey::Balance(from.clone()), 0, LEDGER_THRESHOLD);
        env.storage().persistent().extend_ttl(&TokenDataKey::Balance(to.clone()), 0, LEDGER_THRESHOLD);

        env.events().publish(
            ("Transfer",),
            (from, to, amount),
        );
    }

    /// Approve spender
    pub fn approve(env: Env, from: Address, spender: Address, amount: i128) {
        from.require_auth();

        let storage = env.storage().persistent();
        storage.set(&TokenDataKey::Allowance(from.clone(), spender.clone()), &amount);
        
        env.storage().persistent().extend_ttl(&TokenDataKey::Allowance(from.clone(), spender.clone()), 0, LEDGER_THRESHOLD);

        env.events().publish(
            ("Approve",),
            (from, spender, amount),
        );
    }

    /// Get allowance
    pub fn allowance(env: Env, from: Address, spender: Address) -> i128 {
        let storage = env.storage().persistent();
        storage.get(&TokenDataKey::Allowance(from, spender))
            .unwrap_or(0i128)
    }

    /// Grant MINTER_ROLE
    pub fn grant_minter(env: Env, to: Address) {
        let storage = env.storage().persistent();
        let admin = storage.get::<TokenDataKey, Address>(&TokenDataKey::Admin)
            .unwrap_or_else(|| panic!("Admin not set"));
        
        admin.require_auth();
        storage.set(&TokenDataKey::MinterRole(to.clone()), &true);
    }

    /// Pause token (requires PAUSER_ROLE)
    pub fn pause(env: Env, pauser: Address) {
        let storage = env.storage().persistent();
        pauser.require_auth();
        
        if !storage.get::<TokenDataKey, bool>(&TokenDataKey::PauserRole(pauser))
            .unwrap_or(false) {
            panic!("Caller does not have PAUSER_ROLE");
        }

        storage.set(&TokenDataKey::Paused, &true);
        env.storage().persistent().extend_ttl(&TokenDataKey::Paused, 0, LEDGER_THRESHOLD);
    }

    /// Unpause token (requires PAUSER_ROLE)
    pub fn unpause(env: Env, pauser: Address) {
        let storage = env.storage().persistent();
        pauser.require_auth();
        
        if !storage.get::<TokenDataKey, bool>(&TokenDataKey::PauserRole(pauser))
            .unwrap_or(false) {
            panic!("Caller does not have PAUSER_ROLE");
        }

        storage.set(&TokenDataKey::Paused, &false);
        env.storage().persistent().extend_ttl(&TokenDataKey::Paused, 0, LEDGER_THRESHOLD);
    }

    /// Check if paused
    pub fn is_paused(env: Env) -> bool {
        let storage = env.storage().persistent();
        storage.get::<TokenDataKey, bool>(&TokenDataKey::Paused)
            .unwrap_or(false)
    }
}
