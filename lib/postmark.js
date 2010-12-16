var http = require('http');
var querystring = require('querystring');

function catchResponse(req,callback) {
  if (typeof callback == "function") {
    req.on('response', function (res) {
      var response = '';
      res.setEncoding('utf8');
      res.on('data', function(chunk) { response += chunk; });
      res.on('end', function() {
        var err = 200==res.statusCode ? 0 : res.statusCode ;
        try {
          response = JSON.parse(response);
        } catch (e) {
          response = {};
        }
        callback(err, response);
      });
    });
  }
}

module.exports = function (apiKey, options) {
  var defaults = options || {};
  var headers = {
    'Host': 'api.postmarkapp.com',
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'X-Postmark-Server-Token': apiKey,
  }

  function request(method,path) {
    return http.createClient(80, 'api.postmarkapp.com', !!defaults.ssl).request(method, path, headers);
  }
  function get(path, callback) {
    var req = request('GET', path);
    catchResponse(req, callback);
    req.end();
  }

  return {
    send: function(options, callback) {
      var message = {
        From        : options.From     || defaults.From,
        To          : options.To       || defaults.To,
        Cc          : options.Cc       || defaults.Cc,
        Bcc         : options.Bcc      || defaults.Bcc,
        Subject     : options.Subject  || defaults.Subject,
        Tag         : options.Tag      || defaults.Tag,
        HtmlBody    : options.HtmlBody || defaults.HtmlBody,
        TextBody    : options.TextBody || defaults.TextBody,
        ReplyTo     : options.ReplyTo  || defaults.ReplyTo,
        Headers     : options.Headers  || defaults.Headers,
        Attachments : undefined,
      };
      if (message.To instanceof Array) {
        message.To = message.To.join(',');
      }
      if (message.Cc instanceof Array) {
        message.Cc = message.Cc.join(',');
      }
      if (message.Bcc instanceof Array) {
        message.Bcc = message.Bcc.join(',');
      }
      var req = request('POST', '/email');
      catchResponse(req, callback);
      req.end(JSON.stringify(message), 'utf8');
    },

    deliverystats: function(callback) {
      get('/deliverystats', callback);
    },

    bounces: function(count, offset, filter, callback) {
      var path = '/bounces?count=' + count + '&offset=' + offset;
      filter = filter || {};
      path += '&' + querystring.stringify(options.filter);
      get(path, callback);
    },

    bounce: function(bounceID, callback) {
      get('/bounces/'+bounceID, callback);
    },

    bounceDump: function(bounceID, callback) {
      get('/bounces/'+bounceID+'/dump', callback);
    },

    bounceTags: function(callback) {
      get('/bounces/tags', callback);
    },

    bounceActivate: function(bounceID, callback) {
      // Don't attempt to activate permanently inactive bounces.
      var canActivate = true;
      if (!!bounceID.ID) {
        canActivate = !!bounceID.CanActivate;
        bounceID = bounceID.ID;
      }
      if (canActivate) {
        req = request('PUT', '/bounces/'+bounceID+'/activate');
        catchResponse(req, callback);
        req.end();
      }
    },

  };

};
