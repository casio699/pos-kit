import AppRouter from './AppRouter'
import { Toaster } from 'sonner'

export default function App() {
  return (
    <>
      <AppRouter />
      <Toaster position="top-center" richColors closeButton />
    </>
  )
}
