import React from 'react';

const Home = () => {
  return (
    <div className="min-h-[calc(100vh-128px)] flex flex-col items-center justify-center bg-white px-4">
      <h1 className="text-4xl font-bold text-indigo-700 mb-4">Welcome to BookTable</h1>
      <p className="text-gray-600 text-lg text-center max-w-md">
        Find and reserve tables at your favorite restaurants. Discover trending places around you!
      </p>
    </div>
  );
};

export default Home;
