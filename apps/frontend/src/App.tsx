import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Placeholder routes for future implementation */}
          <Route path="/demo" element={<DemoPlaceholder />} />
          <Route path="/privacy" element={<PrivacyPlaceholder />} />
          <Route path="/terms" element={<TermsPlaceholder />} />
          <Route path="/contact" element={<ContactPlaceholder />} />
          <Route path="/forgot-password" element={<ForgotPasswordPlaceholder />} />
        </Routes>
      </div>
    </Router>
  );
}

// Placeholder components for routes that will be implemented later
const DemoPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200 text-center max-w-md">
      <h1 className="text-2xl font-bold text-ubuntu-blue-800 mb-4">Demo Coming Soon</h1>
      <p className="text-ubuntu-cool-grey mb-6">Our interactive demo will be available soon!</p>
      <a href="/" className="text-ubuntu-blue-600 hover:text-ubuntu-blue-500 transition-colors">← Back to Home</a>
    </div>
  </div>
);

const PrivacyPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200 text-center max-w-md">
      <h1 className="text-2xl font-bold text-ubuntu-blue-800 mb-4">Privacy Policy</h1>
      <p className="text-ubuntu-cool-grey mb-6">Privacy policy content will be available soon.</p>
      <a href="/" className="text-ubuntu-blue-600 hover:text-ubuntu-blue-500 transition-colors">← Back to Home</a>
    </div>
  </div>
);

const TermsPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200 text-center max-w-md">
      <h1 className="text-2xl font-bold text-ubuntu-blue-800 mb-4">Terms of Service</h1>
      <p className="text-ubuntu-cool-grey mb-6">Terms of service content will be available soon.</p>
      <a href="/" className="text-ubuntu-blue-600 hover:text-ubuntu-blue-500 transition-colors">← Back to Home</a>
    </div>
  </div>
);

const ContactPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200 text-center max-w-md">
      <h1 className="text-2xl font-bold text-ubuntu-blue-800 mb-4">Contact Us</h1>
      <p className="text-ubuntu-cool-grey mb-6">Contact form will be available soon.</p>
      <a href="/" className="text-ubuntu-blue-600 hover:text-ubuntu-blue-500 transition-colors">← Back to Home</a>
    </div>
  </div>
);

const ForgotPasswordPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-ubuntu-blue-50 to-ubuntu-blue-100 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-ubuntu-blue-200 text-center max-w-md">
      <h1 className="text-2xl font-bold text-ubuntu-blue-800 mb-4">Reset Password</h1>
      <p className="text-ubuntu-cool-grey mb-6">Password reset functionality will be available soon.</p>
      <a href="/login" className="text-ubuntu-blue-600 hover:text-ubuntu-blue-500 transition-colors">← Back to Login</a>
    </div>
  </div>
);

export default App;
