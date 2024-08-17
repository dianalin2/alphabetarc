import { Component } from 'preact';

export default class Login extends Component {
    constructor() {
        super();
        this.handleLogin = this.handleLogin.bind(this);
        this.onLogin = this.onLogin.bind(this);
    }

    async handleLogin(event) {
        event.preventDefault();
        const response = await fetch('/api/v1/user/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: event.target.email.value,
                password: event.target.password.value
            })
        });

        const body = await response.json();

        if (response.status === 200) {
            this.onLogin(body.token);
        } else {
            alert(body.message);
        }
    }

    onLogin(token) {
        localStorage.setItem('token', token);
        window.location = '/';
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleSubmit} key="login">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required />
                    <br />
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required />
                    <button type="submit">Login</button>
                </form>
            </div>
        );
    }
}
