import React, { useState } from 'react';
import AddStudentsModal from './components/AddStudentsModal';
import './App.css';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="App">
      <header className="App-header">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="add-students-button"
        >
          + Add students
        </button>
        
        <AddStudentsModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </header>
    </div>
  );
}

export default App;
