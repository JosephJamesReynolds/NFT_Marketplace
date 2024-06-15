import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "./store/interactions";

function renderSoldItems(items, scrollableText) {
  return (
    <>
      <h2 className="text-4xl font-bold">Sold</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
        {items.map((item, idx) => (
          <div key={idx}>
            <div className="bg-white shadow rounded-lg">
              <img className="w-full" src={item.image} alt={item.name} />
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
    </>
  );
}

export default function MyListedItems() {
  // REDUX STATE
  const dispatch = useDispatch();
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const account = useSelector((state) => state.provider.account);

  // REACT STATE
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const scrollableText = {
    overflowX: "auto",
    whiteSpace: "nowrap",
  };

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  useEffect(() => {
    const loadListedItems = async () => {
      if (!marketplace || !account) {
        setLoading(false); // Ensure loading is set to false if preconditions fail
        return;
      }
      try {
        const itemCount = await marketplace.itemCount();
        let listedItems = [];
        let soldItems = [];
        for (let indx = 1; indx <= itemCount; indx++) {
          const i = await marketplace.items(indx);
          if (i.seller.toLowerCase() === account.toLowerCase()) {
            const uri = await nft.tokenURI(i.tokenId);
            const response = await fetch(uri);
            const metadata = await response.json();
            const totalPrice = await marketplace.getTotalPrice(i.itemId);
            let item = {
              totalPrice,
              price: i.price,
              itemId: i.itemId,
              name: metadata.name,
              description: metadata.description,
              image: metadata.image,
            };
            listedItems.push(item);
            if (i.sold) soldItems.push(item);
          }
        }
        setListedItems(listedItems);
        setSoldItems(soldItems);
      } catch (error) {
        console.error("Failed to load items:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false after the async operation
      }
    };
    loadListedItems();
  }, [marketplace, nft, account]);

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
      <div className="flex justify-center">
        {listedItems.length > 0 ? (
          <div className="px-5 py-3 container">
            <h2 className="text-4xl font-bold">Listed</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-3">
              {listedItems.map((item, idx) => (
                <div key={idx}>
                  <div className="bg-white shadow rounded-lg">
                    <img className="w-full" src={item.image} alt={item.name} />
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
            {soldItems.length > 0 && renderSoldItems(soldItems, scrollableText)}
          </div>
        ) : (
          <main className="py-4">
            <h2 className="text-4xl font-bold">No listed assets</h2>
          </main>
        )}
      </div>
    );
  }
}
