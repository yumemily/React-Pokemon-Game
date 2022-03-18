import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../constants";
import myEpicGame from "../utils/MyEpicGame.json";
import LoadingIndicator from "./LoadingIndicator";
import Player from "./Player";

const Arena = ({ characterNFT, setCharacterNFT, currentAccount }) => {
  const [gameContract, setGameContract] = useState(null);
  const [boss, setBoss] = useState(null);
  const [attackState, setAttackState] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [players, setPlayers] = useState([]);

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
    const fetchBoss = async () => {
      const bossTxn = await gameContract.getBigBoss();
      console.log("Boss:", bossTxn);
      setBoss(transformCharacterData(bossTxn));
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

      gameContract.on("AttackComplete", onAttackCompletion);
    }

    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackCompletion);
      }
    };
  }, [gameContract]);

  return (
    <div className="arena-container">
      {boss && characterNFT && (
        <div id="toast" className={showToast ? "show" : ""}>
          <div id="desc">{`💥 ${boss.name} was hit for ${characterNFT.attackDamage}!`}</div>
        </div>
      )}
      {/* Boss */}
      {boss && (
        <div className="boss-container">
          <div className={`boss-content ${attackState}`}>
            <h2>🔥 {boss.name} 🔥</h2>
            <div className="image-content">
              <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
              <div className="health-bar">
                <progress value={boss.hp} max={boss.maxHp} />
                <p>{`${boss.hp} / ${boss.maxHp} HP`}</p>
              </div>
            </div>
          </div>
          <div className="attack-container">
            <button className="cta-button" onClick={runAttackAction}>
              {`💥 Attack ${boss.name}`}
            </button>
          </div>
          {/* Attack loading */}
          {attackState === "attacking" && (
            <div className="loading-indicator">
              <LoadingIndicator />
              <p>Attacking ⚔️</p>
            </div>
          )}
        </div>
      )}

      {/* Current Player's Character NFT */}
      {characterNFT && (
        <Player characterNFT={characterNFT} title={"Your Pokemon"} />
      )}

      <h2>Teammates</h2>

      {/* Teammates NFT */}
      {players &&
        players.map((p) => {
          return <Player characterNFT={p} title={p.player} key={p.player} />;
        })}
    </div>
  );
};

export default Arena;
