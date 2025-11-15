import { useMessages } from './lib/api/useMessages'
import './App.css'

function App() {
  const { data: messages, isLoading, error } = useMessages()

  if (isLoading) {
    return <div>Loading messages...</div>
  }

  if (error) {
    return <div>Error loading messages: {error.message}</div>
  }

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Messages</h1>
      {messages && messages.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {messages.map((message) => (
            <li
              key={message.id}
              style={{
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '1rem',
              }}
            >
              <div style={{ fontWeight: 'bold' }}>
                {message.username || `${message.first_name || ''} ${message.last_name || ''}`.trim() || 'Unknown User'}
              </div>
              <div style={{ marginTop: '0.5rem' }}>{message.text || '(no text)'}</div>
              <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                {new Date(message.timestamp).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div>No messages found</div>
      )}
    </div>
  )
}

export default App
