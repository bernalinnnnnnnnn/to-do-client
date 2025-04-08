import { useState } from "react";
import axios from "axios";

export default function AddModal({ hide, onTaskAdded }) {
    const [title, setTitle] = useState('');
    const [tasks, setTasks] = useState([""]);
    const [loading, setLoading] = useState(false);

    const apiUrl = import.meta.env.VITE_ENDPOINT_URL;

    const addTask = () => {
        setTasks([...tasks, ""]);
    };

    const removeTask = (index) => {
        setTasks(tasks.filter((_, i) => i !== index));
    };

    const saveTasks = async () => {
        if (!title.trim() || tasks.some(task => task.trim() === "")) {
            alert("Please enter a title and at least one task.");
            return;
        }

        setLoading(true);
        try {
            const username = "Admin"; // Replace with actual username if needed

            const response = await axios.post(`${apiUrl}/add-to-do`, {
                username,
                title,
                lists: [{ list_desc: tasks }],
            });

            if (response.data.success) {
                alert("Task added successfully!");
                setTitle("");
                setTasks([""]);
                
                // Call the onTaskAdded callback to refresh the titles list
                if (typeof onTaskAdded === 'function') {
                    onTaskAdded();
                }
                
                hide();
            } else {
                alert("Failed to add task.");
            }
        } catch (error) {
            console.error("Error saving tasks:", error);
            alert("An error occurred while saving.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-purple-900/30">
            <div className="relative w-full max-w-md p-6 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl shadow-2xl border-4 border-pink-400 max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-semibold text-purple-900 font-[\'Parisienne\'] drop-shadow-lg">
                        Add New Task
                    </h3>
                    <button onClick={hide} className="text-pink-500 hover:text-purple-700 transition">
                        <svg
                            className="h-6 w-6"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="2"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="space-y-4 overflow-hidden">
                    {/* Task Title Input */}
                    <div>
                        <label className="block text-lg font-medium text-purple-800 font-[\'Playfair Display\']">
                            Task Title
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            type="text"
                            className="mt-1 p-3 border-2 border-pink-400 rounded-xl w-full shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 font-[\'Playfair Display\']"
                            placeholder="Enter your task title..."
                        />
                    </div>

                    {/* Scrollable Task List */}
                    <div className="mt-3 max-h-[250px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-pink-400 scrollbar-track-purple-100">
                        <label className="block text-lg font-medium text-purple-800 font-[\'Playfair Display\']">
                            Task List
                        </label>
                        <div className="space-y-2">
                            {tasks.map((task, index) => (
                                <div key={index} className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        value={task}
                                        onChange={(e) => {
                                            const updatedTasks = [...tasks];
                                            updatedTasks[index] = e.target.value;
                                            setTasks(updatedTasks);
                                        }}
                                        className="p-3 border-2 border-pink-400 rounded-xl w-full shadow-md font-[\'Playfair Display\']"
                                        placeholder={`Task ${index + 1}...`}
                                    />
                                    <button
                                        onClick={() => removeTask(index)}
                                        className="px-3 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition shadow-md"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Buttons - Centered & Same Style */}
                    <div className="flex justify-center mt-6 space-x-4">
                        <button
                            onClick={addTask}
                            className="px-5 py-3 rounded-xl bg-purple-500 text-white border-2 border-pink-400 shadow-lg hover:bg-purple-600 transition"
                        >
                            Add Task
                        </button>
                        <button
                            onClick={saveTasks}
                            className={`px-5 py-3 rounded-xl bg-purple-500 text-white border-2 border-pink-400 shadow-lg hover:bg-purple-600 transition ${
                                loading ? "opacity-50 cursor-not-allowed" : ""
                            }`}
                            disabled={loading}
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}