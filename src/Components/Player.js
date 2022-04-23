import React from 'react';
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

const Player = ({ character, playerPath, isLoading }) => {
  const { path, percentage } = playerPath;

  if (character !== null) {
    const playerName =
      character.trainer == undefined ? 'You' : character.trainer;
  }

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div className="player-area">
      <h4>{character && character.trainer}</h4>
      <CircularProgressbarWithChildren
        value={percentage}
        styles={buildStyles({
          strokeLinecap: 'butt',
          pathTransitionDuration: 0.5,
          pathColor: path,
          trailColor: '#d6d6d6',
        })}
      >
        <div className="img-content">
          <img
            src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`}
            alt={`Character ${character.name}`}
          />
        </div>
      </CircularProgressbarWithChildren>
      <div className="boss-info mt-3">
        <ul>
          <li>{character.name}</li>
          <li>
            {character.hp}/{character.maxHp} HP
          </li>
          <li>⚔️{character.attackDamage}</li>
          <li>{character.type == undefined ? '' : character.type}</li>
        </ul>
      </div>
    </div>
  );
};

export default Player;
