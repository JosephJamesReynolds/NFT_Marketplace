import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import { HoveredLink, Menu, MenuItem } from "./navbar-menu";
import cn from "./utils/cn";
import market from "./market.png";

export function NavbarDemo({ web3Handler, account }) {
  return (
    <div className="relative w-full flex items-center justify-center">
      <Navigation
        className="top-2"
        web3Handler={web3Handler}
        account={account}
      />
      <p className="text-black dark:text-white">
        The Navbar will show on top of the page
      </p>
    </div>
  );
}

function Navigation({ className, web3Handler, account }) {
  const [active, setActive] = useState(null);
  return (
    <div
      className={cn("fixed top-10 inset-x-0 max-w-2xl mx-auto z-50", className)}
    >
      <Navbar expand="lg" bg="secondary" variant="dark">
        <Container>
          <Navbar.Brand href="http://www.dappuniversity.com/bootcamp">
            <img src={market} width="40" height="40" className="" alt="" />
            &nbsp; DApp NFT Marketplace
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Menu setActive={setActive}>
              <MenuItem setActive={setActive} active={active} item="Home">
                <HoveredLink as={Link} to="/">
                  Home
                </HoveredLink>
              </MenuItem>
              <MenuItem setActive={setActive} active={active} item="Create">
                <HoveredLink as={Link} to="/create">
                  Create
                </HoveredLink>
              </MenuItem>
              <MenuItem
                setActive={setActive}
                active={active}
                item="My Listed Items"
              >
                <HoveredLink as={Link} to="/my-listed-items">
                  My Listed Items
                </HoveredLink>
              </MenuItem>
              <MenuItem
                setActive={setActive}
                active={active}
                item="My Purchases"
              >
                <HoveredLink as={Link} to="/my-purchases">
                  My Purchases
                </HoveredLink>
              </MenuItem>
            </Menu>
            <Nav>
              {account ? (
                <Nav.Link
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="button nav-button btn-sm mx-4"
                >
                  <Button variant="outline-light">
                    {account.slice(0, 5) + "..." + account.slice(-4)}
                  </Button>
                </Nav.Link>
              ) : (
                <Button onClick={web3Handler} variant="outline-light">
                  Connect Wallet
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export default NavbarDemo;
