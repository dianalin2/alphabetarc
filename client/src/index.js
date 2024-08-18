import './style';
import 'typeface-poppins'

import { Component } from 'preact';
import Router from 'preact-router';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
import Nav from './components/nav';

export default class App extends Component {
    constructor() {
        super();
        this.state = { token: localStorage.getItem('token') };
    }

    render() {
        const paths = [
            { name: 'Home', path: '/', component: Home },
            { name: 'Login', path: '/login', component: Login },
            { name: 'Register', path: '/register', component: Register },
        ];

        const loggedInPaths = [
            { name: 'Home', path: '/', component: Home },
        ];

        const loggedOutPaths = [
            { name: 'Home', path: '/', component: Home },
            { name: 'Login', path: '/login', component: Login },
            { name: 'Register', path: '/register', component: Register },
        ];

        return (
            <div>
                <Nav paths={this.state.token ? loggedInPaths : loggedOutPaths} />
                <Router>
                    {
                        paths.map((path) => (
                            <path.component path={path.path} />
                        ))
                    }
                </Router>
            </div >
        );
    }
}
