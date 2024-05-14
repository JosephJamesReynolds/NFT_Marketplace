import { ethers } from "ethers";

import { setProvider, setNetwork, setAccount } from "./reducers/provider";

import { setContracts } from "./reducers/nft";

import {
  setContract,
  startCreating,
  createSuccess,
  createFailure,
  startBuying,
  buySuccess,
  buyFailure,
} from "./reducers/marketplace";

import NFTAbi from "../../contractsData/NFT.json";
import NFTaddress from "../../contractsData/NFT-address.json";
import MarketplaceAbi from "../../contractsData/Marketplace.json";
import MarketplaceAddress from "../../contractsData/Marketplace-address.json";

export const loadProvider = (dispatch) => {
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  dispatch(setProvider(provider));

  return provider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId));

  return chainId;
};

export const loadAccount = async (dispatch) => {
  // Fetch Accounts
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.utils.getAddress(accounts[0]);
  dispatch(setAccount(account));

  return account;
};

//-----------------------------------
// LOAD CONTRACTS
// - Load NFT Contract
export const loadNFT = async (provider, chainId, dispatch) => {
  console.log("NFTAbi:", NFTAbi); // log the NFTAbi
  console.log(`NFTaddress[${chainId}]:`, NFTaddress[chainId]); // log the NFTaddress for the current chainId

  const nft = new ethers.Contract(NFTaddress[chainId], NFTAbi, provider);
  dispatch(setContracts(nft));

  return nft;
};

export const loadMarketplace = async (provider, chainId, dispatch) => {
  console.log("MarketplaceAbi:", MarketplaceAbi); // log the MarketplaceAbi
  console.log(`MarketplaceAddress[${chainId}]:`, MarketplaceAddress[chainId]); // log the MarketplaceAddress for the current chainId

  const marketplace = new ethers.Contract(
    MarketplaceAddress[chainId],
    MarketplaceAbi,
    provider
  );
  dispatch(setContract(marketplace));

  return marketplace;
};

//-----------------------------------
// CREATE ITEM
export const makeItem = async (
  provider,
  nft,
  marketplace,
  tokenId,
  price,
  dispatch
) => {
  try {
    dispatch(startCreating());
    const signer = await provider.getSigner();

    let transaction;

    // Approve the marketplace to spend the user's NFT
    transaction = await nft
      .connect(signer)
      .approve(marketplace.address, tokenId);
    await transaction.wait();

    // Now the marketplace can create the item
    transaction = await marketplace
      .connect(signer)
      .makeItem(nft.address, tokenId, price);
    const receipt = await transaction.wait();

    dispatch(createSuccess(receipt.transactionHash));
  } catch (error) {
    dispatch(createFailure());
  }
};

export const buyItem = async (provider, marketplace, itemId, dispatch) => {
  try {
    dispatch(startBuying());
    const signer = await provider.getSigner();

    // Get the total price of the item
    const totalPrice = await marketplace.getTotalPrice(itemId);

    // Send a transaction to buy the item
    let transaction = await marketplace
      .connect(signer)
      .purchaseItem(itemId, { value: totalPrice });
    const receipt = await transaction.wait();

    dispatch(buySuccess(receipt.transactionHash));
  } catch (error) {
    dispatch(buyFailure());
  }
};
