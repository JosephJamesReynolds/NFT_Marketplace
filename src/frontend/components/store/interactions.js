import { ethers } from "ethers";
import { setProvider, setNetwork, setAccount } from "./reducers/provider";
import { setContracts } from "./reducers/nft";
import {
  setContract,
  itemsPurchasedLoaded,
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
  const provider = new ethers.BrowserProvider(window.ethereum);
  dispatch(setProvider(provider));
  return provider;
};

export const loadNetwork = async (provider, dispatch) => {
  const { chainId } = await provider.getNetwork();
  dispatch(setNetwork(chainId));
  return chainId;
};

export const loadAccount = async (dispatch) => {
  const accounts = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  const account = ethers.getAddress(accounts[0]);
  dispatch(setAccount(account));
  return account;
};

export const loadNFT = async (provider, chainId, dispatch) => {
  const nft = new ethers.Contract(nftAddress[chainId], nftAbi.abi, provider);
  dispatch(setContracts(nft));
  return nft;
};

export const loadMarketplace = async (provider, chainId, dispatch) => {
  const marketplace = new ethers.Contract(
    marketplaceAddress[chainId],
    marketplaceAbi.abi,
    provider
  );
  dispatch(setContract(marketplace));
  return marketplace;
};

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

    // Minting logic
    const uri = `https://gateway.pinata.cloud/ipfs/${tokenId}`;
    if (nft.contracts && nft.contracts.length > 0) {
      const contract = nft.contracts[0]; // assuming the Contract object is the first element in the array
      transaction = await contract.connect(signer).mint(uri);
      await transaction.wait();
    } else {
      transaction = await nft.connect(signer).mint(uri);
      await transaction.wait();
    }

    // get tokenId of new nft
    const id = await nft.tokenCount();

    // approve marketplace to spend nft
    if (marketplace) {
      transaction = await nft
        .connect(signer)
        .setApprovalForAll(marketplace.address, true);
      await transaction.wait();
    } else {
      console.error("marketplace is undefined");
      return;
    }

    transaction = await nft.connect(signer).approve(marketplace.address, id);
    await transaction.wait();
    const listingPrice = ethers.parseEther(price.toString());
    transaction = await marketplace
      .connect(signer)
      .makeItem(nft.address, id, listingPrice);
    const receipt = await transaction.wait();
    dispatch(createSuccess(receipt.transactionHash));

    return receipt;
  } catch (error) {
    console.error(error);
    if (error.message === "User denied transaction signature.") {
      throw error; // re-throw the error if the user rejected the transaction
    }
    dispatch(createFailure());
  }
};
export const buyItem = async (
  provider,
  marketplace,
  itemId,
  account,
  dispatch
) => {
  try {
    dispatch(startBuying());
    const signer = await provider.getSigner();
    console.log(`Buyer's account address: ${account}`);
    let transaction;

    const totalPrice = await marketplace.getTotalPrice(itemId);

    transaction = await marketplace
      .connect(signer)
      .purchaseItem(itemId, { value: totalPrice });
    await transaction.wait();

    const receipt = await transaction.wait();
    dispatch(buySuccess(receipt.transactionHash));
  } catch (error) {
    console.error(error);
    dispatch(buyFailure());
  }
};

export const loadAllItemsPurchased = async (
  provider,
  marketplace,
  dispatch
) => {
  // Fetch ItemPurchased events from the Blockchain
  const block = await provider.getBlockNumber();

  const itemPurchasedStream = await marketplace.queryFilter("Bought", 0, block);
  const items = itemPurchasedStream.map((event) => {
    return {
      hash: event.transactionHash,
      itemId: event.args.itemId,
      nft: event.args.nft,
      tokenId: event.args.tokenId,
      price: event.args.price,
      seller: event.args.seller,
      buyer: event.args.buyer,
    };
  });

  dispatch(itemsPurchasedLoaded(items));
};
