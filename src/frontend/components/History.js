import { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { ethers } from "ethers";

const History = ({ marketplace, nft, account }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (marketplace) {
      fetchTransactions();
    }
  }, [marketplace]);

  const fetchTransactions = async () => {
    marketplace.on(
      "Bought",
      (itemId, nftAddress, tokenId, price, seller, buyer, event) => {
        const transaction = {
          itemId: itemId.toString(),
          nftAddress,
          tokenId: tokenId.toString(),
          price: ethers.utils.formatUnits(price.toString(), "ether"),
          seller,
          buyer,
          hash: event.transactionHash,
          timestamp: new Date().getTime(), // Current time
        };
        setTransactions((transactions) => [...transactions, transaction]);
      }
    );
  };

  return (
    <Table striped bordered hover>
      <thead>
        <tr>
          <th>Transaction Hash</th>
          <th>NFT ID</th>
          <th>Price</th>
          <th>Buyer</th>
          <th>Seller</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((transaction, index) => (
          <tr key={index}>
            <td>
              {transaction.hash.slice(0, 5) +
                "..." +
                transaction.hash.slice(61, 66)}
            </td>
            <td>{transaction.nft.Id.toString()}</td>
            <td>
              {ethers.utils.formatUnits(transaction.price.toString(), "ether")}
            </td>
            <td>
              {transaction.buyer.slice(0, 5) +
                "..." +
                transaction.buyer.slice(38, 42)}
            </td>
            <td>
              {transaction.seller.slice(0, 5) +
                "..." +
                transaction.seller.slice(38, 42)}
            </td>
            <td>
              {new Date(
                Number(transaction.timestamp.toString() + "000")
              ).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default History;
