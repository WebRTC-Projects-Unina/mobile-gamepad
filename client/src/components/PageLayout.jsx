import React from 'react';

const PageLayout = ({ children }) => {
  return (
    <div className="page-container">
      <div className="content-wrapper">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;