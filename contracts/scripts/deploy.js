const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying with account:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", hre.ethers.formatEther(balance), "MATIC");

    const RecyclingRewards = await hre.ethers.getContractFactory("RecyclingRewards");
    const contract = await RecyclingRewards.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("RecyclingRewards deployed to:", address);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
