const { expect } = require("chai");
const { ethers } = require("hardhat");

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

    const ITManTokenCrowdsale = await ethers.getContractFactory("ITManTokenCrowdsale");
    const rate = 500; // 500 wei per token
    const itManTokenCrowdsale = await ITManTokenCrowdsale.deploy(rate, owner, itManToken.address, owner);

    await itManTokenCrowdsale.deployed();

    await itManToken.approve(
      itManTokenCrowdsale.address,
      totalSupply.mul(ethers.BigNumber.from(70)).div(ethers.BigNumber.from(100))
    );

    expect(await itManTokenCrowdsale.rate()).to.equal(rate);
    expect(await itManTokenCrowdsale.remainingTokens()).to.equal(ethers.BigNumber.from("700000000000000000000000"));

    // send 500 wei to the crowdsale contract address
    const signer = await ethers.getSigner(1);
    await signer.sendTransaction({
      to: itManTokenCrowdsale.address,
      value: ethers.BigNumber.from(rate),
    });

    // check that the remaining tokens last than 70% of the total supply
    expect(await itManTokenCrowdsale.weiRaised()).to.equal(ethers.BigNumber.from(rate));
    expect(await itManTokenCrowdsale.remainingTokens()).to.equal(ethers.BigNumber.from("699999999999999999750000"));
    expect(await itManToken.balanceOf(signer.address)).to.equal(250000);
  });
});
