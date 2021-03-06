// Generated by CoffeeScript 1.6.1
(function() {
  var Response, utils;

  Response = require('../vo/Response').Response;

  utils = require("../utils");

  exports.createDepartment = function(departmentName, parentId, callback) {
    var client;
    client = utils.createClient();
    return client.incr("next_department_id", function(err, reply) {
      var department, result;
      if (err) {
        return utils.showDBError(callback, client);
      }
      client.hset("departments", "" + reply + ":name", departmentName);
      result = {
        name: departmentName
      };
      department = {
        name: departmentName,
        id: "" + reply
      };
      if (parentId) {
        client.hset("departments", "" + reply + ":pid", parentId);
        result["pid"] = parentId;
        department["pid"] = parentId;
      }
      client.quit();
      return callback(new Response(1, 'success', department));
    });
  };

  exports.removeDepartment = function(departmentId, callback) {
    var client;
    client = utils.createClient();
    return client.hdel("departments", "" + departmentId + ":name", "" + departmentId + ":pid", function(err, reply) {
      if (err) {
        return utils.showDBError(callback, client);
      }
      return client.hgetall("departments", function(err, reply) {
        var childOfKey, key, newDepartments, value;
        if (err) {
          return utils.showDBError(callback, client);
        }
        newDepartments = {};
        for (key in reply) {
          value = reply[key];
          childOfKey = key.split(":");
          if (childOfKey[1] === "pid" && value === departmentId) {
            client.hdel("departments", key);
          } else {
            newDepartments[key] = value;
          }
        }
        return client.hgetall("users", function(err, users) {
          if (err) {
            return utils.showDBError(callback, client);
          }
          for (key in users) {
            value = users[key];
            childOfKey = key.split(":");
            if (childOfKey[1] === "department_id" && value === departmentId) {
              client.hdel("users", key);
            }
          }
          return callback(new Response(1, 'success', newDepartments));
        });
      });
    });
  };

  exports.updateDepartment = function(departmentId, departmentName, parentId, callback) {
    var client, replycallback;
    client = utils.createClient();
    replycallback = function(err, reply) {
      if (err) {
        return utils.showDBError(callback, client);
      }
      return client.hgetall("departments", function(err, reply) {
        client.quit();
        return callback(new Response(1, 'success', reply));
      });
    };
    if (parentId) {
      return client.hmset("departments", "" + departmentId + ":name", departmentName, "" + departmentId + ":pid", parentId, replycallback);
    } else {
      return client.hset("departments", "" + departmentId + ":name", departmentName, replycallback);
    }
  };

  exports.getAllDepartments = function(callback) {
    var client;
    client = utils.createClient();
    return client.hgetall("departments", function(err, reply) {
      if (err) {
        return utils.showDBError(callback, client);
      }
      client.quit();
      return callback(new Response(1, 'success', reply));
    });
  };

}).call(this);
