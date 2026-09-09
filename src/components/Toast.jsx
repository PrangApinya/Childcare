import { IconCheck } from './icons.jsx'

export default function Toast({ message, show }) {
  return (
    <div className={`toast${show ? ' show' : ''}`}>
      <IconCheck size={18} strokeWidth={2.5} />
      <span>{message}</span>
    </div>
  )
}
