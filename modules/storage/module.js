// (C) 2015 Internet of Coins / Metasync / Joachim de Koning
// hybridd module - storage/module.js
// Module to provide storage

// required libraries in this context
var DJB2 = require('../../lib/crypto/hashDJB2');
var proofOfWork = require('../../lib/crypto/proof');
var storage = require('./storage'); // key-value storage
var execSync = require('child_process').execSync;
var scheduler = require('../../lib/scheduler');

// exports
exports.init = init;
exports.exec = exec;
exports.proof = proof;
exports.getStorage = getStorage;
exports.getMeta = getMeta;

// initialization function
function init () {
  var modulename = 'storage';
  // check for storage directory? if not there make one
  execSync('mkdir -p ../storage');
}

// exec
function exec (properties) {
  // decode our serialized properties
  var processID = properties.processID;
  // var source = properties.source;
  var target = properties.target;
  var mode = target.mode;
  var type = target.type;
  var factor = (typeof target.factor !== 'undefined' ? target.factor : 8);
  var command = properties.command;
  var subprocesses = [];
  // set request to what command we are performing
  global.hybridd.proc[processID].request = properties.command;
  // handle standard cases here, and construct the sequential process list
  switch (command[0]) {
    case 'cron' :
      storage.AutoClean();
      break;
    case 'get':
      if (typeof command[1] !== 'undefined') {
        subprocesses.push('func("storage","getStorage",{key:"' + command[1] + '"})');
      } else {
        subprocesses.push('stop(1,"Please provide a storage key!")');
      }
      break;
    // stores data and returns proof of work to be solved
    case 'set':
      if (typeof command[1] !== 'undefined') {
        if (typeof command[2] !== 'undefined') {
          if (typeof command[2] === 'string') {
            if (command[2].length <= 4096) { // storage limit per information block
            // create proof of work
              var bytes = command[2].length;
              var difficulty = (bytes * 64 > 5000 ? bytes * 64 : 5000); // the more bytes to store, the bigger the POW challenge
              var pow = proofOfWork.create(difficulty);
              // save storage
              storage.Set(command[1], command[2], {time: Date.now(), hash: DJB2.hash(command[2]), size: bytes, pow: pow.proof, res: pow.hash, n: 0});
              subprocesses.push('stop(0,"' + pow.hash + '")');
            } else {
              subprocesses.push('stop(1,"Storage object limit is 4096 bytes!")');
            }
          } else {
            subprocesses.push('stop(1,"Storage must be a string!")');
          }
        } else {
          subprocesses.push('stop(1,"Please provide a storage value!")');
        }
      } else {
        subprocesses.push('stop(1,"Please provide a storage key!")');
      }
      break;
    case 'pow':
      if (typeof command[1] !== 'undefined') {
        if (typeof command[2] !== 'undefined') {
          subprocesses.push('func("storage","proof",{key:"' + command[1] + '",pow:"' + command[2] + '"})');
        } else {
          subprocesses.push('stop(1,"Please provide a proof-of-work value!")');
        }
      } else {
        subprocesses.push('stop(1,"Please provide a storage key!")');
      }
      break;
    case 'del':
      subprocesses.push('stop(1,"Deleting data from node storage is not supported!")');
      break;
    case 'meta':
      if (typeof command[1] !== 'undefined') {
        subprocesses.push('func("storage","getMeta",{key:"' + command[1] + '"})');
      } else {
        subprocesses.push('stop(1,"Please provide a storage key!")');
      }
      break;
    default:
      subprocesses.push('stop(1,"Source function not supported!")');
  }
  // fire the Qrtz-language program into the subprocess queue
  scheduler.fire(processID, subprocesses);
}

function proof (properties) {
  var processID = properties.processID;
  var key = properties.key;
  var pow = properties.pow;
  storage.GetMeta(key, function (meta) {
    if (meta !== null) {
      if (meta.pow === pow) {
        if (meta.res !== 1) {
          meta.n += 1;
          meta.res = 1;
          storage.SetMeta(key, meta);
          scheduler.stop(processID, {err: 0, data: 'OK'});
        } else {
          scheduler.stop(processID, {err: 0, data: 'Ignored.'});
        }
      } else {
        scheduler.stop(processID, {err: 1, data: 'Invalid proof!'});
      }
    } else {
      scheduler.stop(processID, {err: 1, data: 'Invalid key!'});
    }
  });
}

function getStorage (properties) {
  var processID = properties.processID;
  var key = properties.key;
  storage.Get(key, function (data) {
    if (data === null) {
      scheduler.stop(processID, {err: 1, data: null});
    } else {
      scheduler.stop(processID, {err: 0, data: data});
    }
  });
}

function getMeta (properties) {
  var processID = properties.processID;
  var key = properties.key;
  storage.GetMeta(key, function (meta) {
    if (meta === null) {
      scheduler.stop(processID, {err: 1, data: null});
    } else {
      if (typeof meta.pow !== 'undefined') { delete meta.pow; }
      scheduler.stop(processID, {err: 0, data: meta});
    }
  });
}
