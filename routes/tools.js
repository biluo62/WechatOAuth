'use strict';
var router = require('express').Router();
var ObjectID = require('bson-objectid');
var CONSTANTS = require('../constants/Constants');

var SUCCESS_CODE = CONSTANTS.StatusCodes.SUCCESS;
var BAD_REQUEST = CONSTANTS.StatusCodes.BAD_REQUEST;
var INVALID_PARAMETER = CONSTANTS.StatusCodes.INVALID_PARAMETER;
var PARAM_TYPES = CONSTANTS.ToolsModule.GENERATOR_PARAM_TYPES

function generateObjectId (param) {
  if (param) {
    return ObjectID(param).toString()
  }

  return ObjectID().toString()
}

/**
 * generate bson object ids.
 *
 * @params type: ['time', 'hex', 'string', 'array', 'buffer', 'empty'].
 * @params code: create bson object arguments.
 * @params number: the count of generate objectId.
 *
 * return { error: null, statusCode: 200, data: { items: ['5859fd347c73221d9c7e4617'] } }
 */
router.post('/generate-object-ids', function (req, res, next) {
  var type = req.body.type;
  var code = req.body.code;
  var number = req.body.number;
  var delimiter = req.body.delimiter || ',';
  var params = [];

  if (!type) {
    var error = new Error('Miss Params');
    var item = { type: error.toString() };
    res.status(BAD_REQUEST).send({ error: error, statusCode: BAD_REQUEST, messages: [item] });
  }

  if (!number) {
    var error = new Error('Miss Params');
    var item = { number: error.toString() };
    res.status(BAD_REQUEST).send({ error: error, statusCode: BAD_REQUEST, messages: [item] });
  } else {
    number = parseInt(number, 10);
  }

  if (code) {
    params = code.split(delimiter);
  }

  var index = 0;
  var param;
  var objectIds = [];
  try {
    while (index++ < number) {
      var objectId;
      if (type === PARAM_TYPES.EMPTY) {
        objectId = generateObjectId();
      } else {
        var length = params.length;
        if (length !== number) {
          throw new Error('code params length is not match the count of will generate objectIds');
        }

        switch (type) {
          case PARAM_TYPES.TIME:
            param = parseFloat(params[index - 1]);
            if (!param) {
              throw new Error('param type should be date time (in seconds)');
            }
            break;
          case PARAM_TYPES.HEX:
            // todo: to deal with big number
            param = parseFloat(params[index - 1]);
            if (!param) {
              throw new Error('Param type should be a 24 character hex string');
            }
            break;
          case PARAM_TYPES.STRING:
            param = params[index - 1];
            break;
          case PARAM_TYPES.ARRAY:
            param = params[index - 1];
            param = param.spilt('|');
            break;
          case PARAM_TYPES.BUFFER:
            param = params[index - 1];
            param = new Buffer(param.spilt('|'))
            break;
        }
        objectId = generateObjectId(param);
      }

      objectIds.push(objectId)
    }
    res.status(SUCCESS_CODE).send({ error: null, statusCode: SUCCESS_CODE, data: { items: objectIds } });
  } catch (error) {
    var item = {};
    item[type] = error.toString();
    res.status(BAD_REQUEST).send({ error: error, statusCode: BAD_REQUEST, messages: [item] });
  }
});

module.exports = router;
