import { ethers } from "ethers";

import { setProvider, setNetwork, setAccount } from "./reducers/provider";

import { setContracts } from "./reducers/nft";

// import { setContract } from "./reducers/marketplace";

import NFT_ABI from "../contractsData/NFT.json";

import address from "../contractsData/NFT-address.json";

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
  const nft = new ethers.Contract(
    config[chainId].nft.address,
    NFT_ABI,
    provider
  );
  dispatch(setContracts(nft));

  return nft;
};
