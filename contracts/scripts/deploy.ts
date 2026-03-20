import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with:", deployer.address);

  const tokenFactory = await ethers.getContractFactory("AdvancedToken");
  const token = await tokenFactory.deploy(deployer.address);
  await token.waitForDeployment();

  const poolFactory = await ethers.getContractFactory("LiquidityPool");
  const pool = await poolFactory.deploy(await token.getAddress(), deployer.address, 500);
  await pool.waitForDeployment();

  const minterRole = await token.MINTER_ROLE();
  const tx = await token.grantRole(minterRole, await pool.getAddress());
  await tx.wait();

  console.log("AdvancedToken deployed:", await token.getAddress());
  console.log("LiquidityPool deployed:", await pool.getAddress());
  console.log("MINTER_ROLE granted to pool tx:", tx.hash);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
