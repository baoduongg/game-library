import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <p className="text-gray-400">
            &copy; {new Date().getFullYear()} Game Library. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
