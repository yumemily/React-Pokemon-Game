import React from 'react';
import { NavLink } from 'react-router-dom';
import CircleIndicator from './CircleIndicator';

const Sidebar = ({ metaMaskStatusColor, networkStatusColor }) => {
  return (
    <nav className="col-md-2 d-none d-md-block sidebar text-center ">
      <div className="sidebar-sticky ">
        <ul className="nav flex-column">
          <li className="nav-item logo mt-4 ">
            <img
              src="https://www.freepnglogos.com/uploads/pok-mon-go-logo-png-30.png"
              alt=""
              style={{ width: 78 }}
            />
            <p style={{ fontSize: 'larger' }}>MetaVerse Master</p>
          </li>
          <li className="nav-item d-flex justify-content-center">
            <div className="status-indicators ">
              <CircleIndicator
                statusMessage={'MetaMask'}
                statusColor={metaMaskStatusColor}
              />
              <CircleIndicator
                statusMessage={'Rinkeby'}
                statusColor={networkStatusColor}
              />
            </div>
          </li>
          <li className="nav-item">
            <NavLink
              to="/connect"
              className={({ isActive }) =>
                isActive
                  ? 'nav-link-button nav-link active nav-active'
                  : 'nav-link-button nav-link inactive'
              }
            >
              Connect
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/mint"
              className={({ isActive }) =>
                isActive
                  ? 'nav-link-button nav-link active nav-active'
                  : 'nav-link-button nav-link inactive'
              }
            >
              Mint
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/battle"
              className={({ isActive }) =>
                isActive
                  ? 'nav-link-button nav-link active nav-active'
                  : 'nav-link-button nav-link inactive'
              }
            >
              Battle
            </NavLink>
          </li>
          {/* Coming Soon */}
          {/* 
          <li className="nav-item">
            <a
              className={`nav-link active nav-link-button ${
                view === 'pokemon' ? 'nav-active' : ''
              }`}
              href="#"
              onClick={() => handleChange('pokemon')}
            >
              <span data-feather="shopping-cart"></span>
              Your Pokemon
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link active nav-link-button ${
                view === 'marketplace' ? 'nav-active' : ''
              }`}
              href="#"
              onClick={() => handleChange('marketplace')}
            >
              <span data-feather="users"></span>
              Marketplace
            </a>
          </li> */}
        </ul>
      </div>
    </nav>
  );
};

export default Sidebar;
