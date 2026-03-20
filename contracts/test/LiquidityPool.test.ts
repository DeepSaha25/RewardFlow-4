import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";

describe("AdvancedToken + LiquidityPool", function () {
  async function deployFixture() {
    const [owner, alice] = await ethers.getSigners();

    const tokenFactory = await ethers.getContractFactory("AdvancedToken");
    const token = await tokenFactory.deploy(owner.address);
    await token.waitForDeployment();

    const poolFactory = await ethers.getContractFactory("LiquidityPool");
    const pool = await poolFactory.deploy(await token.getAddress(), owner.address, 500);
    await pool.waitForDeployment();

    const minterRole = await token.MINTER_ROLE();
    await token.grantRole(minterRole, await pool.getAddress());

    await token.mint(alice.address, ethers.parseEther("1000"));

    return { owner, alice, token, pool };
  }

  it("handles deposit and withdraw with inter-contract mint reward", async function () {
    const { alice, token, pool } = await deployFixture();
    const depositAmount = ethers.parseEther("100");

    await token.connect(alice).approve(await pool.getAddress(), depositAmount);

    await expect(pool.connect(alice).deposit(depositAmount))
      .to.emit(pool, "Deposited")
      .withArgs(alice.address, depositAmount, anyValue);

    expect(await pool.stakeOf(alice.address)).to.equal(depositAmount);

    const before = await token.balanceOf(alice.address);

    await expect(pool.connect(alice).withdraw(depositAmount))
      .to.emit(pool, "Withdrawn");

    const after = await token.balanceOf(alice.address);
    const expectedReward = (depositAmount * 500n) / 10000n;

    expect(after - before).to.equal(depositAmount + expectedReward);
    expect(await pool.stakeOf(alice.address)).to.equal(0n);
  });

  it("allows owner to update reward rate", async function () {
    const { pool, owner } = await deployFixture();

    await expect(pool.connect(owner).setRewardRateBps(700))
      .to.emit(pool, "RewardRateUpdated");

    expect(await pool.rewardRateBps()).to.equal(700);
  });
});
