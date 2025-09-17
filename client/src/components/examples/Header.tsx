import Header from '../Header'
import { ThemeProvider } from '@/lib/theme-provider'
import { Router } from 'wouter'

export default function HeaderExample() {
  return (
    <ThemeProvider>
      <Router>
        <Header />
        <div className="pt-16 p-8">
          <p className="text-center text-muted-foreground">Header component example - try toggling theme and mobile menu</p>
        </div>
      </Router>
    </ThemeProvider>
  )
}