import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div>
      {/* Navbar and Sidebar can be added here */}
      <main>{children}</main>
    </div>
  );
};

export default Layout;
