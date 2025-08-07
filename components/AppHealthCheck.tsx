import React from 'react';

const AppHealthCheck: React.FC = () => {
  return (
    <div className="fixed top-4 left-4 z-50 bg-green-600 text-white px-3 py-1 rounded text-sm">
      ✅ App Loaded Successfully
    </div>
  );
};

export default AppHealthCheck;
