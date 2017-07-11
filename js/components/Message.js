import React from 'react';
import { createFragmentContainer, graphql } from 'react-relay';
import classnames from 'classnames';

import RemoveMessageMutation from '../mutations/RemoveMessageMutation';
import EditMessageMutation from '../mutations/EditMessageMutation';
import ChatTextInput from './ChatTextInput';
import FormattedDate from './FormattedDate';

class Message extends React.Component {
  state = {
    isEditing: false
  };

  handleLabelDoubleClick = () => this.setState({ isEditing: true });

  handleEditedMessage = text => {
    this.setState({ isEditing: false });
    if (!text) {
      return this.removeMessage();
    }
    EditMessageMutation.commit(this.props.relay.environment, text, this.props.message);
  };

  removeMessage = () => {
    RemoveMessageMutation.commit(this.props.relay.environment, this.props.message, this.props.viewer);
  };

  render() {
    return (
      <li
        className={classnames({
          editing: this.state.isEditing
        })}
      >
        <div className="view">
          <span className="username">
            {this.props.viewer.name}
          </span>
          <label onDoubleClick={this.handleLabelDoubleClick}>
            {this.props.message.text}
          </label>
          {this.state.isEditing &&
            <ChatTextInput
              className="edit"
              initialValue={this.props.message.text}
              onNewMessage={this.handleEditedMessage}
            />}
          <button className="destroy" onClick={this.removeMessage} />
        </div>
        <span className="timestamp">
          <FormattedDate date={this.props.message.timestamp} />
        </span>
      </li>
    );
  }
}

export default createFragmentContainer(Message, {
  message: graphql`
    fragment Message_message on Message {
      id
      text
      timestamp
    }
  `,
  viewer: graphql`
    fragment Message_viewer on User {
      id
      name
    }
  `
});
