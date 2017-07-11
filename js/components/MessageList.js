import React, { Component } from 'react';
import { createFragmentContainer, graphql } from 'react-relay';

import Message from './Message';

class MessageList extends Component {
  renderMessages = () =>
    this.props.viewer.messages.edges.map(edge =>
      <Message key={edge.node.id} message={edge.node} viewer={this.props.viewer} />
    );

  render() {
    return (
      <ul className="message-list">
        {this.renderMessages()}
      </ul>
    );
  }
}

export default createFragmentContainer(MessageList, {
  viewer: graphql`
    fragment MessageList_viewer on User {
      messages(
        first: 2147483647 # max GraphQLInt
      ) @connection(key: "MessageList_messages") {
        edges {
          node {
            id
            ...Message_message
          }
        }
      }
      id
      totalCount
      ...Message_viewer
    }
  `
});
