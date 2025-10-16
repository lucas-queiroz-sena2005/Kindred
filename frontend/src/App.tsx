import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import FeedPage from './pages/FeedPage';
import MyTierlistsPage from './pages/MyTierlistsPage';
import KinPage from './pages/KinPage';
import AccountPage from './pages/AccountPage';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<FeedPage />} />
                    <Route path="/tierlists" element={<MyTierlistsPage />} />
                    <Route path="/kin" element={<KinPage />} />
                    <Route path="/account" element={<AccountPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;