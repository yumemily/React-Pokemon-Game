import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import {
  CONTRACT_ADDRESS,
  transformCharacterData,
  transformBossData,
} from "../constants";
import myEpicGame from "../utils/MyEpicGame.json";
import LoadingIndicator from "./LoadingIndicator";
import Player from "./Player";
import {
  CircularProgressbarWithChildren,
  buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

const Arena = ({ characterNFT, setCharacterNFT, currentAccount }) => {
  // Constants

  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [players, setPlayers] = useState([]);
  const [bossPath, setBossPath] = useState({
    bossColorPath: `rgba(4, 194, 48)`,
    bossPercentage: 0,
  });

  const [characterPath, setCharacterPath] = useState({
    characterColorPath: `rgba(4, 194, 48)`,
    characterPercentage: 0,
  });

  const { bossColorPath, bossPercentage } = bossPath;
  const { characterColorPath, characterPercentage } = characterPath;

  let otherPlayersOnly = [];

  const runAttackAction = async () => {
    try {
      if (gameContract) {
        setAttackState("attacking");
        console.log("Attacking boss...");
        const attackTxn = await gameContract.attackBoss();
        await attackTxn.wait();
        console.log("attackTxn:", attackTxn);
        setAttackState("hit");
        setShowToast(true);
        setTimeout(() => {
          setShowToast(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error attacking boss:", error);
      setAttackState("");
    }
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
      console.log("Ethereum object not found");
    }
  }, []);

  useEffect(() => {
    if (boss && characterNFT) {
      let bossPercentage = (boss.hp / boss.maxHp) * 100;
      let colorPath = getPercentageColor(bossPercentage);
      setBossPath((prev) => {
        {
          return { ...prev, bossColorPath: colorPath, bossPercentage };
        }
      });
      let characterPercentage = (characterNFT.hp / characterNFT.maxHp) * 100;
      let characterColorPath = getPercentageColor(characterPercentage);
      setCharacterPath((prev) => {
        {
          return { ...prev, characterColorPath, characterPercentage };
        }
      });
      console.log("BOSS", boss);
      console.log("PLAYER", characterNFT);
      console.log("NEWHP", boss.hp);
      console.log("NEWHP", characterNFT.hp);
    }
  }, [boss, characterNFT]);

  useEffect(() => {
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      let bossData = transformBossData(bossTxn);
      setBoss(bossData);
    };

    const fetchPlayers = async () => {
      let playersTxn = await gameContract.getAddresses();
      console.log("Players:", playersTxn);
      otherPlayersOnly = playersTxn.filter(
        (p) => p.toLowerCase() !== currentAccount
      );
      console.log("other players", otherPlayersOnly);

      let unresolvedPromises = [];

      for (let player of otherPlayersOnly) {
        let res = await gameContract.checkIfUserHasNFT(player);
        res = { ...res, player };
        console.log("res", res);
        unresolvedPromises.push(res);
      }

      const results = await Promise.all(unresolvedPromises);

      console.log("results", results);

      let transformedPlayersMap = results.map((el) => {
        let player = el.player;
        let transform = transformCharacterData(el);
        return (transform = { ...transform, player });
      });

      setPlayers(transformedPlayersMap);
      console.log("transformedmap", transformedPlayersMap);
    };

    const onAttackCompletion = (from, newBossHp, newPlayerHp) => {
      const bossHp = newBossHp.toNumber();
      const playerHp = newPlayerHp.toNumber();
      const sender = from.toString().toLowerCase();

      console.log(
        `Attack Completed: Boss HP: ${bossHp} and Player HP: ${playerHp}`
      );

      if (currentAccount === sender) {
        console.log("updating player and boss state");
        setBoss((prev) => {
          return { ...prev, hp: bossHp };
        });
        // let updatedBoss = { ...boss, hp: bossHp };
        // setBoss(updatedBoss);

        setCharacterNFT((prev) => {
          {
            return { ...prev, hp: playerHp };
          }
        });
      } else {
        console.log("updating only boss state");
        setBoss((prev) => {
          return { ...prev, hp: bossHp };
        });
      }
    };

    if (gameContract) {
      fetchBoss();
      fetchPlayers();
      console.log(characterNFT);
      gameContract.on("AttackComplete", onAttackCompletion);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackCompletion);
      }
    };
  }, [gameContract]);

  const getPercentageColor = (percentage) => {
    if (percentage >= 75) return `rgb(4, 194, 48)`;
    else if (percentage >= 50 && percentage < 75) return `rgb(255,255,0)`;
    else if (percentage >= 25 && percentage < 50) return `rgb(255,117,24)`;
    else if (percentage < 25) return `rgb(255, 69, 51)`;
  };

  if (!boss && !characterNFT) {
    return <div>loading...</div>;
  }

  return (
    <div className="battle-area pt-4">
      <div className="row container-arena">
        <div className="col-md-5 col-sm-12 ">
          {boss && (
            <div className="boss-area">
              <h4>{boss.trainer}</h4>
              <CircularProgressbarWithChildren
                value={bossPercentage}
                styles={buildStyles({
                  strokeLinecap: "butt",
                  pathTransitionDuration: 0.5,
                  pathColor: bossColorPath,
                  trailColor: "#d6d6d6",
                })}
              >
                <div className="img-content">
                  <img
                    src={`https://cloudflare-ipfs.com/ipfs/${boss.imageURI}`}
                    alt={`Character ${boss.name}`}
                  />
                </div>
              </CircularProgressbarWithChildren>
              <div className="boss-info mt-3">
                <ul>
                  <li>{boss.name}</li>
                  <li>
                    {boss.hp}/{boss.maxHp} HP
                  </li>
                  <li>⚔️{boss.attackDamage}</li>
                </ul>
              </div>
            </div>
          )}
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
          {characterNFT && boss && (
            <div className="player-area">
              <h4>You</h4>
              <CircularProgressbarWithChildren
                value={characterPercentage}
                styles={buildStyles({
                  strokeLinecap: "butt",
                  pathTransitionDuration: 0.5,
                  pathColor: characterColorPath,
                  trailColor: "#d6d6d6",
                })}
              >
                <div className="img-content">
                  <img
                    src={`https://cloudflare-ipfs.com/ipfs/${characterNFT.imageURI}`}
                    alt={`Character ${characterNFT.name}`}
                  />
                </div>
              </CircularProgressbarWithChildren>
              <div className="player-info mt-3">
                <ul>
                  <li>{characterNFT.name}</li>
                  <li>
                    {characterNFT.hp}/{characterNFT.maxHp} HP
                  </li>
                  <li>⚔️{characterNFT.attackDamage}</li>
                  <li>{characterNFT.type}</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Arena;
