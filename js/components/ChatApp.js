import React, { Component, PropTypes } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import MessageList from './MessageList';
import AddMessageMutation from '../mutations/AddMessageMutation';
import ChatTextInput from './ChatTextInput';

class ChatApp extends Component {
  static propTypes = {
    viewer: PropTypes.shape({
      id: PropTypes.string.isRequired,
      totalCount: PropTypes.number.isRequired
    })
  };

  handleNewMessage = newMessage =>
    AddMessageMutation.commit(this.props.relay.environment, newMessage, this.props.viewer, () => {
      this._main.scrollTop = this._main.scrollHeight;
    });

  render() {
    return (
      <div>
        <div className="message-count">
          {'Total number of messages: ' + this.props.viewer.totalCount}
        </div>
        <section className="main" ref={main => (this._main = main)}>
          <MessageList viewer={this.props.viewer} />
        </section>
        <ChatTextInput onNewMessage={this.handleNewMessage} className="new-message" placeholder="Type a message" />
      </div>
    );
  }
}

export default createFragmentContainer(ChatApp, {
  viewer: graphql`
    fragment ChatApp_viewer on User {
      id
      totalCount
      ...MessageList_viewer
    }
  `
});
