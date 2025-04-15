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
    const [ongoingTitles, setOngoingTitles] = useState([]);
    const [completedTitles, setCompletedTitles] = useState([]);
    
    // New state for editing
    const [editingTitleId, setEditingTitleId] = useState(null);
    const [editingTitleText, setEditingTitleText] = useState("");
    const [editingListId, setEditingListId] = useState(null);
    const [editingListText, setEditingListText] = useState("");

    useEffect(() => {
        fetchTitles();
    }, []);

    useEffect(() => {
        categorizeTitles();
    }, [titles]);

    const fetchTitles = async () => {
        try {
            const response = await axios.get(`${apiUrl}/get-titles`);
            setTitles(response.data.titles);
        } catch (error) {
            console.error("Error fetching titles:", error);
        }
    };

    const categorizeTitles = async () => {
        const ongoing = [];
        const completed = [];

        for (const title of titles) {
            try {
                const response = await axios.get(`${apiUrl}/get-lists/${title.id}`);
                if (response.data && response.data.lists) {
                    const allCompleted = response.data.lists.every(task => task.status === true);

                    if (allCompleted) {
                        completed.push(title);
                    } else {
                        ongoing.push(title);
                    }
                }
            } catch (error) {
                console.error("Error fetching list items:", error);
            }
        }

        setOngoingTitles(ongoing);
        setCompletedTitles(completed);
    };

    const toggleDropdown = async (id) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.get(`${apiUrl}/get-lists/${id}`);
            console.log("API response:", response.data);

            if (response.data && response.data.lists) {
                // Separate tasks into ongoing and completed based on status
                const ongoing = response.data.lists.filter((task) => task.status === false);
                const completed = response.data.lists.filter((task) => task.status === true);

                setOngoingTasks(prev => ({
                    ...prev,
                    [id]: ongoing
                }));

                setCompletedTasks(prev => ({
                    ...prev,
                    [id]: completed
                }));
            }
        } catch (error) {
            console.error("Error fetching list items:", error);
        } finally {
            setIsLoading(false);
        }

        setExpandedId(id);
    };

    const handleCheckboxChange = async (titleId, taskId, currentStatus) => {
        try {
            // Update task status in the backend
            await axios.put(`${apiUrl}/update-task-status/${taskId}`, {
                status: !currentStatus
            });

            // Refresh lists for this title to get updated data
            const response = await axios.get(`${apiUrl}/get-lists/${titleId}`);
            
            if (response.data && response.data.lists) {
                // Get updated lists and separate into ongoing and completed
                const ongoing = response.data.lists.filter((task) => task.status === false);
                const completed = response.data.lists.filter((task) => task.status === true);
                
                // Update local state with new data
                setOngoingTasks(prev => ({
                    ...prev,
                    [titleId]: ongoing
                }));
                
                setCompletedTasks(prev => ({
                    ...prev,
                    [titleId]: completed
                }));
                
                // Check if ALL tasks are now completed for this title
                const allTasksCompleted = ongoing.length === 0 && completed.length > 0;
                
                // Only refresh titles if all tasks are completed (to move the title to completed section)
                if (allTasksCompleted) {
                    fetchTitles();
                }
            }
        } catch (error) {
            console.error("Error updating task status:", error);
        }
    };

    // New functions for editing and deleting
    const startEditingTitle = (titleId, currentTitle, e) => {
        e.stopPropagation();
        setEditingTitleId(titleId);
        setEditingTitleText(currentTitle);
    };

    const saveEditedTitle = async (e) => {
        e.stopPropagation();
        try {
            await axios.put(`${apiUrl}/update-title/${editingTitleId}`, {
                title: editingTitleText
            });
            fetchTitles();
            setEditingTitleId(null);
        } catch (error) {
            console.error("Error updating title:", error);
        }
    };

    const startEditingList = (listId, currentDesc, e) => {
        e.stopPropagation();
        setEditingListId(listId);
        setEditingListText(currentDesc);
    };

    const saveEditedList = async (titleId, e) => {
        e.stopPropagation();
        try {
            await axios.put(`${apiUrl}/update-list/${editingListId}`, {
                list_desc: editingListText
            });
            
            // Refresh the list for this title
            const response = await axios.get(`${apiUrl}/get-lists/${titleId}`);
            if (response.data && response.data.lists) {
                const ongoing = response.data.lists.filter((task) => task.status === false);
                const completed = response.data.lists.filter((task) => task.status === true);
                
                setOngoingTasks(prev => ({
                    ...prev,
                    [titleId]: ongoing
                }));
                
                setCompletedTasks(prev => ({
                    ...prev,
                    [titleId]: completed
                }));
            }
            
            setEditingListId(null);
        } catch (error) {
            console.error("Error updating list item:", error);
        }
    };

    const deleteTitle = async (titleId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this task and all its items?")) {
            try {
                await axios.delete(`${apiUrl}/delete-title/${titleId}`);
                fetchTitles();
                if (expandedId === titleId) {
                    setExpandedId(null);
                }
            } catch (error) {
                console.error("Error deleting title:", error);
            }
        }
    };

    const deleteListItem = async (titleId, listId, e) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this item?")) {
            try {
                await axios.delete(`${apiUrl}/delete-list/${listId}`);
                
                // Refresh the list for this title
                const response = await axios.get(`${apiUrl}/${titleId}`);
                if (response.data && response.data.lists) {
                    const ongoing = response.data.lists.filter((task) => task.status === false);
                    const completed = response.data.lists.filter((task) => task.status === true);
                    
                    setOngoingTasks(prev => ({
                        ...prev,
                        [titleId]: ongoing
                    }));
                    
                    setCompletedTasks(prev => ({
                        ...prev,
                        [titleId]: completed
                    }));
                    
                    // If all tasks are now completed or there are no tasks left, refresh titles
                    if (ongoing.length === 0 || response.data.lists.length === 0) {
                        fetchTitles();
                    }
                }
            } catch (error) {
                console.error("Error deleting list item:", error);
            }
        }
    };

    // Helper function to render ongoing title (with edit functionality)
    const renderOngoingTitle = (task) => {
        if (editingTitleId === task.id) {
            return (
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    <input
                        type="text"
                        value={editingTitleText}
                        onChange={(e) => setEditingTitleText(e.target.value)}
                        className="flex-grow p-1 border border-purple-400 rounded"
                        onClick={(e) => e.stopPropagation()}
                    />
                    <button 
                        onClick={(e) => saveEditedTitle(e)}
                        className="bg-purple-400 text-white px-4 py-1 rounded-xl text-1xl transition-transform transform hover:scale-110"
                    >
                        Save
                    </button>
                </div>
            );
        }
        
        return (
            <div className="flex justify-between items-center w-full">
                <span>{task.title}</span>
                <div className="flex space-x-2">
                    <button 
                        onClick={(e) => startEditingTitle(task.id, task.title, e)}
                        className="text-blue-600 hover:text-blue-800"
                    >
                        Update
                    </button>
                    <button 
                        onClick={(e) => deleteTitle(task.id, e)}
                        className="text-red-600 hover:text-red-800"
                    >
                        Delete
                    </button>
                    <span className="text-pink-500">{expandedId === task.id ? "▲" : "▼"}</span>
                </div>
            </div>
        );
    };

    // Helper function to render ongoing list item (with edit functionality)
    const renderOngoingListItem = (titleId, taskItem, isCompleted) => {
        if (editingListId === taskItem.id) {
            return (
                <li key={taskItem.id} className="flex items-center space-x-2 py-2 border-b border-purple-200">
                    <div className="flex items-center space-x-2 flex-grow" onClick={(e) => e.stopPropagation()}>
                        <input 
                            type="checkbox" 
                            checked={isCompleted}
                            onChange={(e) => {
                                e.stopPropagation();
                                handleCheckboxChange(titleId, taskItem.id, isCompleted);
                            }}
                            className="w-5 h-5 rounded border-2 border-purple-400 text-pink-500 focus:ring-pink-400"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <input
                            type="text"
                            value={editingListText}
                            onChange={(e) => setEditingListText(e.target.value)}
                            className="flex-grow p-1 border border-purple-400 rounded"
                            onClick={(e) => e.stopPropagation()}
                        />
                        <button 
                            onClick={(e) => saveEditedList(titleId, e)}
                            className="bg-purple-400 text-white px-4 py-1 rounded-xl text-1xl transition-transform transform hover:scale-110"
                        >
                            Save
                        </button>
                    </div>
                </li>
            );
        }
        
        return (
            <li key={taskItem.id} className="flex items-center space-x-2 py-2 border-b border-purple-200">
                <input 
                    type="checkbox" 
                    checked={isCompleted}
                    onChange={(e) => {
                        e.stopPropagation();
                        handleCheckboxChange(titleId, taskItem.id, isCompleted);
                    }}
                    className="w-5 h-5 rounded border-2 border-purple-400 text-pink-500 focus:ring-pink-400"
                    onClick={(e) => e.stopPropagation()}
                />
                <span className={`text-gray-800 font-medium flex-grow ${isCompleted ? 'line-through' : ''}`}>{taskItem.list_desc}</span>
                <div className="flex space-x-2">
                    <button 
                        onClick={(e) => startEditingList(taskItem.id, taskItem.list_desc, e)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                        Update
                    </button>
                    <button 
                        onClick={(e) => deleteListItem(titleId, taskItem.id, e)}
                        className="text-red-600 hover:text-red-800 text-sm"
                    >
                        Delete
                    </button>
                </div>
            </li>
        );
    };

    return (
        <div className="bg-gradient-to-br from-purple-200 to-purple-400 p-10 rounded-2xl shadow-2xl w-full min-h-screen flex flex-col items-center">
            <h2 className="text-5xl font-extrabold text-center mb-12 font-serif text-pink-500 drop-shadow-lg">To-Do List</h2>

            <div className="grid grid-cols-2 gap-12 w-full max-w-6xl flex-grow">
                {/* Ongoing Tasks */}
                <div>
                    <h3 className="text-2xl font-semibold mb-5 text-purple-900 tracking-wide">Ongoing Tasks</h3>
                    <ul className="bg-purple-100 bg-opacity-90 p-7 rounded-2xl space-y-5 shadow-2xl max-h-[400px] overflow-y-auto border-4 border-pink-400">
                        {ongoingTitles.length > 0 ? (
                            ongoingTitles.map((task) => (
                                <li key={task.id} className="bg-purple-300 p-6 rounded-xl text-gray-900 shadow-lg border-2 border-pink-500 font-medium text-lg cursor-pointer" onClick={() => toggleDropdown(task.id)}>
                                    {renderOngoingTitle(task)}

                                    {expandedId === task.id && (
                                        <div className="mt-4">
                                            {isLoading ? (
                                                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                                                    <p className="text-purple-500">Loading tasks...</p>
                                                </div>
                                            ) : (
                                                <div>
                                                    {/* Ongoing tasks for this title */}
                                                    {ongoingTasks[task.id] && ongoingTasks[task.id].length > 0 ? (
                                                        <div>
                                                            <h4 className="font-medium text-purple-800 mb-2">Tasks to do:</h4>
                                                            <ul className="p-4 bg-white rounded-lg shadow-md text-sm border border-purple-500 mb-4">
                                                                {ongoingTasks[task.id].map((taskItem) => renderOngoingListItem(task.id, taskItem, false))}
                                                            </ul>
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 bg-white rounded-lg shadow-md text-center mb-4">
                                                            <p className="text-pink-500 italic">No ongoing tasks</p>
                                                        </div>
                                                    )}
                                                    
                                                    {/* Completed tasks for this title */}
                                                    {completedTasks[task.id] && completedTasks[task.id].length > 0 && (
                                                        <div>
                                                            <h4 className="font-medium text-purple-800 mb-2">Completed tasks:</h4>
                                                            <ul className="p-4 bg-white rounded-lg shadow-md text-sm border border-purple-500">
                                                                {completedTasks[task.id].map((taskItem) => (
                                                                    <li key={taskItem.id} className="flex items-center space-x-2 py-2 border-b border-purple-200">
                                                                        <input 
                                                                            type="checkbox" 
                                                                            checked={true}
                                                                            onChange={(e) => {
                                                                                // Allow unchecking completed tasks
                                                                                e.stopPropagation();
                                                                                handleCheckboxChange(task.id, taskItem.id, true);
                                                                            }}
                                                                            className="w-5 h-5 rounded border-2 border-purple-400 text-pink-500 focus:ring-pink-400"
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        />
                                                                        <span className="text-gray-800 font-medium line-through">{taskItem.list_desc}</span>
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="text-pink-500 italic">No ongoing tasks</li>
                        )}
                    </ul>
                </div>

                {/* Completed Tasks - Kept Original */}
                <div>
                    <h3 className="text-2xl font-semibold mb-5 text-purple-900 tracking-wide">Completed Tasks</h3>
                    <ul className="bg-purple-100 bg-opacity-90 p-7 rounded-2xl space-y-5 shadow-2xl max-h-[400px] overflow-y-auto border-4 border-pink-400">
                        {completedTitles.length > 0 ? (
                            completedTitles.map((task) => (
                                <li key={task.id} className="bg-purple-300 p-6 rounded-xl text-gray-900 shadow-lg border-2 border-pink-500 font-medium text-lg cursor-pointer" onClick={() => toggleDropdown(task.id)}>
                                    <div className="flex justify-between items-center">
                                        <span>{task.title}</span>
                                        <span className="text-pink-500">{expandedId === task.id ? "▲" : "▼"}</span>
                                    </div>

                                    {expandedId === task.id && (
                                        <div className="mt-4">
                                            {isLoading ? (
                                                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                                                    <p className="text-purple-500">Loading tasks...</p>
                                                </div>
                                            ) : completedTasks[task.id] && completedTasks[task.id].length > 0 ? (
                                                <ul className="p-4 bg-white rounded-lg shadow-md text-sm border border-purple-500">
                                                    {completedTasks[task.id].map((taskItem) => (
                                                        <li key={taskItem.id} className="flex items-center space-x-2 py-2 border-b border-purple-200">
                                                            <input 
                                                                type="checkbox" 
                                                                checked={true}
                                                                onChange={(e) => {
                                                                    // Allow unchecking completed tasks
                                                                    e.stopPropagation();
                                                                    handleCheckboxChange(task.id, taskItem.id, true);
                                                                }}
                                                                className="w-5 h-5 rounded border-2 border-purple-400 text-pink-500 focus:ring-pink-400"
                                                                onClick={(e) => e.stopPropagation()}
                                                            />
                                                            <span className="text-gray-800 font-medium">{taskItem.list_desc}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <div className="p-4 bg-white rounded-lg shadow-md text-center">
                                                    <p className="text-pink-500 italic">No tasks found</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))
                        ) : (
                            <li className="text-pink-500 italic">No completed tasks</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Floating Add Task Button */}
            <div className="fixed bottom-8 right-8">
                <button
                    onClick={() => setShowModal(true)}
                    className="relative px-10 py-5 rounded-full overflow-hidden group bg-purple-500 border-4 border-pink-500 text-white hover:text-white shadow-2xl font-bold text-xl transition-transform transform hover:scale-110">
                    Add Task
                </button>
            </div>

            {showModal && <AddModal hide={() => setShowModal(false)} onTaskAdded={fetchTitles} />}
        </div>
    );
}

export default Todo;