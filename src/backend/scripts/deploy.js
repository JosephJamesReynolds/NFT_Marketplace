async function main() {
  const [deployer] = await ethers.getSigners();
  const chainId = await deployer.getChainId();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  // deploy contracts here:
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy();
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(1);

  console.log("NFT contract address", nft.address);
  console.log("Marketplace contract address", marketplace.address);

  // For each contract, pass the deployed contract and name to this function to save a copy of the contract ABI and address to the front end.
  saveFrontendFiles(marketplace, "Marketplace", chainId);
  saveFrontendFiles(nft, "NFT", chainId);
}

function saveFrontendFiles(contract, name, chainId) {
  const fs = require("fs");
  const contractsDir = __dirname + "/../../frontend/contractsData";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  // Create an object where the key is the chainId and the value is the contract address
  const data = {};
  data[chainId] = contract.address;

  fs.writeFileSync(
    contractsDir + `/${name}-address.json`,
    JSON.stringify(data, undefined, 2)
  );

  const contractArtifact = artifacts.readArtifactSync(name);

  fs.writeFileSync(
    contractsDir + `/${name}.json`,
    JSON.stringify(contractArtifact, null, 2)
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
