import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { loadAccount } from "./store/interactions";
import symbol from "./symbol.png";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const account = useSelector((state) => state.provider.account);

  const handleConnectWallet = async () => {
    await loadAccount(dispatch);
  };

  const toggleMenu = () => setIsOpen(!isOpen);

  const NavLinks = () => (
    <>
      <Link
        to="/"
        className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-base font-medium"
      >
        Intro
      </Link>
      <Link
        to="/Home"
        className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-base font-medium"
      >
        Home
      </Link>
      <Link
        to="/create"
        className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-base font-medium"
      >
        Create
      </Link>
      <Link
        to="/my-listed-items"
        className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-base font-medium"
      >
        My Listed Items
      </Link>
      <Link
        to="/my-purchases"
        className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-base font-medium"
      >
        My Purchases
      </Link>
      <Link
        to="/my-history"
        className="text-gray-300 hover:bg-gray-700 hover:text-white px-2 py-1 rounded-md text-base font-medium"
      >
        My History
      </Link>
    </>
  );

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <img src={symbol} alt="Logo" className="h-12 w-12" />
            <div className="ml-4 text-white text-xl">
              Joseph's NFT Marketplace
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-baseline space-x-4">
            <NavLinks />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={toggleMenu} className="text-white">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          <div className="hidden md:flex items-center">
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

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <NavLinks />
          </div>
          <div className="pt-4 pb-3 border-t border-gray-700">
            {account ? (
              <a
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                {account.slice(0, 5) + "..." + account.slice(38, 42)}
              </a>
            ) : (
              <button
                onClick={handleConnectWallet}
                className="block w-full text-left text-gray-100 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-base font-medium"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navigation;
