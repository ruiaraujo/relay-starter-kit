import React, { Component, PropTypes } from 'react';

const ENTER_KEY_CODE = 13;

export default class ChatTextInput extends Component {
  static propTypes = {
    onNewMessage: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    className: PropTypes.string,
    initialValue: PropTypes.string
  };

  state = {};

  componentWillMount() {
    this.setState({ value: this.props.initialValue || '' });
  }

  handleChange = ev => this.setState({ value: ev.target.value });

  handleEnter = ev => {
    if (ev.keyCode === ENTER_KEY_CODE) {
      if (this.state.value || this.props.initialValue) {
        this.props.onNewMessage(this.state.value);
        this.setState({ value: '' });
      }
    }
  };

  render() {
    return (
      <input
        type="text"
        placeholder={this.props.placeholder}
        value={this.state.value}
        className={this.props.className}
        onChange={this.handleChange}
        onKeyDown={this.handleEnter}
      />
    );
  }
}
