import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    await axios.post('http://localhost:3000/check-user', { username, password })
      .then((response) => {
        if(response.data.exist) {
          setShowError(false);
          navigate('/todo');
        }
        else {
          setShowError(true);
        }
      });
  }
  
  return (
    <div className="w-screen h-screen flex justify-center items-center bg-gradient-to-br from-purple-200 to-purple-400">
      <div className="w-96 p-8 bg-white rounded-2xl shadow-2xl border-4 border-pink-400">
        <h1 className="text-4xl font-extrabold text-center text-purple-700 mb-6 drop-shadow-lg font-serif">
          LOGIN
        </h1>

        {showError && (
          <div className="bg-pink-200 text-pink-800 p-3 rounded-lg font-semibold text-center border border-pink-400 mb-4">
            Invalid username and password, kupal.
          </div>
        )}

        <div className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-purple-900 font-medium">Username</label>
            <input
              type="text"
              id="username"
              className="w-full px-4 py-3 border-2 border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-purple-900 font-medium">Password</label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border-2 border-pink-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-md"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
          </div>

          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3 bg-purple-600 text-white rounded-xl shadow-lg hover:bg-purple-700 transition-all duration-300 border-2 border-pink-400 font-bold text-lg"
          >
            LOGIN
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
