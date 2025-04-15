'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Swal from 'sweetalert2';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

type Task = {
  id: string;
  text: string;
  completed: boolean;
  deadline: string;
};

export default function TodoList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchTasks = async () => {
      const querySnapshot = await getDocs(collection(db, 'tasks'));
      const tasksData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Task[];
      setTasks(tasksData);
    };
    fetchTasks();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const newTimeRemaining: { [key: string]: string } = {};
      tasks.forEach((task) => {
        newTimeRemaining[task.id] = calculateTimeRemaining(task.deadline);
      });
      setTimeRemaining(newTimeRemaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [tasks]);

  const calculateTimeRemaining = (deadline: string): string => {
    if (deadline === 'Selesai') return 'Selesai';
    const deadlineTime = new Date(deadline).getTime();
    const now = new Date().getTime();
    const difference = deadlineTime - now;
    if (difference <= 0) return 'Waktu habis!';
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    return `${hours}j ${minutes}m ${seconds}d`;
  };

  const addTask = async (): Promise<void> => {
    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 1.5rem; font-weight: 700; color: #0ea5e9;">Tambah Tugas Baru ✨</span>',
      html:
        '<div style="display: flex; flex-direction: column; gap: 12px;">' +
        '<input id="swal-input1" class="swal2-input" placeholder="Nama tugas" style="border-radius: 12px; padding: 10px 12px; border: 1px solid #dbeafe; background: #f0f9ff;" />' +
        '<input id="swal-input2" type="datetime-local" class="swal2-input" style="border-radius: 12px; padding: 10px 12px; border: 1px solid #dbeafe; background: #f0f9ff;" />' +
        '</div>',
      background: '#ffffffee',
      showCancelButton: true,
      confirmButtonText: '<b style="color: white;"> ➕ Tambah</b>',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#38bdf8',
      cancelButtonColor: '#fda4af',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'rounded-full px-6 py-2',
        cancelButton: 'rounded-full px-6 py-2 text-gray-700',
      },
      focusConfirm: false,
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement)?.value,
          (document.getElementById('swal-input2') as HTMLInputElement)?.value,
        ];
      },
    });

    if (formValues && formValues[0] && formValues[1]) {
      const newTask: Omit<Task, 'id'> = {
        text: formValues[0],
        completed: false,
        deadline: formValues[1],
      };
      const docRef = await addDoc(collection(db, 'tasks'), newTask);
      setTasks([...tasks, { id: docRef.id, ...newTask }]);
    }
  };

  const toggleTask = async (id: string): Promise<void> => {
    const updatedTasks = tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    const taskRef = doc(db, 'tasks', id);
    await updateDoc(taskRef, {
      completed: updatedTasks.find((task) => task.id === id)?.completed,
      deadline: updatedTasks.find((task) => task.id === id)?.completed
        ? 'Selesai'
        : updatedTasks.find((task) => task.id === id)?.deadline,
    });
  };

  const deleteTask = async (id: string): Promise<void> => {
    await deleteDoc(doc(db, 'tasks', id));
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const editTask = async (id: string, oldText: string, oldDeadline: string): Promise<void> => {
    const { value: formValues } = await Swal.fire({
      title: 'Edit tugas',
      html:
        `<input id="swal-input1" class="swal2-input" value="${oldText}" placeholder="Nama tugas">` +
        `<input id="swal-input2" type="datetime-local" class="swal2-input" value="${oldDeadline}">`,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan',
      cancelButtonText: 'Batal',
      preConfirm: () => {
        return [
          (document.getElementById('swal-input1') as HTMLInputElement)?.value,
          (document.getElementById('swal-input2') as HTMLInputElement)?.value,
        ];
      },
    });

    if (formValues && formValues[0] && formValues[1]) {
      const updatedTask: Omit<Task, 'id'> = {
        text: formValues[0],
        completed: false,
        deadline: formValues[1],
      };
      const taskRef = doc(db, 'tasks', id);
      await updateDoc(taskRef, updatedTask);
      setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updatedTask } : task)));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-sky-100 to-cyan-100 py-12 px-4">
      <div className="max-w-3xl mx-auto px-6 py-8 rounded-3xl shadow-2xl border border-blue-200 bg-gradient-to-r from-white/80 via-white/60 to-white/80 backdrop-blur-md bg-[url('/noise.png')] bg-cover">
        <h1 className="text-3xl md:text-4xl font-extrabold text-sky-600 mb-6 text-center">
          📝 To-Do List
        </h1>
        <div className="flex justify-center mb-6">
          <button
            onClick={addTask}
            className="bg-blue-500 hover:bg-blue-600 hover:scale-105 text-white font-semibold px-6 py-2 rounded-full shadow-md transition duration-200"
          >
            + Tambah Tugas
          </button>
        </div>
        <ul className="space-y-4">
          <AnimatePresence>
            {tasks.map((task) => {
              const timeLeft = calculateTimeRemaining(task.deadline);
              const isExpired = timeLeft === 'Waktu habis!';
              const taskColor = task.completed
                ? 'bg-blue-100'
                : isExpired
                ? 'bg-red-100'
                : 'bg-sky-100';

              return (
                <motion.li
                  key={task.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className={`flex flex-col gap-2 p-4 rounded-xl border ${taskColor} hover:shadow-lg hover:scale-[1.01] transition duration-200`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      onClick={() => toggleTask(task.id)}
                      className={`cursor-pointer text-lg md:text-xl ${
                        task.completed
                          ? 'line-through text-gray-500'
                          : 'font-semibold text-gray-700'
                      }`}
                    >
                      {task.text}
                    </span>
                    <div className="flex gap-2">
                      {!task.completed && (
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="bg-sky-500 hover:bg-sky-600 hover:scale-105 text-white px-3 py-1 rounded-md transition duration-150"
                        >
                          ✔️
                        </button>
                      )}
                      <button
                        onClick={() => editTask(task.id, task.text, task.deadline)}
                        className="bg-blue-400 hover:bg-blue-500 hover:scale-105 text-white px-3 py-1 rounded-md transition duration-150"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="bg-[#c2e9fb] hover:bg-red-300 hover:scale-105 text-red-800 font-semibold px-3 py-1 rounded-md transition duration-150"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Deadline:</span>{' '}
                    {task.completed ? 'Selesai' : new Date(task.deadline).toLocaleString()}
                  </div>
                  <div className="text-xs font-semibold text-gray-700">
                    ⏳ {task.completed ? 'Selesai' : timeRemaining[task.id] || 'Menghitung...'}
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
}
