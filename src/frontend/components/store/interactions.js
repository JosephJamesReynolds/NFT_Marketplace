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

import nftAbi from "../../contractsData/NFT.json";
import nftAddress from "../../contractsData/NFT-address.json";
import marketplaceAbi from "../../contractsData/Marketplace.json";
import marketplaceAddress from "../../contractsData/Marketplace-address.json";

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
  try {
    console.log("nftAbi:", nftAbi);
    console.log("Type of nftAbi:", typeof nftAbi);
    console.log("nftAbi.abi is array:", Array.isArray(nftAbi.abi));
    console.log(`nftAddress[${chainId}]:`, nftAddress[chainId]);

    const nft = new ethers.Contract(nftAddress[chainId], nftAbi.abi, provider);
    dispatch(setContracts(nft));

    return nft;
  } catch (error) {
    console.error("Error in loadNFT:", error);
  }
};

export const loadMarketplace = async (provider, chainId, dispatch) => {
  console.log("marketplaceAbi:", marketplaceAbi);
  console.log("Type of marketplaceAbi:", typeof marketplaceAbi);
  console.log(
    "marketplaceAbi.abi is array:",
    Array.isArray(marketplaceAbi.abi)
  );
  console.log(`marketplaceAddress[${chainId}]:`, marketplaceAddress[chainId]);

  const marketplace = new ethers.Contract(
    marketplaceAddress[chainId],
    marketplaceAbi.abi,
    provider
  );
  dispatch(setContract(marketplace));

  return marketplace;
};

//-----------------------------------
// CREATE ITEM
// Add minting function
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
    //REfactor line 95 in this style
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
