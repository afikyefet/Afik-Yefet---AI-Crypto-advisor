import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../store/actions/user.action'

export function AppHeader() {
    const { user } = useSelector(storeState => storeState.userModule)
    const navigate = useNavigate()

    function handleLogout() {
        logout()
        navigate('/login')
    }

    return (
        <div className="app-header-container">
            <Link to="/"><h1 className="app-header-title">Afik's AI Crypto Advisor</h1></Link>
            <div className="app-header-user">
                {user ? (
                    <>
                        <span>Hello {user.name}</span>
                        <button onClick={() => navigate('/preferences')}>Preferences</button>
                        <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <button onClick={() => navigate('/login')}>Login</button>
                )}
            </div>
        </div>
    )
}