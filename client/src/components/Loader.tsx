import React from 'react';

const Loader: React.FC = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-10 h-10 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default Loader;
