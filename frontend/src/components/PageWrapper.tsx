import React from 'react';

interface PageWrapperProps {
    title: string;
    children: React.ReactNode;
}

function PageWrapper({ title, children }: PageWrapperProps): React.ReactElement {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-4">{title}</h1>
            <div>{children}</div>
        </div>
    );
}

export default PageWrapper;