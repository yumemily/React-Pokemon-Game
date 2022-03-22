import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import twitterLogo from "./assets/twitterLogo.png";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicGame.json";
import SelectCharacter from "./Components/SelectCharacter";
import Arena from "./Components/Arena";
import LoadingIndicator from "./Components/LoadingIndicator";

import CircleIndicator from "./Components/CircleIndicator";
import NewArena from "./Components/NewArena";

// Constants
const GITHUB_HANDLE = "yumemily";
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}/React-Pokemon-Game`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [view, setView] = useState("connect");

  const [isLoading, setIsLoading] = useState(false);

  const [connectedToRinkeby, setConnectedToRinkeby] = useState("not connected");

  const metaMaskStatusColor = currentAccount ? "on" : "off";
  const networkStatusColor = connectedToRinkeby === "connected" ? "on" : "off";

  const checkNetwork = async () => {
    try {
      let chainId = await window.ethereum.request({ method: "eth_chainId" });
      console.log(chainId);
      if (chainId === "0x4") {
        setConnectedToRinkeby("connected");
      } else {
        setConnectedToRinkeby("not connected");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      // check if we have access to window.ethereum
      const { ethereum } = window;

      if (!ethereum && !ethereum.isMetaMask) {
        console.log("Make sure you have MetaMask!");
        setIsLoading(false);
        return;
      } else {
        console.log("We have the ethereum object", ethereum);

        /*
         * check if we're authorized to access user's wallet
         */
        const accounts = await ethereum.request({ method: "eth_accounts" });

        // grab first address
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account:", account);
          setCurrentAccount(account);
        } else {
          console.log("No authorized account found.");
        }
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  // this runs the functions when App component first renders!
  useEffect(() => {
    setIsLoading(true);
    checkNetwork();
    checkIfWalletIsConnected();
  }, []);

  useEffect(() => {
    // The "any" network will allow spontaneous network changes
    const provider = new ethers.providers.Web3Provider(window.ethereum, "any");
    provider.on("network", (newNetwork, oldNetwork) => {
      // When a Provider makes its initial connection, it emits a "network"
      // event with a null oldNetwork along with the newNetwork. So, if the
      // oldNetwork exists, it represents a changing network
      if (oldNetwork) {
        console.log("network changed");
        window.location.reload();
        checkNetwork();
      }
    });
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Checking for Character NFT on address:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );
      const txn = await gameContract.checkIfUserHasNFT(currentAccount);
      if (txn.name) {
        console.log("User has character NFT", txn.name);
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("No character NFT found");
      }
      setIsLoading(false);
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount && connectedToRinkeby === "connected") {
      console.log("CurrentAccount:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);

  // Render Methods
  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (view === "connect" && !currentAccount) {
      return (
        <div className="connect-wallet-container">
          <img
            src="https://media.giphy.com/media/8UGGp7rQvfhe63HrFq/giphy.gif"
            alt="Monty Python Gif"
          />
          <button
            className={`cta-button connect-wallet-button ${
              currentAccount ? "inactive" : ""
            }`}
            onClick={connectWalletAction}
          >
            {!currentAccount && "Connect Wallet To Get Started"}
            {currentAccount && "MetaMask connected"}
          </button>
        </div>
      );
    } else if (view === "connect" && currentAccount && characterNFT) {
      return <div>MetaMask connected. Feel free to battle in the arena!</div>;
    } else if (
      view === "connect" &&
      currentAccount &&
      !characterNFT &&
      connectedToRinkeby === "connected"
    ) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (
      currentAccount &&
      characterNFT &&
      connectedToRinkeby === "connected" &&
      view === "battle"
    ) {
      return (
        <NewArena
          characterNFT={characterNFT}
          setCharacterNFT={setCharacterNFT}
          currentAccount={currentAccount}
        />
      );
    } else if (
      currentAccount &&
      !characterNFT &&
      connectedToRinkeby === "connected" &&
      view === "battle"
    ) {
      return <h4>You need a pokemon to battle!</h4>;
    }
  };

  return (
    <div className="App">
      {/* Navbar */}
      {/* <nav class="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
        <div>
          <a class="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
            Company name
          </a>
        </div>
        <ul class="navbar-nav px-3">
          <li class="nav-item text-nowrap">
            <a class="nav-link" href="#">
              Sign out
            </a>
          </li>
        </ul>
      </nav> */}

      <div className="container-fluid">
        <div className="row">
          {/* Nav Sidebar */}
          <nav class="col-md-2 d-none d-md-block sidebar text-center ">
            <div class="sidebar-sticky ">
              <ul class="nav flex-column">
                <li className="nav-item logo mt-4 ">
                  <img
                    src="https://www.freepnglogos.com/uploads/pok-mon-go-logo-png-30.png"
                    alt=""
                    style={{ width: 78 }}
                  />
                  <p style={{ fontSize: "larger" }}>MetaVerse Master</p>
                </li>
                <li className="nav-item d-flex justify-content-center">
                  <div className="status-indicators ">
                    <CircleIndicator
                      statusMessage={"MetaMask"}
                      statusColor={metaMaskStatusColor}
                    />
                    <CircleIndicator
                      statusMessage={"Rinkeby"}
                      statusColor={networkStatusColor}
                    />
                  </div>
                </li>
                <li class="nav-item">
                  <a
                    class={`nav-link active nav-link-button ${
                      view === "connect" ? "nav-active" : ""
                    }`}
                    href="#"
                    onClick={() => setView("connect")}
                  >
                    Connect
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class={`nav-link active nav-link-button ${
                      view === "battle" ? "nav-active" : ""
                    }`}
                    href="#"
                    onClick={() => setView("battle")}
                  >
                    Battle
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class={`nav-link active nav-link-button ${
                      view === "pokemon" ? "nav-active" : ""
                    }`}
                    href="#"
                    onClick={() => setView("pokemon")}
                  >
                    <span data-feather="shopping-cart"></span>
                    Your Pokemon
                  </a>
                </li>
                <li class="nav-item">
                  <a
                    class={`nav-link active nav-link-button ${
                      view === "marketplace" ? "nav-active" : ""
                    }`}
                    href="#"
                    onClick={() => setView("marketplace")}
                  >
                    <span data-feather="users"></span>
                    Marketplace
                  </a>
                </li>
              </ul>
            </div>
          </nav>

          <main
            role="main"
            class=" wrapper col-md-9 ml-sm-auto col-lg-10 pt-3 px-4"
          >
            <div class="container content d-flex justify-content-center text-center">
              <div className="header-container">
                <p className="header gradient-text">⚔️ Pokemon Metaverse ⚔️</p>

                <p className="sub-text">
                  Defeat gym leaders and become a Pokemon Master!
                </p>
                {renderContent()}
              </div>
            </div>
            <div className="footer-container">
              {/* <img
                alt="Twitter Logo"
                className="twitter-logo"
                src={twitterLogo}
              /> */}
              <a
                className="footer-text"
                href={GITHUB_LINK}
                target="_blank"
                rel="noreferrer"
              >{`built by @${GITHUB_HANDLE}`}</a>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;
