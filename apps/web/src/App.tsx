import { useMessages } from './lib/api/useMessages'

function App() {
  const { data: messages, isLoading, error } = useMessages()

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  return (
    <ul>
      {messages?.map((message) => (
        <li key={message.id}>{message.text}</li>
      ))}
    </ul>
  )
}

export default App
