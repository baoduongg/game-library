import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-800">Game Library</div>
          <ul className="flex space-x-6">
            <li>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Home
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                Games
              </a>
            </li>
            <li>
              <a
                href="#"
                className="text-gray-600 hover:text-gray-900 transition"
              >
                About
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
