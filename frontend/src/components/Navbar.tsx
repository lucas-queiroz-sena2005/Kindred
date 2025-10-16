import React from 'react';
import { Link } from 'react-router-dom';

function Navbar(): React.ReactElement {
    return (
        <nav className="bg-white border-b border-neutral-200 sticky top-0 z-10">
            <ul className="flex items-center justify-center space-x-8 h-12 text-sm font-medium text-neutral-600">
                <li><Link to="/" className="hover:text-purple-600 transition-colors">Feed</Link></li>
                <li><Link to="/tierlists" className="hover:text-purple-600 transition-colors">My Tierlists</Link></li>
                <li><Link to="/kin" className="hover:text-purple-600 transition-colors">My Kin</Link></li>
                <li><Link to="/account" className="hover:text-purple-600 transition-colors">My Account</Link></li>
            </ul>
        </nav>
    );
}

export default Navbar;