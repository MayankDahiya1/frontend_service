import { gql } from "@apollo/client";

export const GET_CONVERSATIONS = gql`
  query ChatGetConversations {
    ChatGetConversations {
      id
      title
      createdAt
    }
  }
`;

export const START_CONVERSATION = gql`
  mutation ChatStartConversation($message: String!) {
    ChatStartConversation(message: $message) {
      conversationId
      title
      userMessage
      assistantMessage
    }
  }
`;

export const GET_MESSAGES = gql`
  query ChatGetMessages($conversationId: String!) {
    ChatGetMessages(conversationId: $conversationId) {
      id
      role
      content
      createdAt
    }
  }
`;

export const SEND_MESSAGE = gql`
  mutation ChatSendMessage($conversationId: String!, $message: String!) {
    ChatSendMessage(conversationId: $conversationId, message: $message) {
      content
      status
      role
      createdAt
      message
    }
  }
`;

export const DELETE_CONVERSATION = gql`
  mutation ChatDeleteConversation($conversationId: String!) {
    ChatDeleteConversation(conversationId: $conversationId) {
      status
      message
    }
  }
`;

export const SUBSCRIBE_CONVERSATION_CREATED = gql`
  subscription conversationCreated {
    conversationCreated {
      createdAt
      id
      title
      userId
    }
  }
`;

export const TOKEN_GENERATE = gql`
  mutation AccountTokenGenerate($refreshToken: String!) {
    AccountTokenGenerate(refreshToken: $refreshToken) {
      accessToken
      refreshToken
      status
      message
    }
  }
`;
