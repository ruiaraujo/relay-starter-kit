import { commitMutation, graphql } from 'react-relay';
import { ConnectionHandler } from 'relay-runtime';

const mutation = graphql`
  mutation AddMessageMutation($input: AddMessageInput!) {
    addMessage(input: $input) {
      messageEdge {
        __typename
        cursor
        node {
          id
          text
          timestamp
        }
      }
      viewer {
        id
        totalCount
      }
    }
  }
`;

function sharedUpdater(store, user, newEdge) {
  const userProxy = store.get(user.id);
  const conn = ConnectionHandler.getConnection(userProxy, 'MessageList_messages');
  ConnectionHandler.insertEdgeAfter(conn, newEdge);
}

let tempID = 0;

function commit(environment, text, user, onCompleted) {
  return commitMutation(environment, {
    mutation,
    variables: {
      input: {
        text,
        clientMutationId: tempID++
      }
    },
    onCompleted,
    updater: store => {
      const payload = store.getRootField('addMessage');
      const newEdge = payload.getLinkedRecord('messageEdge');
      sharedUpdater(store, user, newEdge);
    },
    optimisticUpdater: store => {
      const id = 'client:newMessage:' + tempID++;
      const node = store.create(id, 'Message');
      node.setValue(text, 'text');
      node.setValue(Date.now(), 'timestamp');
      node.setValue(id, 'id');
      const newEdge = store.create('client:newEdge:' + tempID++, 'MessageEdge');
      newEdge.setLinkedRecord(node, 'node');
      sharedUpdater(store, user, newEdge);
      const userProxy = store.get(user.id);
      userProxy.setValue(userProxy.getValue('totalCount') + 1, 'totalCount');
    }
  });
}

export default { commit };
