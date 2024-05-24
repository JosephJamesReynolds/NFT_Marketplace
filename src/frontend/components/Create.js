import axios from "axios";
import { useState } from "react";
import { ethers } from "ethers";
import { Row, Form, Button } from "react-bootstrap";
import Alert from "./Alert";

// Redux components
import { useSelector, useDispatch } from "react-redux";
import { makeItem } from "./store/interactions";

//API keys
const privateApiKey = process.env.REACT_APP_PRIVATE_API_KEY || "";
const privateSecretApiKey = process.env.REACT_APP_PRIVATE_API_SECRET_KEY || "";

const Create = () => {
  // Redux state
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

  // React state
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
    <div className="container-fluid mt-5">
      <div className="row">
        <main
          role="main"
          className="col-lg-12 mx-auto"
          style={{ maxWidth: "1000px" }}
        >
          <div className="content mx-auto">
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
            <Row className="g-4">
              <Form.Control
                type="file"
                required
                name="file"
                onChange={uploadToIPFS}
              />
              <Form.Control
                onChange={(e) => setName(e.target.value)}
                size="lg"
                required
                type="text"
                placeholder="Name"
              />
              <Form.Control
                onChange={(e) => setDescription(e.target.value)}
                size="lg"
                required
                as="textarea"
                placeholder="Description"
              />
              <Form.Control
                onChange={(e) => setPrice(e.target.value)}
                size="lg"
                required
                type="number"
                placeholder="Price in ETH"
              />
              <div className="d-grid px-0">
                <Button onClick={createNFT} variant="primary" size="lg">
                  Create & List NFT!
                </Button>
              </div>
            </Row>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Create;
