import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import './App.css';

import { CONTRACT_ADDRESS, transformCharacterData } from './constants';
import myEpicGame from './utils/MyEpicGame.json';

import SelectCharacter from './Components/SelectCharacter';
import Battle from './Components/Battle';
import Connect from './Components/Connect';
import Layout from './Components/Layout';

// Constants
const GITHUB_HANDLE = 'yumemily';
const GITHUB_LINK = `https://github.com/${GITHUB_HANDLE}/React-Pokemon-Game`;

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  const [connectedToRinkeby, setConnectedToRinkeby] = useState('not connected');

  const { ethereum } = window;

  const metaMaskStatusColor = currentAccount ? 'on' : 'off';
  const networkStatusColor = connectedToRinkeby === 'connected' ? 'on' : 'off';

  const checkNetwork = async () => {
    try {
      if (!ethereum || !ethereum.isMetaMask) {
        return;
      } else {
        let chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId === '0x4') {
          setConnectedToRinkeby('connected');
          console.log('user is connected to rinkeby');
        } else {
          setConnectedToRinkeby('not connected');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const checkIfWalletIsConnected = async () => {
    try {
      // check if we have access to window.ethereum
      // const { ethereum } = window;
      if (!ethereum || !ethereum.isMetaMask) {
        console.log('Make sure you have MetaMask!');
        setIsLoading(false);
        return;
      } else {
        console.log('We have the ethereum object', ethereum);
        /*
         * check if we're authorized to access user's wallet
         */
        const accounts = await ethereum.request({ method: 'eth_accounts' });

        // grab first address
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found.');
        }
      }
    } catch (e) {
      console.log(e);
    }
    setIsLoading(false);
  };

  const connectWalletAction = async () => {
    try {
      if (!ethereum) {
        alert('Get MetaMask!');
        return;
      }

      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      console.log('Connected', accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    if (ethereum) {
      setIsLoading(true);
      checkNetwork();
      checkIfWalletIsConnected();
    }
  }, []);

  useEffect(() => {
    if (ethereum) {
      // The "any" network will allow spontaneous network changes
      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        'any'
      );

      setProvider(provider);
      provider.on('network', (newNetwork, oldNetwork) => {
        // When a Provider makes its initial connection, it emits a "network"
        // event with a null oldNetwork along with the newNetwork. So, if the
        // If oldNetwork exists, it represents a changing network
        if (oldNetwork) {
          console.log('network changed');
          window.location.reload();
          checkNetwork();
        }
      });
    }
    return () => {
      if (provider) {
        provider.off('network');
        setProvider(null);
      }
    };
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      try {
        console.log('Checking for Character NFT on address:', currentAccount);

        const provider = new ethers.providers.Web3Provider(window.ethereum);

        const signer = provider.getSigner();
        const gameContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicGame.abi,
          signer
        );
        const txn = await gameContract.checkIfUserHasNFT(currentAccount);
        if (txn.name) {
          console.log('User has character NFT', txn.name);
          setCharacterNFT(transformCharacterData(txn));
        } else {
          console.log('No character NFT found');
        }
        setIsLoading(false);
      } catch (err) {
        console.log(err);
      }
    };

    /*
     * We only want to run this, if we have a connected wallet
     */
    if (currentAccount && connectedToRinkeby === 'connected') {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount, connectedToRinkeby]);

  return (
    <div className="App">
      {/* Navbar */}
      {/* <nav className="navbar navbar-dark sticky-top bg-dark flex-md-nowrap p-0">
        <div>
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
            Company name
          </a>
        </div>
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <a className="nav-link" href="#">
              Sign out
            </a>
          </li>
        </ul>
      </nav> */}

      <Routes>
        <Route
          path="/"
          element={
            <Layout
              metaMaskStatusColor={metaMaskStatusColor}
              networkStatusColor={networkStatusColor}
            />
          }
        >
          <Route
            index
            element={
              <Connect
                currentAccount={currentAccount}
                handleClick={connectWalletAction}
                rinkebyConnectionStatus={connectedToRinkeby}
              />
            }
          />
          <Route
            path="connect"
            element={
              <Connect
                currentAccount={currentAccount}
                handleClick={connectWalletAction}
                rinkebyConnectionStatus={connectedToRinkeby}
              />
            }
          />
          <Route
            path="battle"
            element={
              <Battle
                setCharacterNFT={setCharacterNFT}
                characterNFT={characterNFT}
                currentAccount={currentAccount}
                rinkebyConnectionStatus={connectedToRinkeby}
              />
            }
          />
          <Route
            path="mint"
            element={
              <SelectCharacter
                setCharacterNFT={setCharacterNFT}
                characterNFT={characterNFT}
              />
            }
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
