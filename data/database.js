export class Message {}
export class User {}

// Mock authenticated ID
const VIEWER_ID = 'me';
const VIEWER_NAME = 'Rui';

// Mock user data
const viewer = new User();
viewer.id = VIEWER_ID;
viewer.name = VIEWER_NAME;
const usersById = {
  [VIEWER_ID]: viewer
};

// Mock message data
const messageById = {};
const messageIdsByUser = {
  [VIEWER_ID]: []
};
let nextMessageId = 0;

export function addMessage(text, timestamp) {
  const message = new Message();
  message.id = `${nextMessageId++}`;
  message.text = text;
  message.timestamp = timestamp;
  messageById[message.id] = message;
  messageIdsByUser[VIEWER_ID].push(message.id);
  return message.id;
}

export function getMessage(id) {
  return messageById[id];
}

export function getMessages() {
  return messageIdsByUser[VIEWER_ID].map(id => messageById[id]);
}

export function getUser(id) {
  return usersById[id];
}

export function getViewer() {
  return getUser(VIEWER_ID);
}

export function removeMessages(id) {
  const messageIndex = messageIdsByUser[VIEWER_ID].indexOf(id);
  if (messageIndex !== -1) {
    messageIdsByUser[VIEWER_ID].splice(messageIndex, 1);
  }
  delete messageById[id];
}

export function editMessage(id, text) {
  const message = getMessage(id);
  message.text = text;
}
