const { ethers } = require("hardhat");
const fs = require("fs");

async function main() {
  const [deployer] = await ethers.getSigners();
  const balance = await deployer.provider.getBalance(deployer.address);

  console.log("📦 Deploying from:", deployer.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "MATIC");

  if (balance === 0n) {
    throw new Error("❌ Sin MATIC. Ve al faucet: https://faucet.polygon.technology");
  }

  const Factory = await ethers.getContractFactory("RecyclingRewards");
  console.log("⏳ Desplegando...");
  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("✅ Contrato desplegado en:", address);
  console.log("🔗 Explorer:", `https://amoy.polygonscan.com/address/${address}`);

  // Guardar dirección para el frontend (Sprint 2)
  fs.writeFileSync(
    "./deployed-addresses.json",
    JSON.stringify({ RecyclingRewards: address, network: "polygonAmoy", deployedAt: new Date().toISOString() }, null, 2)
  );
  console.log("💾 Dirección guardada en deployed-addresses.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});