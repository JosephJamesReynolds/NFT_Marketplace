import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { useSelector, useDispatch } from "react-redux";
import { buyItem } from "./store/interactions";
import Alert from "./Alert";

const Home = () => {
  // Redux state
  const provider = useSelector((state) => state.provider.connection);
  const account = useSelector((state) => state.provider.account);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const nft = useSelector((state) => state.nft.contracts);
  const isBuying = useSelector((state) => state.marketplace.buying.isBuying);
  const isSuccess = useSelector((state) => state.marketplace.buying.isSuccess);
  const transactionHash = useSelector(
    (state) => state.marketplace.buying.transactionHash
  );
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [showAlert, setShowAlert] = useState(false);

  const loadMarketplaceItems = async () => {
    const itemCount = await marketplace.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        const uri = await nft.tokenURI(item.tokenId);
        const response = await fetch(uri);
        const metadata = await response.json();
        const totalPrice = await marketplace.getTotalPrice(item.itemId);
        items.push({
          totalPrice: totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        });
      }
    }
    setLoading(false);
    setItems(items);
  };

  useEffect(() => {
    if (marketplace && nft) {
      loadMarketplaceItems();
    }
  }, [marketplace, nft]);

  if (loading)
    return (
      <main className="p-4">
        <h2>Loading...</h2>
      </main>
    );

  return (
    <div className="flex justify-center">
      {isBuying ? (
        <Alert
          message={"Purchase Pending..."}
          transactionHash={null}
          variant={"info"}
          setShowAlert={setShowAlert}
        />
      ) : isSuccess && showAlert ? (
        <Alert
          message={"Purchase Successful"}
          transactionHash={transactionHash}
          variant={"success"}
          setShowAlert={setShowAlert}
        />
      ) : !isSuccess && showAlert ? (
        <Alert
          message={"Purchase Failed"}
          transactionHash={null}
          variant={"danger"}
          setShowAlert={setShowAlert}
        />
      ) : (
        <></>
      )}
      {items.length > 0 ? (
        <div className="px-5 container">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 py-5">
            {items.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded shadow-lg">
                <img className="w-full" src={item.image} alt={item.name} />
                <div className="px-6 py-4">
                  <div className="font-bold text-xl mb-2">{item.name}</div>
                  <p className="text-gray-700 text-base">{item.description}</p>
                </div>
                <div className="px-6 pt-4 pb-2">
                  <button
                    onClick={async () => {
                      setShowAlert(false);
                      await buyItem(
                        provider,
                        marketplace,
                        item.itemId,
                        account,
                        dispatch
                      );
                      await loadMarketplaceItems();
                      setShowAlert(true);
                    }}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <main className="p-4">
          <h1 className="text-4xl font-bold">No listed assets</h1>
        </main>
      )}
    </div>
  );
};

export default Home;
