import React from 'react';
import { Link } from 'react-router-dom';

function RegisterPage(): React.ReactElement {
    return (
        <div className="p-8 bg-white rounded shadow-md w-full max-w-sm mx-auto mt-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Account</h1>
            {/* Registration form will go here */}
            <p className="text-center text-sm mt-4">
                Already have an account? <Link to="/login" className="text-purple-600 hover:underline">Login</Link>
            </p>
        </div>
    );
}

export default RegisterPage;