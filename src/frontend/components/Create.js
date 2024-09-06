import React, { useState } from "react";
import axios from "axios";
import Alert from "./Alert";
import { useSelector, useDispatch } from "react-redux";
import { makeItem } from "./store/interactions";

// API keys
const privateApiKey = process.env.REACT_APP_PRIVATE_API_KEY || "";
const privateSecretApiKey = process.env.REACT_APP_PRIVATE_API_SECRET_KEY || "";

const Create = () => {
  // REDUX STATE
  const provider = useSelector((state) => state.provider.connection);
  const nft = useSelector((state) => state.nft.contracts);
  const marketplace = useSelector((state) => state.marketplace.contract);
  const account = useSelector((state) => state.provider.account);
  const isCreating = useSelector(
    (state) => state.marketplace.creating.isCreating
  );
  const isSuccess = useSelector(
    (state) => state.marketplace.creating.isSuccess
  );
  const transactionHash = useSelector(
    (state) => state.marketplace.creating.transactionHash
  );
  const dispatch = useDispatch();

  // REACT STATE
  const [showAlert, setShowAlert] = useState(false);
  const [image, setImage] = useState("");
  const [price, setPrice] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const uploadToPinata = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        maxContentLength: "Infinity", // this is needed to prevent axios from erroring out with large files
        headers: {
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          pinata_api_key: privateApiKey,
          pinata_secret_api_key: privateSecretApiKey,
        },
      }
    );

    if (res.status !== 200) {
      throw new Error("Failed to upload file to Pinata");
    }

    return res.data.IpfsHash;
  };

  const uploadToIPFS = async (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = async () => {
      const ipfsHash = await uploadToPinata(new Blob([reader.result]));
      setImage(`https://ipfs.io/ipfs/${ipfsHash}`);
    };
    reader.readAsArrayBuffer(file);
  };

  const createNFT = async () => {
    if (!provider || !account) {
      alert("Please connect your wallet first.");
      return;
    }

    if (!image || !price || !name || !description) return;

    setShowAlert(false);

    const file = new Blob(
      [JSON.stringify({ image, price, name, description })],
      {
        type: "application/json",
      }
    );
    const ipfsHash = await uploadToPinata(file);
    await makeItem(provider, nft, marketplace, ipfsHash, price, dispatch);

    setShowAlert(true);
  };
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 text-center">
          Create & List NFT
        </h1>
        <div className="mb-6">
          {isCreating ? (
            <Alert
              message={"Creation Pending..."}
              transactionHash={null}
              variant={"info"}
              setShowAlert={setShowAlert}
            />
          ) : isSuccess && showAlert ? (
            <Alert
              message={"Creation Successful"}
              transactionHash={transactionHash}
              variant={"success"}
              setShowAlert={setShowAlert}
            />
          ) : !isSuccess && showAlert ? (
            <Alert
              message={"Creation Failed"}
              transactionHash={null}
              variant={"danger"}
              setShowAlert={setShowAlert}
            />
          ) : null}
        </div>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Upload Image
            </label>
            <input
              id="file-upload"
              type="file"
              required
              name="file"
              onChange={uploadToIPFS}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="nft-name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Name
            </label>
            <input
              id="nft-name"
              onChange={(e) => setName(e.target.value)}
              required
              type="text"
              placeholder="NFT Name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="nft-description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <textarea
              id="nft-description"
              onChange={(e) => setDescription(e.target.value)}
              required
              placeholder="NFT Description"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              rows="3"
            />
          </div>
          <div>
            <label
              htmlFor="nft-price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (ETH)
            </label>
            <input
              id="nft-price"
              onChange={(e) => setPrice(e.target.value)}
              required
              type="number"
              step="0.01"
              placeholder="Price in ETH"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <button
              onClick={createNFT}
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
            >
              Create & List NFT
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
