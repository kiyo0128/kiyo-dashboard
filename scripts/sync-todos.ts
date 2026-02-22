import { readdir, readFile, writeFile } from 'fs/promises'
import { join } from 'path'
import { homedir } from 'os'

const OBSIDIAN_TODO_DIR = join(homedir(), 'Documents', 'MyVault', 'ToDo')
const OUTPUT_FILE = join(process.cwd(), 'public', 'data', 'todos.json')

interface Todo {
  id: string
  title: string
  completed: boolean
  file: string
  priority?: 'high' | 'medium' | 'low'
}

async function parseTodoFile(content: string, filename: string): Todo[] {
  const lines = content.split('\n')
  const todos: Todo[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    // Match: - [ ] or - [x] followed by task text
    const match = line.match(/^\s*-\s+\[([ xX])\]\s+(.+)/)
    if (match) {
      const completed = match[1].toLowerCase() === 'x'
      let title = match[2].trim()
      
      // Check for priority markers like 🔥 or #high
      let priority: 'high' | 'medium' | 'low' | undefined
      if (title.includes('#high') || title.includes('🔥')) {
        priority = 'high'
        title = title.replace(/#high|🔥/g, '').trim()
      } else if (title.includes('#medium')) {
        priority = 'medium'
        title = title.replace(/#medium/g, '').trim()
      }

      todos.push({
        id: `${filename}-${i}`,
        title,
        completed,
        file: filename,
        priority
      })
    }
  }

  return todos
}

async function main() {
  console.log('📂 Scanning:', OBSIDIAN_TODO_DIR)
  
  let allTodos: Todo[] = []
  
  try {
    const files = await readdir(OBSIDIAN_TODO_DIR)
    const mdFiles = files.filter(f => f.endsWith('.md'))
    
    for (const file of mdFiles) {
      const filepath = join(OBSIDIAN_TODO_DIR, file)
      const content = await readFile(filepath, 'utf-8')
      const todos = await parseTodoFile(content, file)
      allTodos = allTodos.concat(todos)
      console.log(`  ✓ ${file}: ${todos.length} tasks`)
    }
  } catch (err) {
    console.error('Error reading todo directory:', err)
    process.exit(1)
  }

  const output = {
    updatedAt: new Date().toISOString(),
    todos: allTodos
  }

  await writeFile(OUTPUT_FILE, JSON.stringify(output, null, 2))
  console.log(`\n✅ Synced ${allTodos.length} todos to ${OUTPUT_FILE}`)
}

main()
