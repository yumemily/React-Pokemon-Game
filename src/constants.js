const CONTRACT_ADDRESS = "0x3Aa30F1bDe7cd646aE56a5Fe25d5caA11fD6FEe4";

const transformCharacterData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    type: characterData.characterType,
  };
};

const transformBossData = (characterData) => {
  return {
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    type: characterData.characterType,
    trainer: characterData.trainer,
  };
};

export { CONTRACT_ADDRESS, transformCharacterData, transformBossData };
