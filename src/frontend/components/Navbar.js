import { Link } from "react-router-dom";
import symbol from "./symbol.png";
import { loadAccount } from "./store/interactions";
import { useSelector, useDispatch } from "react-redux";

const Navigation = () => {
  // REDUX STATE
  const dispatch = useDispatch();
  const account = useSelector((state) => state.provider.account);

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={symbol} alt="Logo" className="h-12 w-12" />
            <div className="ml-8 text-white text-xl">
              Joseph's NFT Marketplace
            </div>
            <div className="ml-8 flex items-baseline space-x-3">
              <Link
                to="/"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-lg font-medium"
              >
                Intro
              </Link>
              <Link
                to="/Home"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-lg font-medium"
              >
                Home
              </Link>
              <Link
                to="/create"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-lg font-medium"
              >
                Create
              </Link>
              <Link
                to="/my-listed-items"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-lg font-medium"
              >
                My Listed Items
              </Link>
              <Link
                to="/my-purchases"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-lg font-medium"
              >
                My Purchases
              </Link>
              <Link
                to="/my-history"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-lg font-medium"
              >
                My History
              </Link>
            </div>
          </div>
          <div className="ml-4 flex items-center md:ml-6">
            {account ? (
              <a
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-3 rounded-md text-sm font-medium"
              >
                {account.slice(0, 5) + "..." + account.slice(38, 42)}
              </a>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="text-gray-100 hover:bg-gray-700 hover:text-white px-4 py-3 rounded-md text-sm font-medium border border-gray-300 hover:border-transparent"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
