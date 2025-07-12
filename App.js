import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import QuestionList from './components/Questions/QuestionList';
import QuestionDetail from './components/Questions/QuestionDetail';
import AskQuestion from './components/Questions/AskQuestion';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<QuestionList />} />
          <Route path="/questions/:id" element={<QuestionDetail />} />
          <Route path="/ask" element={<AskQuestion />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;