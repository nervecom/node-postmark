var querystring = require('querystring');

function catchResponse(res, callback) {
  if (typeof callback == "function") {
    var response = '';
    res.setEncoding('utf8');
    res.on('data', function(chunk) { response += chunk; });
    res.on('end', function() {
      var err = (200==res.statusCode) ? 0 : res.statusCode ;
      try {
        response = JSON.parse(response);
      } catch (e) {
        response = {};
      }
      callback(err, response);
    });
  }
}

module.exports = function (apiKey, options) {
  options = options || {};
  var defaults = options.message || {};
  var ssl = !!options.ssl;
  var http = ssl ? require('https') : require('http');
  var req_opt = { // http.request options
    host: 'api.postmarkapp.com',
    port: ssl ? 443 : 80,
    headers: {
      'Host': 'api.postmarkapp.com',
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Postmark-Server-Token': apiKey,
    },
  }

  function get(path, callback) {
    var ro = req_opt;
    ro.path = path;
    http.get(ro, function(res) {
      catchResponse(res, callback);
    });
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
      var ro = req_opt;
      ro.path = '/email';
      ro.method = 'POST';
      http.request(ro, function(res) {
        catchResponse(res, callback);
      }).end(JSON.stringify(message), 'utf8');
    },

    deliverystats: function(callback) {
      get('/deliverystats', callback);
    },

    bounces: function(count, offset, filter, callback) {
      var path = '/bounces?count=' + count + '&offset=' + offset;
      filter = filter || {};
      path += '&' + querystring.stringify(filter);
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
      var ro = req_opt;
      ro.path = '/bounces/'+bounceID+'/activate';
      ro.method = 'PUT';
      http.request(ro, function(res){
        catchResponse(res, callback);
      }).end();
    },

  };

};
