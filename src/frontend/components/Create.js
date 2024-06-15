import axios from "axios";
import { useState } from "react";
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

    setShowAlert(false); // Hide any previous alerts

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
    <div className="container mx-auto mt-1 py-1">
      <div className="flex flex-wrap justify-center">
        <main
          role="main"
          className="lg:w-full mx-auto py-10"
          style={{ maxWidth: "1200px" }}
        >
          <div className="content mx-auto py-10">
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
            ) : (
              <></>
            )}
            <div className="grid grid-cols-1 gap-4 py-10">
              <input
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
                className="col-span-1 border"
              />
              <input
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
                className="col-span-1 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
              />

              <textarea
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                placeholder="Description"
                className="col-span-1 border-2 border-gray-300 bg-white px-5 pr-16 rounded-lg text-sm focus:outline-none flex items-center justify-center"
                style={{ height: "80px" }}
              />

              <input
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
                className="col-span-1 border-2 border-gray-300 bg-white h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
              />
              <div className="col-span-1">
                <button
                  onClick={createNFT}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Create & List NFT!
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
