import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import './styles/DocumentViewer.css';
import LandingPage from './components/LandingPage';
import MainScreen from './components/MainScreen';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<MainScreen />} />
        {/* Add more routes as needed */}
        <Route path="*" element={
          <div className="error-page">
            <h1>404 - Page Not Found</h1>
            <p>The page you are looking for does not exist.</p>
            <a href="/" className="btn btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;

