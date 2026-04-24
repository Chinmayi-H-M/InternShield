import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Checker from './pages/Checker';
import Dashboard from './pages/Dashboard';
import Report from './pages/Report';
import FAQ from './pages/FAQ';
import Blog from './pages/Blog';
import Contact from './pages/Contact';

function App() {
  return (
    <Router>
      <div className="flex flex-col" style={{ minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1, paddingBottom: '3rem' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/check" element={<Checker />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/report" element={<Report />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
