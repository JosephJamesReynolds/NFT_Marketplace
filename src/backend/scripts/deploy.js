async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = await network.chainId;

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  // deploy contracts here:
  console.log("\nDeploying NFT Contract...");
  const nft = await ethers.deployContract("NFT");
  console.log("NFT contract deployed to:", nft.target);

  console.log("\nDeploying Marketplace contract...");
  const marketplace = await ethers.deployContract("Marketplace", [1]);
  console.log("Marketplace contract deployed to:", marketplace.target);

  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  console.log("\nSaving contract data for frontend...");
  saveFrontendFiles(marketplace, "Marketplace", chainId);
  saveFrontendFiles(nft, "NFT", chainId);

  const feePercent = await marketplace.feePercent();

  console.log("\n✅ Deployment completed successfully!");
  console.log("-----------------------------------");
  console.log("NFT Address:", nft.target);
  console.log("Marketplace Address:", marketplace.target);
  console.log("Chain ID:", chainId.toString());
  console.log("Fee Percent:", feePercent.toString(), "%");
}

function saveFrontendFiles(contract, name, chainId) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Create an object where the key is the chainId and the value is the contract address
  const chainIdString = chainId.toString();
  const addressFilePath = contractsDir + `/${name}-address.json`;

  let addressData = {};
  if (fs.existsSync(addressFilePath)) {
    const existingContent = fs.readFileSync(addressFilePath, "utf8");
    addressData = JSON.parse(existingContent);
  }

  addressData[chainIdString] = contract.target;

  fs.writeFileSync(addressFilePath, JSON.stringify(addressData, null, 2));

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );

  const path = require("path");
  const relativePath = path.relative(process.cwd(), contractsDir);
  console.log(`✅ ${name} saved to: ${relativePath}/`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
