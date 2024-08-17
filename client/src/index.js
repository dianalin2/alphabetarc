import './style';
import Router from 'preact-router';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
import Nav from './components/nav';

export default function App() {
    const paths = [
        { name: 'Home', path: '/', component: Home },
        { name: 'Login', path: '/login', component: Login },
        { name: 'Register', path: '/register', component: Register },
    ];

    return (
        <div>
            <Nav paths={paths} />
            <Router>
                {
                    paths.map((path) => (
                        <path.component path={path.path} />
                    ))
                }
            </Router>
        </div>
    );
}
