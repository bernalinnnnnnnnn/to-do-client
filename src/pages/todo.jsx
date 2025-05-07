import { useEffect, useState } from "react";
import axios from "axios";
import AddModal from "../components/AddModal";

function Todo() {
  const apiUrl = import.meta.env.VITE_ENDPOINT_URL;
  const [titles, setTitles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [ongoingTasks, setOngoingTasks] = useState({});
  const [completedTasks, setCompletedTasks] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    const result = await axios.get(`${apiUrl}/get-all-tasks`);
    setTitles(result.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6 md:p-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4">
          <h1 className="text-xl sm:text-2xl font-bold">Your Tasks</h1>
          <button
            onClick={() => setShowModal(true)}
            className="bg-green-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg hover:bg-green-600 text-sm sm:text-base w-full sm:w-auto"
          >
            + Add Task
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-gray-500">Loading tasks...</p>
          </div>
        ) : titles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-500 mb-2">No tasks found</p>
            <p className="text-sm text-gray-400">Click the "Add Task" button to create your first task</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {titles.map((item) => (
              <li key={item.id} className="border rounded-lg p-3 transition-all hover:shadow-md">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-sm sm:text-base">{item.title}</h2>
                  <button
                    onClick={() => toggleExpand(item.id)}
                    className="text-blue-500 hover:underline text-xs sm:text-sm ml-2"
                  >
                    {expandedId === item.id ? "Hide" : "View"}
                  </button>
                </div>
                {expandedId === item.id && (
                  <ul className="mt-2 list-disc pl-5 text-xs sm:text-sm text-gray-700">
                    {item.tasks.map((task, idx) => (
                      <li key={idx} className="py-1">{task}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {showModal && (
        <AddModal
          hide={() => setShowModal(false)}
          onTaskAdded={fetchData}
        />
      )}
    </div>
  );
}

export default Todo;