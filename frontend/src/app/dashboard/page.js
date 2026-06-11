'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  LogOut, Plus, Trash2, CheckCircle2, Circle,
  Loader2, ClipboardList, CheckSquare, ListTodo
} from 'lucide-react';

export default function Dashboard() {
  const { user, token, logout, STRAPI_URL } = useAuth();

  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${STRAPI_URL}/api/todos?sort=createdAt:desc`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to fetch tasks.');
      }
      setTodos(resData.data || []);
    } catch (err) {
      console.error(err);
      setError('Could not load your tasks. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTodos();
    }
  }, [token]);

  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${STRAPI_URL}/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            title: newTitle.trim(),
            isCompleted: false,
          },
        }),
      });

      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData?.error?.message || 'Failed to create task.');
      }

      setTodos([resData.data, ...todos]);
      setNewTitle('');
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error adding task.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (todoItem) => {
    const originalTodos = [...todos];
    const targetId = todoItem.documentId;
    const nextCompletedState = !todoItem.isCompleted;

    setTodos(todos.map(t =>
      t.documentId === targetId ? { ...t, isCompleted: nextCompletedState } : t
    ));

    try {
      const res = await fetch(`${STRAPI_URL}/api/todos/${targetId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          data: {
            isCompleted: nextCompletedState,
          },
        }),
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData?.error?.message || 'Failed to update task.');
      }
    } catch (err) {
      console.error(err);
      setTodos(originalTodos);
      setError('Could not update task. Please try again.');
    }
  };

  const handleDeleteTodo = async (todoItem) => {
    const originalTodos = [...todos];
    const targetId = todoItem.documentId;

    setTodos(todos.filter(t => t.documentId !== targetId));

    try {
      const res = await fetch(`${STRAPI_URL}/api/todos/${targetId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const resData = await res.json();
        throw new Error(resData?.error?.message || 'Failed to delete task.');
      }
    } catch (err) {
      console.error(err);
      setTodos(originalTodos);
      setError('Could not delete task. Please try again.');
    }
  };

  const activeTodos = todos.filter(t => !t.isCompleted);
  const completedTodos = todos.filter(t => t.isCompleted);
  const totalCount = todos.length;
  const completedCount = completedTodos.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>

      <header style={{
        background: 'rgba(9, 9, 11, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--card-border)',
        padding: '1rem 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'var(--primary)',
            borderRadius: 'var(--radius-sm)',
            padding: '0.4rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)'
          }}>
            <ListTodo style={{ width: '1.25rem', height: '1.25rem', color: '#fff' }} />
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Todo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ textAlign: 'right', display: 'none', sm: 'block' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user?.username}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              width: 'auto',
              display: 'inline-flex',
              gap: '0.4rem'
            }}
          >
            <LogOut style={{ width: '0.95rem', height: '0.95rem' }} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      <main style={{
        flex: 1,
        width: '100%',
        maxWidth: '840px',
        margin: '0 auto',
        padding: '2.5rem 1.5rem',
      }}>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: '2rem' }}>
            <span>{error}</span>
            <button
              onClick={() => setError('')}
              style={{ background: 'none', border: 'none', color: 'inherit', marginLeft: 'auto', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.25rem' }}>
            Welcome, {user?.username || 'User'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Your personal checklist.
          </p>
        </div>

        <div className="dashboard-card" style={{ marginBottom: '2.5rem' }}>
          <form onSubmit={handleAddTodo} style={{ display: 'flex', gap: '0.75rem' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="What needs to be done today?"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                disabled={submitting}
                style={{ paddingLeft: '1rem', paddingRight: '1rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting || !newTitle.trim()}
              style={{ width: 'auto', padding: '0 1.5rem', flexShrink: 0 }}
            >
              {submitting ? (
                <Loader2 className="spinner" />
              ) : (
                <>
                  <Plus style={{ width: '1.25rem', height: '1.25rem' }} />
                  <span>Add Task</span>
                </>
              )}
            </button>
          </form>
        </div>

        {totalCount > 0 && (
          <div className="dashboard-card" style={{ padding: '1.5rem', marginBottom: '2.5rem', background: 'rgba(255,255,255,0.02)' }}>
            <div style={{ display: 'flex', justifycontent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckSquare style={{ width: '1.1rem', height: '1.1rem', color: 'var(--primary)' }} />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>Task Completion Progress</span>
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary)', marginLeft: 'auto' }}>
                {progressPercent}% Done ({completedCount} of {totalCount})
              </span>
            </div>

            <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'linear-gradient(to right, var(--primary), var(--secondary))',
                borderRadius: '4px',
                transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }} />
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '4rem 0', gap: '1rem' }}>
            <Loader2 className="spinner" style={{ width: '2.5rem', height: '2.5rem', color: 'var(--primary)' }} />
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading...</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>

            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Tasks ({activeTodos.length})
              </h3>

              {activeTodos.length === 0 ? (
                <div style={{
                  border: '1px dashed var(--card-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '3rem 2rem',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.01)'
                }}>
                  <ClipboardList style={{ width: '2.5rem', height: '2.5rem', color: 'var(--text-muted)', margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>All caught up!</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No active tasks found. Create one above to get started.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeTodos.map(todo => (
                    <div
                      key={todo.documentId}
                      className="dashboard-card"
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        transition: 'transform 0.2s ease, border-color 0.2s ease',
                      }}
                    >
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          textAlign: 'left',
                          flex: 1,
                          color: 'inherit'
                        }}
                      >
                        <Circle style={{ width: '1.25rem', height: '1.25rem', color: 'var(--text-muted)', flexShrink: 0 }} />
                        <span style={{ fontSize: '0.95rem', fontWeight: 500, lineHeight: 1.4 }}>{todo.title}</span>
                      </button>

                      <button
                        onClick={() => handleDeleteTodo(todo)}
                        className="btn btn-danger"
                        style={{ flexShrink: 0, padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                        title="Delete task"
                      >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {completedTodos.length > 0 && (
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Completed ({completedTodos.length})
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', opacity: 0.75 }}>
                  {completedTodos.map(todo => (
                    <div
                      key={todo.documentId}
                      className="dashboard-card"
                      style={{
                        padding: '1rem 1.25rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '1rem',
                        background: 'rgba(24, 24, 27, 0.4)',
                        border: '1px solid rgba(63, 63, 70, 0.2)'
                      }}
                    >
                      <button
                        onClick={() => handleToggleComplete(todo)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                          textAlign: 'left',
                          flex: 1,
                          color: 'var(--text-muted)',
                        }}
                      >
                        <CheckCircle2 style={{ width: '1.25rem', height: '1.25rem', color: 'var(--success)', flexShrink: 0 }} />
                        <span style={{
                          fontSize: '0.95rem',
                          fontWeight: 500,
                          lineHeight: 1.4,
                          textDecoration: 'line-through'
                        }}>
                          {todo.title}
                        </span>
                      </button>

                      <button
                        onClick={() => handleDeleteTodo(todo)}
                        className="btn btn-danger"
                        style={{ flexShrink: 0, padding: '0.4rem', borderRadius: 'var(--radius-sm)' }}
                        title="Delete task"
                      >
                        <Trash2 style={{ width: '1rem', height: '1rem' }} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  );
}
