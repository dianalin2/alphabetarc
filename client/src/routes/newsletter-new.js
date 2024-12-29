import { Component } from 'preact';
import ListInput from '../components/list-input';
import React from 'preact/compat';

export default class NewsletterNew extends Component {
    constructor() {
        super();

        this.setAdmins = this.setAdmins.bind(this);
        this.setInvitedSubscribers = this.setInvitedSubscribers.bind(this);
        this.handleCreate = this.handleCreate.bind(this);
        this.state = {
            admins: [],
            invitedSubscribers: [],
        };
    }

    setAdmins(admins) {
        console.log(admins);
        this.setState({ admins });
    }

    setInvitedSubscribers(invitedSubscribers) {
        this.setState({ invitedSubscribers });
    }

    async handleCreate(event) {
        event.preventDefault();

        const response = await fetch('/api/v1/newsletter/new', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify({
                admins: this.state.admins,
                invitedSubscriberEmails: this.state.invitedSubscribers,
                frequency: parseInt(event.target.frequency.value),
                questionMaking: parseInt(event.target['question-making'].value),
                title: event.target.title.value,
                description: event.target.description.value,
                startDate: event.target['start-date'].value,
            }),
        });

        const body = await response.json();

        console.log(body);

        // if (response.status === 200) {
        //     window.location = `/newsletter/${body.id}`;
        // } else {
        //     alert(body.message);
        // }
    }

    render() {
        return (
            <div>
                <form onSubmit={this.handleCreate} key="create">
                    <label for="title">Title</label>
                    <br />
                    <input type="text" id="title" name="title" required />

                    <br />

                    <label for="description">Description</label>
                    <br />
                    <textarea id="description" name="description" required></textarea>

                    <br />

                    <label for="frequency">Frequency</label>
                    <select id="frequency" name="frequency">
                        <option value="86400000">Daily</option>
                        <option value="604800000">Weekly</option>
                        <option value="18144000000">Monthly</option>
                    </select>

                    <br />

                    <label for="question-making">Question Making Time</label>
                    <select id="question-making" name="question-making">
                        <option value="172800000">2 Days</option>
                        <option value="604800000">1 Week</option>
                        <option value="1209600000">2 Weeks</option>
                    </select>

                    <br />

                    <label for="start-date">Start Date</label>
                    <input type="date" id="start-date" name="start-date" required />

                    <hr />
                    <label for="admins">Admins</label>
                    <ListInput callback={this.setAdmins} />
                    <br />
                    <label for="invited-subscribers">Invited Subscribers</label>
                    <ListInput callback={this.setInvitedSubscribers} />
                    <br />
                    <button type="submit">Create</button>
                </form>
            </div>
        );
    }
}
