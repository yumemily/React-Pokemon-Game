import React from "react";

const Player = ({ characterNFT, title }) => {
  return (
    <div className="players-container">
      <div className="player-container">
        <h2>{title}</h2>
        <div className="player">
          <div className="image-content">
            <h2>{characterNFT.name}</h2>
            <img
              src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
              alt={`Character ${characterNFT.name}`}
            />
            <div className="health-bar">
              <progress value={characterNFT.hp} max={characterNFT.maxHp} />
              <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
            </div>
          </div>
          <div className="stats">
            <h4>{`⚔️ Attack Damage: ${characterNFT.attackDamage}`}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player;
