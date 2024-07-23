export const WebSocketCloseCode = {
  NORMAL_CLOSURE: 1000, // Used when the connection has completed its purpose normally
  GOING_AWAY: 1001, // Used when the endpoint is going away (e.g., server shutdown or browser page navigation)
  PROTOCOL_ERROR: 1002, // Used when an endpoint terminates the connection due to a protocol error
  UNSUPPORTED_DATA: 1003, // Used when an endpoint received data of a type it cannot accept (e.g., text-only endpoint receiving binary data)
  NO_STATUS_RECEIVED: 1005, // Reserved. Not to be used when sending a close frame
  ABNORMAL_CLOSURE: 1006, // Reserved. Not to be used when sending a close frame
  INVALID_FRAME_PAYLOAD_DATA: 1007, // Used when an endpoint received a message that is inconsistent with the type of the message (e.g., non-UTF-8 data within a text message)
  POLICY_VIOLATION: 1008, // Used when an endpoint is terminating the connection because it received a message that violates its policy
  MESSAGE_TOO_BIG: 1009, // Used when an endpoint is terminating the connection because a data frame was too large
  MANDATORY_EXTENSION: 1010, // Used by the client when it expected the server to negotiate one or more extension, but the server didn't
  INTERNAL_ERROR: 1011, // Used when the server is terminating the connection because it encountered an unexpected condition that prevented it from fulfilling the request
  SERVICE_RESTART: 1012, // Used when the server is terminating the connection because it is restarting
  TRY_AGAIN_LATER: 1013, // Used when the server is terminating the connection due to a temporary condition, e.g. it is overloaded and is casting off some of its clients
  BAD_GATEWAY: 1014, // Used by intermediate proxy servers that intercept a WebSocket connection when the connection to the target server failed
  TLS_HANDSHAKE_FAILURE: 1015 // Reserved. Not to be used when sending a close frame. Indicates that the connection was closed due to a failure to perform a TLS handshake
} as const

export type WebSocketCloseCodeType = typeof WebSocketCloseCode[keyof typeof WebSocketCloseCode]

export const WebSocketCloseReason: { [key in WebSocketCloseCodeType]: string } = {
  1000: 'Normal closure - The connection has completed its purpose',
  1001: 'Going away - The endpoint is going away (e.g., server shutdown or browser page navigation)',
  1002: 'Protocol error - The connection is being terminated due to a protocol error',
  1003: 'Unsupported data - The connection is being terminated because unsupported data was received',
  1005: 'No status received - Reserved. Indicates that no status code was provided even though one was expected',
  1006: 'Abnormal closure - Reserved. Used to indicate that a connection was closed abnormally',
  1007: 'Invalid frame payload data - The connection is being terminated because invalid data was received',
  1008: 'Policy violation - The connection is being terminated because a message was received that violates the endpoint\'s policy',
  1009: 'Message too big - The connection is being terminated because a data frame was too large',
  1010: 'Mandatory extension - The client is terminating the connection because the server didn\'t negotiate an expected extension',
  1011: 'Internal error - The server is terminating the connection because it encountered an unexpected condition',
  1012: 'Service restart - The server is terminating the connection because it is restarting',
  1013: 'Try again later - The server is terminating the connection due to a temporary condition',
  1014: 'Bad gateway - Used by intermediate proxy servers when the connection to the target server failed',
  1015: 'TLS handshake failure - Reserved. Indicates that the connection was closed due to a failure to perform a TLS handshake'
}

export const isWebSocketCloseCode = (code: number): code is WebSocketCloseCodeType =>
  Object.values(WebSocketCloseCode).includes(code as WebSocketCloseCodeType)
