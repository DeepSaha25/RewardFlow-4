export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function symbol() external view returns (string)",
  "event Transfer(address indexed from, address indexed to, uint256 value)"
];

export const POOL_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function rewardRateBps() external view returns (uint256)",
  "function stakeOf(address user) external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "event Deposited(address indexed user, uint256 amount, uint256 timestamp)",
  "event Withdrawn(address indexed user, uint256 amount, uint256 reward, uint256 timestamp)"
];

export const tokenAddress = import.meta.env.VITE_TOKEN_ADDRESS as string;
export const poolAddress = import.meta.env.VITE_POOL_ADDRESS as string;
export const rpcUrl = (import.meta.env.VITE_RPC_URL as string) || "https://ethereum-sepolia-rpc.publicnode.com";
