"use strict";

exports.__esModule = true;
exports["default"] = emitter;

var _eventEmitter = _interopRequireDefault(require("event-emitter"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _emitter;

function emitter() {
  if (!_emitter) {
    _emitter = (0, _eventEmitter["default"])({});
  }

  return _emitter;
}

module.exports = exports.default;