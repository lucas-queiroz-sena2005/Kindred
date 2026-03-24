import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "@/layout/Layout";
import FeedPage from "@/pages/FeedPage";
import MyTierlistsPage from "@/pages/MyTierlistsPage";
import KinPage from "@/pages/KinPage";
import AccountPage from "@/pages/AccountPage";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import NotFoundPage from "@/pages/NotFoundPage";
import MessagesPage from "@/pages/MessagesPage";
import TierListPage from "@/pages/TierListPage";
import { AuthProvider } from "@/features/auth/AuthProvider";
import { ThemeProvider } from "@/theme/ThemeProvider";
import { TmdbConfigProvider } from "@/shared/context/TmdbConfigProvider";
import Conversation from "@/features/messages/Conversation";
import ProtectedRoute from "@/features/auth/ProtectedRoute";

const queryClient = new QueryClient();

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <TmdbConfigProvider>
            <BrowserRouter>
              <Routes>
                <Route element={<Layout />}>
                  <Route element={<ProtectedRoute />}>
                    <Route index element={<FeedPage />} />
                    <Route path="/tierlists" element={<MyTierlistsPage />} />
                    <Route path="/kin" element={<KinPage />} />
                    <Route path="/account" element={<AccountPage />} />
                    <Route path="/messages" element={<MessagesPage />}>
                      <Route path=":targetId" element={<Conversation />} />
                    </Route>
                    <Route path="/tierlists/:id" element={<TierListPage />} />
                  </Route>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TmdbConfigProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
