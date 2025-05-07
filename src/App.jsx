import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showError, setShowError] = useState(false);

  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;

  const handleLogin = async () => {
    await axios.post(`${apiUrl}/check-user`, { username, password })
      .then((response) => {
        if (response.data === true) {
          navigate("/todo");
        } else {
          setShowError(true);
        }
      })
      .catch(() => setShowError(true));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-sm">
        <h1 className="text-xl font-semibold mb-4 text-center">Login</h1>
        {showError && (
          <div className="mb-2 text-sm text-red-500">Invalid credentials</div>
        )}
        <input
          type="text"
          placeholder="Username"
          className="w-full p-2 mb-3 border rounded-lg"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 mb-4 border rounded-lg"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default App;