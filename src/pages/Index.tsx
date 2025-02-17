import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Clock, Plus, User, LogOut, MessageSquare, Quote } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

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
  const [newTask, setNewTask] = useState({ title: '', description: '', date: '' });
  const [activeColumn, setActiveColumn] = useState('');
  const [quote, setQuote] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        const response = await fetch('/functions/generate-quote');
        const data = await response.json();
        if (data.quote) {
          setQuote(data.quote);
        }
      } catch (error) {
        console.error('Error fetching quote:', error);
        toast({
          title: "Error",
          description: "Failed to fetch today's motivational quote",
          variant: "destructive",
        });
      }
    };

    fetchQuote();

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const timeUntilMidnight = tomorrow.getTime() - now.getTime();

    const refreshQuoteTimeout = setTimeout(() => {
      fetchQuote();
      setInterval(fetchQuote, 24 * 60 * 60 * 1000);
    }, timeUntilMidnight);

    return () => {
      clearTimeout(refreshQuoteTimeout);
    };
  }, []);

  const handleAddTask = (columnId: string) => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      date: newTask.date,
    };

    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        tasks: [...prev[columnId].tasks, task]
      }
    }));

    setNewTask({ title: '', description: '', date: '' });
  };

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
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex justify-between items-center">
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
        {quote && (
          <div className="flex items-center gap-2 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm">
            <Quote className="w-5 h-5 text-[#97c8eb]" />
            <p className="text-[#1a4b6e] font-medium italic">{quote}</p>
          </div>
        )}
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
                    <Dialog>
                      <DialogTrigger asChild>
                        <button 
                          className="add-task-button"
                          onClick={() => setActiveColumn(column.id)}
                        >
                          <Plus className="w-5 h-5" />
                          Add Task
                        </button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Task</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid gap-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                              id="title"
                              value={newTask.title}
                              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter task title"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              value={newTask.description}
                              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Enter task description"
                            />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="date">Due Date</Label>
                            <Input
                              id="date"
                              type="date"
                              value={newTask.date}
                              onChange={(e) => setNewTask(prev => ({ ...prev, date: e.target.value }))}
                            />
                          </div>
                          <Button 
                            className="w-full"
                            onClick={() => handleAddTask(activeColumn)}
                          >
                            Add Task
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
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
