import React from 'react';

function Topbar(): React.ReactElement {
    return (
        <header className="bg-neutral-200 border-b border-neutral-300">
            <div className="flex items-center justify-between p-4">
                <h1 className="font-bold text-lg">Kindred</h1>
                <div className="flex-1 max-w-md mx-4">
                     <input type="search" placeholder="Search..." className="w-full px-2 py-1 rounded bg-neutral-100"/>
                </div>
            </div>
        </header>
    );
}

export default Topbar;