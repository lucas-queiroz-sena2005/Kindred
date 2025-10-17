import React from 'react';
import { Link } from 'react-router-dom';

function NotFoundPage(): React.ReactElement {
    return (
        <div>
            <h1>404</h1>
            <p>Page Not Found</p>
            <Link to="/">Go to Homepage</Link>
        </div>
    );
}

export default NotFoundPage;