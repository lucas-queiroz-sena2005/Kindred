import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SideBar from './components/SideBar';

// --- Placeholder Page Components ---
const HomePage = () => <div>Home Feed Page</div>;
const DiscoverPage = () => <div>Discover Users Page</div>;
const ProfilePage = () => <div>User Profile Page</div>;
const RankingPage = () => <div>Ranking Creation Page</div>;
const LoginPage = () => <div>Login Page</div>;
const RegisterPage = () => <div>Register Page</div>;
const NotFoundPage = () => <div>404 Not Found</div>;

function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-gray-50">
        {/* The persistent sidebar navigation */}
        <SideBar />

        {/* The main content area that will contain the pages */}
        <main className="flex-grow flex justify-center py-8">
          {/* A centered container for the content itself */}
          <div className="w-full max-w-2xl px-4">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/discover" element={<DiscoverPage />} />
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/rank/:templateId" element={<RankingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;