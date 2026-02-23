import { useEffect, useState } from 'react'

interface Todo {
  id: string
  title: string
  completed: boolean
  file: string
  priority?: 'high' | 'medium' | 'low'
}

interface TodoData {
  updatedAt: string
  todos: Todo[]
}

function App() {
  const [data, setData] = useState<TodoData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/data/todos.json?t=${Date.now()}`)
      .then(res => res.json())
      .then(json => {
        setData(json)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to load todos:', err)
        setLoading(false)
      })
  }, [])

  const pendingTodos = data?.todos.filter(t => !t.completed) ?? []
  const completedTodos = data?.todos.filter(t => t.completed) ?? []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📋 Kiyoshi Dashboard</h1>
          <p className="text-slate-400 text-sm">
            {data ? `最終更新: ${new Date(data.updatedAt).toLocaleString('ja-JP')}` : '読み込み中...'}
          </p>
        </header>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-slate-400">読み込み中...</p>
          </div>
        ) : (
          <>
            <section className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>🔹</span> 進行中 ({pendingTodos.length})
              </h2>
              {pendingTodos.length === 0 ? (
                <p className="text-slate-500 italic">タスクなし ✨</p>
              ) : (
                <ul className="space-y-2">
                  {pendingTodos.map(todo => (
                    <li
                      key={todo.id}
                      className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-slate-600 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-slate-500 mt-0.5">○</span>
                        <div className="flex-1">
                          <p className="font-medium">{todo.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{todo.file}</p>
                        </div>
                        {todo.priority === 'high' && (
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded">優先</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <span>✅</span> 完了 ({completedTodos.length})
              </h2>
              {completedTodos.length > 0 && (
                <ul className="space-y-2">
                  {completedTodos.map(todo => (
                    <li
                      key={todo.id}
                      className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-green-500 mt-0.5">✓</span>
                        <div className="flex-1">
                          <p className="text-slate-400 line-through">{todo.title}</p>
                          <p className="text-xs text-slate-600 mt-1">{todo.file}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default App
