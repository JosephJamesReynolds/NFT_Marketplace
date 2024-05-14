import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import market from "./market.png";

//Redux components
import { loadAccount } from "./store/interactions";
import { useSelector, useDispatch } from "react-redux";

const Navigation = () => {
  const dispatch = useDispatch();
  const account = useSelector((state) => state.provider.account); // Select account from Redux store

  const handleConnectWallet = async () => {
    await dispatch(loadAccount(dispatch));
  };
  return (
    <Navbar expand="lg" bg="secondary" variant="dark">
      <Container>
        <Navbar.Brand>
          <img src={market} width="40" height="40" className="" alt="" />
          &nbsp; Joseph's NFT Marketplace
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">
              Home
            </Nav.Link>
            <Nav.Link as={Link} to="/create">
              Create
            </Nav.Link>
            <Nav.Link as={Link} to="/my-listed-items">
              My Listed Items
            </Nav.Link>
            <Nav.Link as={Link} to="/my-purchases">
              My Purchases
            </Nav.Link>
            <Nav.Link as={Link} to="/my-history">
              My History
            </Nav.Link>
          </Nav>
          <Nav>
            {account ? (
              <Nav.Link
                href={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                className="button nav-button btn-sm mx-4"
              >
                <Button variant="outline-light">
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                </Button>
              </Nav.Link>
            ) : (
              <Button onClick={handleConnectWallet} variant="outline-light">
                Connect Wallet
              </Button>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Navigation;
