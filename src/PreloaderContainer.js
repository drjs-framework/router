global.PRELOADERS = {};

function checkSessionId(sessionId) {
  if (!sessionId || typeof sessionId === 'function') {
    throw Error('Session id not exists');
  }
}

function getPreloaderOfSession(sessionId) {
  if (!global.PRELOADERS[sessionId]) {
    return {};
  }
  return global.PRELOADERS[sessionId];
}

export default class PreloaderContainer {
  static addPreloaders(sessionId, preloader, name) {
    checkSessionId(sessionId);

    if (!global.PRELOADERS[sessionId]) {
      global.PRELOADERS[sessionId] = {};
    }

    if (!global.PRELOADERS[sessionId][name]) {
      global.PRELOADERS[sessionId][name] = preloader;
    }
  }

  static clearPreloaders(sessionId) {
    checkSessionId(sessionId);

    global.PRELOADERS[sessionId] = {};
  }

  static getPreloaders(sessionId, parameters) {
    checkSessionId(sessionId);

    return Object
      .values(getPreloaderOfSession(sessionId))
      .map(preloader => preloader(parameters));
  }
}
