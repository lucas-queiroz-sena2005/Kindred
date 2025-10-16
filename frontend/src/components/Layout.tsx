import React from 'react';
import { Outlet } from 'react-router-dom';
import Topbar from './Topbar';
import Navbar from './Navbar';

function Layout(): React.ReactElement {
    return (
        <div className="flex flex-col items-center bg-neutral-100 text-neutral-900 min-h-screen font-sans">
            {/* Full-width bars */}
            <div className="w-full">
                <Topbar />
                <Navbar />
            </div>

            {/* Centered page wrapper */}
            <main className="block w-screen flex justify-center p-8">
                <div className="w-[60%] max-w-6xl min-w-[300px]">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

export default Layout;
