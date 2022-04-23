import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, transformCharacterData } from '../constants';
import myEpicGame from '../utils/MyEpicGame.json';

const SelectCharacter = ({ characterNFT, setCharacterNFT }) => {
  // 2 scenarios
  // 1. User has not minted their first pokemon. Render => Pokemon Select
  // 2. User alrdy has their first pokemon. Render => You are ready to battle.
  const [characters, setCharacters] = useState([]);
  const [gameContract, setGameContract] = useState(null);
  const [mintingCharacter, setMintingCharacter] = useState(false);
  const [onMintingCompleteMsg, setOnMintingCompleteMsg] = useState('');

  const mintCharacterNFTAction = async (characterId) => {
    try {
      if (gameContract) {
        setMintingCharacter(true);
        console.log('Minting character in progress...');
        const mintTxn = await gameContract.mintCharacterNFT(characterId);
        await mintTxn.wait();
        console.log('mintTxn:', mintTxn);
        setMintingCharacter(false);
      }
    } catch (error) {
      console.warn('MintCharacterAction Error:', error);
      setMintingCharacter(false);
    }
  };

  useEffect(() => {
    const { ethereum } = window;
    console.log('I AM REMOUNTING!!');
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      setGameContract(gameContract);
    } else {
      console.log('Ethereum object not found');
    }
  }, []);

  useEffect(() => {
    const getCharacters = async () => {
      try {
        console.log('Getting contract characters to mint');

        /*
         * Call contract to get all mint-able characters
         */
        const charactersTxn = await gameContract.getAllDefaultCharacters();
        console.log('charactersTxn:', charactersTxn);

        /*
         * Go through all of our characters and transform the data
         */
        const characters = charactersTxn.map((characterData) =>
          transformCharacterData(characterData)
        );

        setCharacters(characters);
      } catch (error) {
        console.error('Something went wrong fetching characters:', error);
      }
    };

    /*
     * Add a callback method that will fire when this event is received
     */
    const onCharacterMint = async (sender, tokenId, characterIndex) => {
      console.log(
        `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
      );

      /*
       * Once our character NFT is minted we can fetch the metadata from our contract
       * and set it in state to move onto the Arena
       */
      setOnMintingCompleteMsg(
        `Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
      );
      setCharacterNFT(characters[characterIndex.toNumber()]);
      // alert(
      //   `Your NFT is all done -- see it here: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
      // );
    };

    /*
     * If our gameContract is ready, let's get characters!
     */
    if (gameContract) {
      getCharacters();
      /*
       * Setup NFT Minted Listener
       */
      gameContract.on('CharacterNFTMinted', onCharacterMint);
      console.log(gameContract.listenerCount('CharacterNFTMinted'));
    }

    return () => {
      /*
       * Always clean up listeners or else
         Memory leaks!! Why did it still give an error!!
       */
      if (gameContract) {
        gameContract.off('CharacterNFTMinted', onCharacterMint);
      }

      setMintingCharacter(false);
    };
    // gameContract is in the dependency but it's not a primitive data type
    // won't gameContract be considered a new obj on every rerender?
  }, [gameContract]);

  const renderCharacters = () =>
    characters.map((character, index) => (
      <div className="character-item" key={character.name}>
        <div className="name-container">
          <p>{character.name}</p>
        </div>
        <img
          src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`}
          alt={character.name}
        />
        <button
          type="button"
          className="character-mint-button"
          onClick={() => mintCharacterNFTAction(index)}
        >{`Mint ${character.name}`}</button>
      </div>
    ));

  if (characterNFT !== null) {
    return (
      <div>
        You already have your first Pokemon! Feel free to battle with it.
      </div>
    );
  }

  return (
    <div className="select-character-container">
      <h5>Mint Your Starter Pokemon! Choose wisely. You can only pick one.</h5>
      {mintingCharacter && <div className="loading">Minting...</div>}
      <div>{onMintingCompleteMsg}</div>
      {characters.length > 0 && (
        <div className="character-grid">{renderCharacters()}</div>
      )}
    </div>
  );
};

export default SelectCharacter;
