import React from 'react';
import { Heart } from 'lucide-react';

function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-12">
      <div className="max-w-7xl mx-auto px-4 text-center flex items-center justify-center gap-1 text-sm">
        <span>Developed with</span>
        <Heart className="w-4 h-4 text-red-500 inline" />
        <span>by Muhammad Harmain Ansari</span>
      </div>
    </footer>
  );
}

export default Footer;
