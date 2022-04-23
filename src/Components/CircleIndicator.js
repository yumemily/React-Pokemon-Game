import React from 'react';
import { faCircle } from '@fortawesome/free-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const CircleIndicator = ({ statusMessage, statusColor }) => {
  return (
    <div
      data-toggle="tooltip"
      data-placement="top"
      title={
        statusMessage === 'MetaMask'
          ? 'MetaMask locked. Sign in!'
          : 'You need to be on Rinkeby!'
      }
    >
      <FontAwesomeIcon
        icon={faCircle}
        className={statusColor}
        style={{ paddingRight: 10 }}
      />
      {statusMessage}
    </div>
  );
};

export default CircleIndicator;
