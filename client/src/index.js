import './style';
import 'typeface-poppins'

import { Component } from 'preact';
import Router from 'preact-router';
import Home from './routes/home';
import Login from './routes/login';
import Register from './routes/register';
import NewsletterNew from './routes/newsletter-new';
import Nav from './components/nav';

class ProtectedRoute extends Component {
    render() {
        if (localStorage.getItem('token')) {
            return this.props.component;
        } else {
            return <Login />;
        }
    }
}

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
            { name: 'Create Newsletter', path: '/newsletter/new', component: ProtectedRoute, props: { component: <NewsletterNew /> } },
        ];

        const loggedInPaths = [
            { name: 'Home', path: '/', component: Home },
            { name: 'Create Newsletter', path: '/newsletter/new', component: ProtectedRoute, props: { component: <NewsletterNew /> } },
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
                            <path.component path={path.path} {...path.props} />
                        ))
                    }
                </Router>
            </div >
        );
    }
}
