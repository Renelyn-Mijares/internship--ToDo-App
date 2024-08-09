import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './App.css';
import logo from '/logo.svg';

const App = () => {
  const [todos, setTodos] = useState(() => {
    const savedTodos = localStorage.getItem('todos');
    return savedTodos ? JSON.parse(savedTodos) : [];
  });

  const [newTodo, setNewTodo] = useState('');
  const [newDueDate, setNewDueDate] = useState(new Date());
  const [editingIndex, setEditingIndex] = useState(-1);
  const [editingText, setEditingText] = useState('');
  const [editingDueDate, setEditingDueDate] = useState(new Date());
  const [filter, setFilter] = useState('all');
  const [confirmDialog, setConfirmDialog] = useState({ visible: false, action: null, index: null });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  const addTodo = () => {
    if (newTodo.trim()) {
      const dueDateTime = new Date(newDueDate);
      setTodos([
        ...todos,
        {
          text: newTodo.substring(0, 60),
          done: false,
          dateCreated: new Date().toLocaleString(),
          dueDate: dueDateTime.toLocaleString(),
        },
      ]);
      setNewTodo('');
      setNewDueDate(new Date());
    }
  };

  const editTodo = (index) => {
    setEditingIndex(index);
    setEditingText(todos[index].text);
    setEditingDueDate(new Date(todos[index].dueDate));
  };

  const updateTodo = (index) => {
    if (editingText.trim()) {
      const dueDateTime = new Date(editingDueDate);
      const updatedTodos = todos.map((todo, i) =>
        i === index
          ? { ...todo, text: editingText.substring(0, 60), dueDate: dueDateTime.toLocaleString() }
          : todo
      );
      setTodos(updatedTodos);
      setEditingIndex(-1);
      setEditingText('');
      setEditingDueDate(new Date());
    }
  };

  const toggleTodoStatus = (index) => {
    const updatedTodos = todos.map((todo, i) =>
      i === index ? { ...todo, done: !todo.done } : todo
    );
    setTodos(updatedTodos);
  };

  const confirmDeleteTodo = (index) => {
    setConfirmDialog({ visible: true, action: 'delete', index });
  };

  const confirmDeleteAllTodos = () => {
    setConfirmDialog({ visible: true, action: 'deleteAll' });
  };

  const handleConfirm = () => {
    if (confirmDialog.action === 'delete') {
      setTodos(todos.filter((_, i) => i !== confirmDialog.index));
    } else if (confirmDialog.action === 'deleteAll') {
      setTodos([]);
    }
    setConfirmDialog({ visible: false, action: null, index: null });
  };

  const handleCancel = () => {
    setConfirmDialog({ visible: false, action: null, index: null });
  };

  const markAllDone = () => {
    const updatedTodos = todos.map((todo) => ({ ...todo, done: true }));
    setTodos(updatedTodos);
  };

  const markAllUndone = () => {
    const updatedTodos = todos.map((todo) => ({ ...todo, done: false }));
    setTodos(updatedTodos);
  };

  const isLateTask = (dueDateStr, done) => {
    if (done) return false;
    const dueDate = new Date(dueDateStr);
    return dueDate < new Date();
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === 'all') return true;
    if (filter === 'completed') return todo.done;
    if (filter === 'pending') return !todo.done;
    if (filter === 'late') return isLateTask(todo.dueDate, todo.done);
    return true;
  });

  return (
    <div className="App">
      <aside className="sidebar">
        <h2>Menu</h2>
        <button onClick={() => setFilter('all')}>All Tasks</button>
        <button onClick={() => setFilter('completed')}>Completed Tasks</button>
        <button onClick={() => setFilter('pending')}>Pending Tasks</button>
        <button onClick={() => setFilter('late')}>Late Tasks</button>
      </aside>
      <div className="main-content">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>MY TO-DO LIST</h1>
          <div className="input-container">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add new task"
            />
            <DatePicker
              selected={newDueDate}
              onChange={(date) => setNewDueDate(date)}
              dateFormat="MM/dd/yyyy"
              showTimeSelect
              timeIntervals={10}
              timeFormat="HH:mm"
              customInput={<input type="text" placeholder="Select the due date and time" />}
              timeCaption="Time"
            />
            <button onClick={addTodo}>Add</button>
          </div>
          <div className="action-buttons">
            <button onClick={confirmDeleteAllTodos}>Delete All</button>
            <button onClick={markAllDone}>Done All</button>
            <button onClick={markAllUndone}>Undone All</button>
          </div>
        </header>
        <ul className="todo-list">
          {filteredTodos.map((todo, index) => (
            <li key={index} className={`todo-item ${todo.done ? 'done' : ''} ${isLateTask(todo.dueDate, todo.done) ? 'late' : ''}`}>
              {editingIndex === index ? (
                <>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <DatePicker
                    selected={editingDueDate}
                    onChange={(date) => setEditingDueDate(date)}
                    dateFormat="MM/dd/yyyy"
                    showTimeSelect
                    timeIntervals={10}
                    timeFormat="HH:mm"
                    customInput={<input type="text" placeholder="Select the due date and time" />}
                    timeCaption="Time"
                  />
                  <button onClick={() => updateTodo(index)}>Update</button>
                </>
              ) : (
                <>
                  <input
                    type="checkbox"
                    checked={todo.done}
                    onChange={() => toggleTodoStatus(index)}
                    className={`checkbox ${todo.done ? 'done' : 'undone'}`}
                  />
                  <span
                    className={`todo-text ${todo.done ? 'done' : ''}`}
                    onClick={() => toggleTodoStatus(index)}
                  >
                    {todo.text}
                  </span>
                  <span className="due-date">{`Due: ${new Date(todo.dueDate).toLocaleString()}`}</span>
                  <span className="date-created">{`Created: ${new Date(todo.dateCreated).toLocaleString()}`}</span>
                  <button onClick={() => editTodo(index)}>Edit</button>
                  <button onClick={() => confirmDeleteTodo(index)}>Delete</button>
                </>
              )}
            </li>
          ))}
        </ul>
        {confirmDialog.visible && (
          <div className="confirm-dialog">
            <div className="confirm-content">
              <p>Are you sure you want to delete this task?</p>
              <button className="confirm-yes" onClick={handleConfirm}>Yes</button>
              <button className="confirm-no" onClick={handleCancel}>No</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
