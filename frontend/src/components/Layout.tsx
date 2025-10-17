import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Navbar from './Navbar';

function Layout(): React.ReactElement {
    return (
        <div className="bg-neutral-100 text-neutral-900 min-h-screen font-sans">
            <Topbar />
            <Navbar />
            <main className="w-full max-w-6xl mx-auto p-8">
                <Outlet />
            </main>
        </div>
    );
}

export default Layout;
