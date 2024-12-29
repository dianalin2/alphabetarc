import { Component } from "preact";

export default class ListInput extends Component {
    constructor() {
        super();
        this.state = { items: [], lastKey: '', currentValue: '' };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleType = this.handleType.bind(this);
        this.deleteItem = this.deleteItem.bind(this);
    }

    handleKeyDown(event) {
        this.setState({ lastKey: event.key });

        if (event.key === 'Backspace' && this.state.items.length > 0 && event.target.value.length <= 1) {
            event.target.value = this.state.items[this.state.items.length - 1] + ',';
            this.setState({ items: this.state.items.slice(0, -1) });
            if (this.props.callback)
                this.props.callback(this.state.items);
        }
    }

    handleType(event) {
        if (this.state.lastKey === ',') {
            let items = this.state.items.concat(event.target.value.split(',')[0])
            this.setState({ items });
            if (this.props.callback)
                this.props.callback(items);

            event.target.value = event.target.value.replace(/[^,]*,/, '');
        } else {
            this.setState({ currentValue: event.target.value });
            if (this.props.callback)
                this.props.callback(this.state.items.concat(event.target.value));
        }
    }

    deleteItem(event) {
        let items = this.state.items.filter((item) => item !== event.target.innerText);
        this.setState({ items });
        if (this.props.callback)
            this.props.callback(items);
    }

    render() {
        return (
            <div style={{ padding: '5px', border: '1px black', borderRadius: '5px' }}>
                {
                    this.state.items.map((item) => (
                        <button style={{ display: 'inline-block', padding: '5px', borderRadius: '5px', backgroundColor: 'gray' }} onClick={this.deleteItem}>{item}</button>
                    ))
                }

                <input type="text" onKeyDownCapture={this.handleKeyDown} onInput={this.handleType} />

                <input type="hidden" name={this.props.name} value={(this.state.currentValue ? this.state.items.concat(this.state.currentValue) : this.state.items)} />
            </div>
        );
    }
}
