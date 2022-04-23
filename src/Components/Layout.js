import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = ({
  handleChange,
  view,
  metaMaskStatusColor,
  networkStatusColor,
}) => {
  return (
    <div className="container-fluid">
      <div className="row">
        {/* Nav Sidebar */}
        <Sidebar
          handleChange={handleChange}
          view={view}
          metaMaskStatusColor={metaMaskStatusColor}
          networkStatusColor={networkStatusColor}
        />
        <main
          role="main"
          class=" wrapper col-md-9 ml-sm-auto col-lg-10 pt-3 px-4"
        >
          <div className="container content d-flex justify-content-center text-center">
            <div className="header-container">
              <p className="header gradient-text">⚔️ Pokemon Metaverse ⚔️</p>
              <p className="sub-text">
                Defeat gym leaders and become a Pokemon Master!
              </p>
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
