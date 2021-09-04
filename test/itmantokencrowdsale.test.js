const { expect } = require("chai");
const { ethers } = require("hardhat");

async function latestTime() {
  const block = await ethers.provider.getBlock("latest");
  return block.timestamp;
}

const duration = {
  seconds(val) {
    return val;
  },
  minutes(val) {
    return val * this.seconds(60);
  },
  hours(val) {
    return val * this.minutes(60);
  },
  days(val) {
    return val * this.hours(24);
  },
  weeks(val) {
    return val * this.days(7);
  },
  years(val) {
    return val * this.days(365);
  },
};

describe("ITManTokenCrowdsale", () => {
  it("Should have 70% of ITManToken tokens", async () => {
    const ITManToken = await ethers.getContractFactory("ITManToken");
    const itManToken = await ITManToken.deploy();
    await itManToken.deployed();

    expect(await itManToken.name()).to.equal("ITManToken");
    expect(await itManToken.symbol()).to.equal("ITM");
    expect(await itManToken.decimals()).to.equal(18);
    const totalSupply = await itManToken.totalSupply();
    expect(totalSupply).to.equal(ethers.BigNumber.from("1000000000000000000000000"));
    const owner = await itManToken.owner();

    const latestBlockTime = await latestTime();
    const openingTime = latestBlockTime + duration.minutes(1);
    const closeTime = openingTime + duration.weeks(1); // 1 week

    const ITManTokenCrowdsale = await ethers.getContractFactory("ITManTokenCrowdsale");
    const rate = 500; // 500 wei per token
    const itManTokenCrowdsale = await ITManTokenCrowdsale.deploy(
      rate,
      owner,
      itManToken.address,
      owner,
      openingTime,
      closeTime
    );

    await itManTokenCrowdsale.deployed();

    await itManToken.approve(
      itManTokenCrowdsale.address,
      totalSupply.mul(ethers.BigNumber.from(70)).div(ethers.BigNumber.from(100))
    );

    expect(await itManTokenCrowdsale.rate()).to.equal(rate);
    expect(await itManTokenCrowdsale.remainingTokens()).to.equal(ethers.BigNumber.from("700000000000000000000000"));
  });
  // TODO: add unit test for time validation
  // TODO: add unit test for token allocation
});
