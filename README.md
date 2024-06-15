# NFT Marketplace

## Demo

Check out the [demo video](/link-to-your-video) on the Intro page to see the NFT Marketplace in action.

## Technology Stack & Tools

- Solidity (Writing Smart Contracts)
- JavaScript (React & Testing)
- [Ethers](https://docs.ethers.io/v5/) (Blockchain Interaction)
- [Hardhat](https://hardhat.org/) (Development Framework)
- [IPFS](https://ipfs.io/) (Metadata Storage)
- [React Router](https://v5.reactrouter.com/) (Navigational Components)
- [Redux](https://redux.js.org/) (State Management)

## Requirements For Initial Setup

- Install [NodeJS](https://nodejs.org/en/), should work with any node version below 16.5.0
- Install [Hardhat](https://hardhat.org/)

## Setting Up

### 1. Clone/Download the Repository

### 2. Install Dependencies:

```bash
$ cd nft_marketplace
$ npm install
```

### 3. Boot up local development blockchain

```bash
$ cd nft_marketplace
$ npx hardhat node
```

### 4. Connect development blockchain accounts to Metamask

- Copy the private key of the addresses and import them to Metamask.
- Connect your Metamask to the Hardhat blockchain, network 127.0.0.1:8545.
- If you have not added hardhat to the list of networks on your metamask, open up a browser, click the fox icon, then click the top center dropdown button that lists all the available networks then click add networks. A form should pop up. For the "Network Name" field enter "Hardhat". For the "New RPC URL" field enter "http://127.0.0.1:8545". For the chain ID enter "31337". Then click save.

### 5. Deploying to Sepolia

- Ensure you have Sepolia testnet selected in your Metamask.
- Deploy your smart contracts to Sepolia:
  ```bash
  $ npx hardhat run src/backend/scripts/deploy.js --network sepolia
  ```

### 6. Migrate Smart Contracts

For local deployment:

```bash
npx hardhat run src/backend/scripts/deploy.js --network localhost
```

### 7. Run Tests

```bash
$ npx hardhat test
```

### 8. Launch Frontend

```bash
$ npm run start
```

## Additional Notes

- Ensure you have configured Redux in your project for state management.
- For deploying to Sepolia, make sure you have the network configured in your Hardhat setup.

## License

MIT
