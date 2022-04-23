import { render } from '@testing-library/react';
import React from 'react';

const Connect = ({ currentAccount, handleClick, rinkebyConnectionStatus }) => {
  // Many scenarios
  // 1. No MetaMask wallet extension => button should display "Please get MetaMask"  and cursor: not-allowed
  // 2. Has MetaMask but is on the wrong network => button should display "Please connect to      Rinkeby" and cursor: not-allowed
  // 2. Has MetaMask but not signed in yet => button should display "Connect to MetaMask"
  // 3. Has MetaMask and is signed in => should display "Connected! Feel free to battle in the arena!"
  const { ethereum } = window;

  const renderButtonText = () => {
    if (!ethereum) {
      return 'You need a MetaMask wallet';
    } else if (rinkebyConnectionStatus === 'not connected') {
      return 'Please connect to the Rinkeby network.';
    } else if (!currentAccount && rinkebyConnectionStatus === 'connected') {
      return 'Connect Wallet To Get Started';
    } else if (currentAccount && rinkebyConnectionStatus === 'connected') {
      return 'MetaMask connected!';
    }
  };
  return (
    <div className="connect-wallet-container">
      <img
        src="https://media.giphy.com/media/8UGGp7rQvfhe63HrFq/giphy.gif"
        alt="Monty Python Gif"
      />
      <button
        className={`cta-button connect-wallet-button ${
          currentAccount || rinkebyConnectionStatus === 'not connected'
            ? 'inactive'
            : ''
        }`}
        onClick={handleClick}
      >
        {renderButtonText()}
      </button>
    </div>
  );
};

export default Connect;
