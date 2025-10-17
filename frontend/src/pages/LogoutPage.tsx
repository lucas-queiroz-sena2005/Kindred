import React from 'react';

function LogoutPage(): React.ReactElement {
    // In a real app, you would handle logout logic here (e.g., clear tokens)
    // and then redirect the user, perhaps with useNavigate().

    return (
        <div className="p-8">Logging you out...</div>
    );
}

export default LogoutPage;