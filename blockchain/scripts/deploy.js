const hre = require("hardhat");

async function main() {
  console.log("Deploying AnonymousIncidentReporting contract...");

  // Get the contract factory
  const AnonymousIncidentReporting = await hre.ethers.getContractFactory("AnonymousIncidentReporting");
  
  // Deploy the contract
  const contract = await AnonymousIncidentReporting.deploy();
  
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  
  console.log("✅ Contract deployed to:", contractAddress);
  console.log("Network:", hre.network.name);
  console.log("Deployer:", (await hre.ethers.getSigners())[0].address);
  
  // Save contract address and ABI for backend integration
  const fs = require("fs");
  const path = require("path");
  
  const deploymentData = {
    network: hre.network.name,
    contractAddress: contractAddress,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address,
  };
  
  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, `${hre.network.name}.json`),
    JSON.stringify(deploymentData, null, 2)
  );
  
  console.log("\n📄 Deployment data saved to deployments/" + hre.network.name + ".json");
  
  // Copy ABI for backend
  const artifactPath = path.join(__dirname, "..", "artifacts", "contracts", "AnonymousIncidentReporting.sol", "AnonymousIncidentReporting.json");
  const backendAbiPath = path.join(__dirname, "..", "..", "backend", "monitoring", "contract_abi.json");
  
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    fs.writeFileSync(backendAbiPath, JSON.stringify(artifact.abi, null, 2));
    console.log("✅ ABI copied to backend/monitoring/contract_abi.json");
  }
  
  // If deploying to testnet, verify on Etherscan
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("\n⏳ Waiting 30 seconds before verifying contract on Etherscan...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan");
    } catch (error) {
      console.log("⚠️  Verification failed:", error.message);
    }
  }
  
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Add contract address to backend .env file:");
  console.log(`   BLOCKCHAIN_CONTRACT_ADDRESS=${contractAddress}`);
  console.log("2. Update BLOCKCHAIN_RPC_URL in backend .env");
  console.log("3. Authorize rangers using authorizeRanger() function");
  console.log("4. Add funds to reward pool using addRewardPool()");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
