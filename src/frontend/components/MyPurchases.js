// Adjust the loading logic in MyPurchases to match MyListedItems
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "./store/interactions";
import { ethers } from "ethers";

export default function MyPurchases() {
  // REDUX STATE
  const dispatch = useDispatch();
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  // REACT STATE
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  useEffect(() => {
    const loadPurchasedItems = async () => {
      if (!marketplace || !nft || !account) {
        setLoading(false);
        return;
      }
      try {
        const filter = marketplace.filters.Bought(
          null,
          null,
          null,
          null,
          null,
          account
        );
        const results = await marketplace.queryFilter(filter);
        const purchases = await Promise.all(
          results.map(async (i) => {
            i = i.args;
            const uri = await nft.tokenURI(i.tokenId);
            const response = await fetch(uri);
            const metadata = await response.json();
            const totalPrice = await marketplace.getTotalPrice(i.itemId);
            let purchasedItem = {
              totalPrice,
              price: i.price,
              itemId: i.itemId,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
            };
            return purchasedItem;
          })
        );
        setPurchases(purchases);
      } catch (error) {
        console.error("Failed to load purchases:", error);
      } finally {
        setLoading(false);
      }
    };

    loadPurchasedItems();
  }, [marketplace, nft, account]);

  const scrollableText = {
    overflowX: "auto",
    whiteSpace: "nowrap",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!account) {
    return (
      <main
        className="py-4"
        style={{ fontSize: "24px", fontFamily: "Arial, sans-serif" }}
      >
        <div style={{ margin: "20px 0" }}>
          <h2 style={{ fontSize: "36px" }}>
            Welcome to Joseph's NFT Marketplace.
          </h2>
          <h2 style={{ marginTop: "20px", fontSize: "30px" }}>
            <button
              onClick={handleConnectWallet}
              className="bg-blue-500 text-white px-2 py-1 rounded transition duration-500 ease-in-out hover:bg-blue-700"
            >
              Connect your wallet
            </button>{" "}
            to get started.
          </h2>
        </div>
      </main>
    );
  } else {
    return (
      <>
        <h1 className="text-4xl font-bold my-4 text-center">My Collection</h1>
        <div className="flex justify-center">
          {purchases.length > 0 ? (
            <div className="px-5 container">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
                {purchases.map((item, idx) => (
                  <div key={idx}>
                    <div className="bg-white shadow rounded-lg">
                      <img
                        className="w-full"
                        src={item.image}
                        alt={item.name}
                      />
                      <div className="p-4">
                        <strong>Name:</strong>{" "}
                        <div style={scrollableText}>{item.name}</div>
                        <br />
                        <strong>Description:</strong>{" "}
                        <div style={scrollableText}>{item.description}</div>
                        <br />
                        <strong>Price:</strong>{" "}
                        {ethers.utils.formatEther(item.totalPrice)} ETH
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <main className="py-4">
              <h2 className="text-3xl text-center">No purchases</h2>
            </main>
          )}
        </div>
      </>
    );
  }
}
