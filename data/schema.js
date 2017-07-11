import {
  GraphQLBoolean,
  GraphQLID,
  GraphQLInt,
  GraphQLFloat,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString
} from 'graphql';

import {
  connectionArgs,
  connectionDefinitions,
  connectionFromArray,
  cursorForObjectInConnection,
  fromGlobalId,
  globalIdField,
  mutationWithClientMutationId,
  nodeDefinitions
} from 'graphql-relay';

import {
  Message,
  User,
  addMessage,
  getMessage,
  getMessages,
  getUser,
  getViewer,
  removeMessages,
  editMessage
} from './database';

const { nodeInterface, nodeField } = nodeDefinitions(
  globalId => {
    const { type, id } = fromGlobalId(globalId);
    if (type === 'Message') {
      return getMessage(id);
    } else if (type === 'User') {
      return getUser(id);
    }
    return null;
  },
  obj => {
    if (obj instanceof Message) {
      return GraphQLMessage;
    } else if (obj instanceof User) {
      return GraphQLUser;
    }
    return null;
  }
);

const GraphQLMessage = new GraphQLObjectType({
  name: 'Message',
  fields: {
    id: globalIdField('Message'),
    text: {
      type: GraphQLString,
      resolve: obj => obj.text
    },
    timestamp: {
      type: GraphQLFloat, // Because big ints make GraphQLInt return null
      resolve: obj => obj.timestamp
    }
  },
  interfaces: [nodeInterface]
});

const { connectionType: MessagesConnection, edgeType: GraphQLMessageEdge } = connectionDefinitions({
  name: 'Message',
  nodeType: GraphQLMessage
});

const GraphQLUser = new GraphQLObjectType({
  name: 'User',
  fields: {
    id: globalIdField('User'),
    messages: {
      type: MessagesConnection,
      args: {
        ...connectionArgs
      },
      resolve: (obj, { ...args }) => connectionFromArray(getMessages(), args)
    },
    name: {
      type: GraphQLString,
      resolve: () => getViewer().name
    },
    totalCount: {
      type: GraphQLInt,
      resolve: () => getMessages().length
    }
  },
  interfaces: [nodeInterface]
});

const Query = new GraphQLObjectType({
  name: 'Query',
  fields: {
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer()
    },
    node: nodeField
  }
});

const GraphQLAddMessageMutation = mutationWithClientMutationId({
  name: 'AddMessage',
  inputFields: {
    text: { type: new GraphQLNonNull(GraphQLString) }
  },
  outputFields: {
    messageEdge: {
      type: GraphQLMessageEdge,
      resolve: ({ localMessageId }) => {
        const message = getMessage(localMessageId);
        return {
          cursor: cursorForObjectInConnection(getMessages(), message),
          node: message
        };
      }
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer()
    }
  },
  mutateAndGetPayload: ({ text }) => {
    const localMessageId = addMessage(text, Date.now());
    return { localMessageId };
  }
});

const GraphQLRemoveMessageMutation = mutationWithClientMutationId({
  name: 'RemoveMessage',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) }
  },
  outputFields: {
    deletedMessageId: {
      type: GraphQLID,
      resolve: ({ id }) => id
    },
    viewer: {
      type: GraphQLUser,
      resolve: () => getViewer()
    }
  },
  mutateAndGetPayload: ({ id }) => {
    const localMessageId = fromGlobalId(id).id;
    removeMessages(localMessageId);
    return { id };
  }
});

const GraphQLEditMessageMutation = mutationWithClientMutationId({
  name: 'EditMessage',
  inputFields: {
    id: { type: new GraphQLNonNull(GraphQLID) },
    text: { type: new GraphQLNonNull(GraphQLString) }
  },
  outputFields: {
    message: {
      type: GraphQLMessage,
      resolve: ({ localMessageId }) => getMessage(localMessageId)
    }
  },
  mutateAndGetPayload: ({ id, text }) => {
    const localMessageId = fromGlobalId(id).id;
    editMessage(localMessageId, text);
    return { localMessageId };
  }
});

const Mutation = new GraphQLObjectType({
  name: 'Mutation',
  fields: {
    addMessage: GraphQLAddMessageMutation,
    removeMessage: GraphQLRemoveMessageMutation,
    editMessage: GraphQLEditMessageMutation
  }
});

export const schema = new GraphQLSchema({
  query: Query,
  mutation: Mutation
});
