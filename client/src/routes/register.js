import { Component } from 'preact';

export default class Login extends Component {
    constructor() {
        super();
        this.handleRegister = this.handleRegister.bind(this);
        this.handleVerify = this.handleVerify.bind(this);
        this.state = {
            showVerify: false
        }
    }

    async handleRegister(event) {
        event.preventDefault();
        const response = await fetch('/api/v1/user/new', {
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
            this.setState({ showVerify: true });
        } else {
            alert(body.message);
        }
    }

    async handleVerify(event) {
        event.preventDefault();
        const response = await fetch('/api/v1/user/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                token: event.target.token.value
            })
        });

        const body = await response.json();

        if (response.status === 200) {
            window.location = '/login';
        } else {
            alert(body.message);
        }
    }

    render() {
        const form = this.state.showVerify ? (
            <form onSubmit={this.handleVerify}>
                <span>
                    Please check your email for a verification token.
                </span>
                <br />
                <label for="token">Token</label>
                <input type="text" id="token" name="token" key="token" required />
                <button type="submit">Verify</button>
            </form>
        ) : (
            <form onSubmit={this.handleRegister}>
                <label for="email">Email</label>
                <input type="email" id="email" name="email" key="email" required />
                <br />
                <label for="password">Password</label>
                <input type="password" id="password" name="password" key="password" required />
                <button type="submit">Register</button>
            </form>
        );
        return (
            <div>
                {form}
            </div>
        );
    }
}
