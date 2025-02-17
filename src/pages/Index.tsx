
import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Plus, User, LogOut, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  date: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
}

const initialColumns: { [key: string]: Column } = {
  'to-do': {
    id: 'to-do',
    title: 'TO-DO',
    tasks: [
      {
        id: '1',
        title: 'DSA',
        description: 'Practice graphs',
        date: '02/02/25'
      },
      {
        id: '2',
        title: 'Maths',
        description: 'Do 1st unit',
        date: '12/02/25'
      }
    ]
  },
  'in-progress': {
    id: 'in-progress',
    title: 'IN-PROGRESS',
    tasks: [
      {
        id: '3',
        title: 'Practice 15 leetcode',
        description: '',
        date: ''
      },
      {
        id: '4',
        title: 'Meet-up with Sam',
        description: '',
        date: ''
      },
      {
        id: '5',
        title: 'Develop a website',
        description: '',
        date: ''
      }
    ]
  },
  'done': {
    id: 'done',
    title: 'DONE',
    tasks: [
      {
        id: '6',
        title: 'Call mom',
        description: '',
        date: ''
      },
      {
        id: '7',
        title: 'Email to FA',
        description: '',
        date: ''
      },
      {
        id: '8',
        title: 'AI assignment',
        description: '',
        date: ''
      }
    ]
  }
};

const Index = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];
    const sourceTasks = [...sourceCol.tasks];
    const destTasks = source.droppableId === destination.droppableId
      ? sourceTasks
      : [...destCol.tasks];

    const [removed] = sourceTasks.splice(source.index, 1);
    destTasks.splice(destination.index, 0, removed);

    setColumns({
      ...columns,
      [source.droppableId]: {
        ...sourceCol,
        tasks: sourceTasks,
      },
      [destination.droppableId]: {
        ...destCol,
        tasks: destTasks,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-[#1a4b6e]">
          {format(currentTime, 'hh:mm a')}
        </h1>
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <MessageSquare className="w-5 h-5" />
            <span>Feedback</span>
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm">
            <User className="w-5 h-5" />
            <span>User Name</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-8 justify-center">
          {Object.values(columns).map((column) => (
            <div key={column.id} className="column">
              <div className={`column-header ${
                column.id === 'to-do' ? 'to-do-header' :
                column.id === 'in-progress' ? 'in-progress-header' :
                'done-header'
              }`}>
                {column.title}
              </div>
              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`min-h-[200px] transition-colors duration-300 ${
                      snapshot.isDraggingOver ? 'bg-[#f0f0f0]' : ''
                    }`}
                  >
                    {column.tasks.map((task, index) => (
                      <Draggable key={task.id} draggableId={task.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`task-card mb-3 ${snapshot.isDragging ? 'dragging' : ''}`}
                          >
                            <h3 className="font-semibold mb-1">{task.title}</h3>
                            {task.description && (
                              <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                            )}
                            {task.date && (
                              <div className="text-xs text-gray-500">{task.date}</div>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                    <button className="add-task-button">
                      <Plus className="w-5 h-5" />
                      Add Task
                    </button>
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Bottom Navigation */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="flex items-center gap-8 bg-white px-8 py-3 rounded-full shadow-lg">
          <button className="text-[#97c8eb] hover:text-[#5a9bc7] transition-colors">
            <Clock className="w-6 h-6" />
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <button className="text-[#97c8eb] hover:text-[#5a9bc7] transition-colors">
            <User className="w-6 h-6" />
          </button>
          <div className="w-px h-6 bg-gray-200" />
          <button className="text-[#97c8eb] hover:text-[#5a9bc7] transition-colors">
            <MessageSquare className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Index;
