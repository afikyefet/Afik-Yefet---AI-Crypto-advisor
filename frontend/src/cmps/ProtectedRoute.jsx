import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

export function ProtectedRoute({ children }) {
    const { user } = useSelector(storeState => storeState.userModule)

    if (!user) {
        return <Navigate to="/login" replace />
    }

    return children
}
