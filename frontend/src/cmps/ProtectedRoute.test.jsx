import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { createStore } from 'redux'
import { ProtectedRoute } from './ProtectedRoute'

// Helper to create a mock store
function createMockStore(user) {
    return createStore(() => ({
        userModule: { user }
    }))
}

// Helper to render with providers
function renderWithProviders(ui, { store, initialEntries = ['/protected'] } = {}) {
    return render(
        <Provider store={store}>
            <MemoryRouter initialEntries={initialEntries}>
                <Routes>
                    <Route path="/login" element={<div>Login Page</div>} />
                    <Route path="/protected" element={ui} />
                </Routes>
            </MemoryRouter>
        </Provider>
    )
}

describe('ProtectedRoute', () => {
    it('should render children when user is logged in', () => {
        const store = createMockStore({ _id: '123', name: 'Test User' })

        renderWithProviders(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { store }
        )

        expect(screen.getByText('Protected Content')).toBeInTheDocument()
    })

    it('should redirect to login when user is not logged in', () => {
        const store = createMockStore(null)

        renderWithProviders(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { store }
        )

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    it('should redirect to login when user is undefined', () => {
        const store = createStore(() => ({
            userModule: { user: undefined }
        }))

        renderWithProviders(
            <ProtectedRoute>
                <div>Protected Content</div>
            </ProtectedRoute>,
            { store }
        )

        expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
        expect(screen.getByText('Login Page')).toBeInTheDocument()
    })

    it('should render nested components when authenticated', () => {
        const store = createMockStore({ _id: '123', name: 'Test' })

        renderWithProviders(
            <ProtectedRoute>
                <div>
                    <h1>Dashboard</h1>
                    <p>Welcome to the app</p>
                </div>
            </ProtectedRoute>,
            { store }
        )

        expect(screen.getByText('Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Welcome to the app')).toBeInTheDocument()
    })
})
