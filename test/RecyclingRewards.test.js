const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RecyclingRewards", function () {
  let contract, owner, station, user;

  beforeEach(async () => {
    [owner, station, user] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory("RecyclingRewards");
    contract = await Factory.deploy();
  });

  it("Deploy: 1M tokens en el contrato", async () => {
    const addr = await contract.getAddress();
    const bal = await contract.balanceOf(addr);
    expect(bal).to.equal(ethers.parseEther("1000000"));
  });

  it("Autorizar estación y registrar reciclaje", async () => {
    await contract.authorizeStation(station.address, true);
    await contract.connect(station).registerRecycling(user.address, 5);

    const [totalKg, , , tokenBalance] = await contract.getUserStats(user.address);
    expect(totalKg).to.equal(5);
    expect(tokenBalance).to.equal(ethers.parseEther("50")); // 5kg × 10 tokens
  });

  it("Rechazar estación no autorizada", async () => {
    await expect(
      contract.connect(station).registerRecycling(user.address, 5)
    ).to.be.revertedWith("Not an authorized station");
  });

  it("Rechazar 0 kg", async () => {
    await contract.authorizeStation(station.address, true);
    await expect(
      contract.connect(station).registerRecycling(user.address, 0)
    ).to.be.revertedWith("Must recycle at least 1 kg");
  });

  it("Solo owner puede autorizar estaciones", async () => {
    await expect(
      contract.connect(user).authorizeStation(station.address, true)
    ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
  });
});