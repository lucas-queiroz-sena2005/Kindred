import React from 'react';
import { Link } from 'react-router-dom';

function LoginPage(): React.ReactElement {
    return (
        <div className="p-8 bg-white rounded shadow-md w-full max-w-sm mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
            {/* Login form will go here */}
            <p className="text-center text-sm mt-4">
                Don't have an account? <Link to="/register" className="text-purple-600 hover:underline">Register</Link>
            </p>
        </div>
    );
}

export default LoginPage;