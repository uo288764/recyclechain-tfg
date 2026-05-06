// scripts/authorizeOperator.js
const hre = require("hardhat");

async function main() {
    const CONTRACT_ADDRESS = "0x662fEf246bd13DCfeD3f9F82A0efbea1586daA77";
    const OPERATOR_ADDRESS = "0xF50dFa41B6C936aa42DE30C6Ee630a012e6393c1";

    const contract = await hre.ethers.getContractAt("RecyclingRewards", CONTRACT_ADDRESS);
    
    console.log("Authorizing operator...");
    const tx = await contract.authorizeStation(OPERATOR_ADDRESS, true);
    await tx.wait();
    
    console.log("✅ Operator authorized:", OPERATOR_ADDRESS);
    console.log("🔗 Tx:", tx.hash);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
