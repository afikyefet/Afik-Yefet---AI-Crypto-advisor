import { Provider } from 'react-redux'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AppHeader } from './cmps/AppHeader'
import { AppFooter } from './cmps/AppFooter'
import { Preferences } from './cmps/Preferences'
import { ProtectedRoute } from './cmps/ProtectedRoute'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { store } from './store/store'

function App() {

  return (
    <>
      <Provider store={store}>
        <BrowserRouter>
          <div className="app-layout">
            <AppHeader />
            <main className="app-main">
              <Routes>
                <Route path="/" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                <Route path="/preferences" element={
                  <ProtectedRoute>
                    <Preferences />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
              </Routes>
            </main>
            <AppFooter />
          </div>
        </BrowserRouter>
      </Provider>

    </>
  )
}

export default App
