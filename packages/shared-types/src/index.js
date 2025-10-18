export function isStatusMessage(message) {
    return typeof message === 'object' && message !== null && 'type' in message && message.type === 'status';
}
export function isCommandMessage(message) {
    return typeof message === 'object' && message !== null && 'type' in message && message.type === 'command';
}
export function isAlertMessage(message) {
    return typeof message === 'object' && message !== null && 'type' in message && message.type === 'alert';
}
//# sourceMappingURL=index.js.map