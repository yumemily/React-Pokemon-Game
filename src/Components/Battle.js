import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import {
  CONTRACT_ADDRESS,
  transformCharacterData,
  transformBossData,
} from '../constants';
import myEpicGame from '../utils/MyEpicGame.json';
import Player from './Player';

const Battle = ({
  characterNFT,
  setCharacterNFT,
  currentAccount,
  rinkebyConnectionStatus,
}) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [players, setPlayers] = useState([]);
  const [bossPath, setBossPath] = useState({
    path: `rgba(4, 194, 48)`,
    percentage: 0,
  });
  const [characterPath, setCharacterPath] = useState({
    path: `rgba(4, 194, 48)`,
    percentage: 0,
  });
  const [bossLoading, setBossLoading] = useState(true);

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking boss...');
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackState('hit');
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
    }
  };

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return `rgb(4, 194, 48)`;
    else if (percentage >= 50 && percentage < 75) return `rgb(255,255,0)`;
    else if (percentage >= 25 && percentage < 50) return `rgb(255,117,24)`;
    else if (percentage < 25) return `rgb(255, 69, 51)`;
  };

  useEffect(() => {
    const { ethereum } = window;

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
    console.log('Battle component mounted');
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      const bossData = transformBossData(bossTxn);
      getPlayerPaths(bossData);
      setBoss(bossData);
      setBossLoading(false);
    };

    const getPlayerPaths = (boss) => {
      let bossPercentage = (boss.hp / boss.maxHp) * 100;
      let colorPath = getPercentageColor(bossPercentage);
      setBossPath((prev) => {
        {
          return { ...prev, path: colorPath, percentage: bossPercentage };
        }
      });
      let characterPercentage = (characterNFT.hp / characterNFT.maxHp) * 100;
      let characterColorPath = getPercentageColor(characterPercentage);
      setCharacterPath((prev) => {
        {
          return {
            ...prev,
            path: characterColorPath,
            percentage: characterPercentage,
          };
        }
      });
      console.log('BOSS', boss);
      console.log('PLAYER', characterNFT);
      console.log('NEWHP', boss.hp);
      console.log('NEWHP', characterNFT.hp);

      console.log(characterNFT);
      gameContract.on('AttackComplete', onAttackCompletion);
    };

    const fetchPlayers = async () => {
      // Get all the players in the game
      const playersTxn = await gameContract.getAddresses();
      console.log('Players:', playersTxn);
      // Filter the current player
      const otherPlayersOnly = playersTxn.filter(
        (p) => p.toLowerCase() !== currentAccount
      );
      console.log('other players', otherPlayersOnly);

      const promisesArray = [];
      for (let player of otherPlayersOnly) {
        let res = await gameContract.checkIfUserHasNFT(player);
        res = { ...res, player };
        promisesArray.push(res);
      }

      const playersInfo = await Promise.all(promisesArray);

      console.log('results', playersInfo);

      const transformedPlayersArray = playersInfo.map((el) => {
        const { player } = el;
        let transform = transformCharacterData(el);
        return (transform = { ...transform, player });
      });

      setPlayers(transformedPlayersArray);
      console.log('transformedPlayersArray', transformedPlayersArray);
    };

    const onAttackCompletion = (from, newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      const sender = from.toString().toLowerCase();

      console.log(
        `Attack Completed: Boss HP: ${bossHp} and Player HP: ${playerHp}`
      );

      // Check if currentAccount is the sender so only the sender's HP will update

      if (currentAccount === sender) {
        console.log('updating player and boss state');
        setBoss((prev) => {
          return { ...prev, hp: bossHp };
        });

        setCharacterNFT((prev) => {
          {
            return { ...prev, hp: playerHp };
          }
        });
      } else {
        console.log('updating only boss state');
        setBoss((prev) => {
          return { ...prev, hp: bossHp };
        });
      }
    };

    if (gameContract && characterNFT && bossLoading) {
      fetchBoss();
      console.log('Battle component mounted');
    }

    return () => {
      if (gameContract) {
        gameContract.off('AttackComplete', onAttackCompletion);
      }
    };
  }, [gameContract, characterNFT]);

  if (rinkebyConnectionStatus === 'not connected') {
    return <div>Please connect to Rinkeby</div>;
  }

  if (bossLoading || !characterNFT) {
    return <div>Loading...</div>;
  }

  return (
    <div className="battle-area pt-4">
      <div className="row container-arena">
        <div className="col-md-5 col-sm-12 ">
          <Player character={boss} playerPath={bossPath} />
        </div>
        <div className="col-md-2 col-sm-12 d-flex justify-content-center align-items-center">
          <div className="attack-area ">
            <div className={`img-content ${attackState}`}>
              <img
                src="https://img.icons8.com/fluency/344/battle.png"
                alt="battleIcon"
                onClick={runAttackAction}
              />
            </div>
            <div>Attack!</div>
          </div>
        </div>
        <div className="col-md-5 col-sm-12">
          <Player character={characterNFT} playerPath={characterPath} />
        </div>
        {/* Other players */}
        {/* {players &&
          players.map((p) => {
            const id = p.player.slice(38);
            return <div key={p.name}>0x...{id}</div>;
          })} */}
      </div>
    </div>
  );
};

export default Battle;
