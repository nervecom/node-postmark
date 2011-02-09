# Postmark

Complete [Postmark](http://www.postmarkapp.com) API. Send mail, manage bounces.

<pre>
var postmark = require('postmark-api')("your api key");

postmark.send({
  "From": "registered.and.confirmed@postmark",
  "To": "you@host",
  "Subject": "subject",
  "TextBody": "message"
}, function (err, res) {
  require('util').log(err + " " + JSON.stringify(res));
});
</pre>

## Installation

    npm install postmark-api

## Tests

Set your postmark-api-key in `test/config.js` or the bounce-tests will fail, then run:

    nodeunit test/test-postmark.js

## API

### require('node-postmark')(apiKey, [options])

* `apiKey` API-key provided by Postmark
* `options` Options object used as default values for postmark.send()
  * `ssl` Use SSL, defaults to false
  * `message` [Postmark Message Format](http://developer.postmarkapp.com/developer-build.html#message-format)


### postmark.send(message, [callback])

Sends email.
`TODO:` Attachments

* `message` [Postmark Message Format](http://developer.postmarkapp.com/developer-build.html#message-format)
* `callback`


### postmark.deliverystats([callback])

Returns a summary of inactive emails and bounces by type.

* `callback`


### postmark.bounces(count, offset, filter, [callback])

List of bounces, optionally filtered

* `count` number of bounces to fetch at once
* `offset` number of bounces to skip
* `filter` [Filters to apply](http://developer.postmarkapp.com/developer-bounces.html#get-bounces)
* `callback`


### postmark.bounce(bounceID, [callback])

Get details about a single bounce.

* `bounceID` a bounce's ID
* `callback`


### postmark.bounceDump(bounceID, [callback])

Get raw bounce, as Postmark received it.

* `bounceID` a bounce's ID
* `callback`


### postmark.bounceTags([callback])

List of tags used

* `callback`

### postmark.bounceActivate(bounceID, [callback])

Reactivate the recipient associated with a bounce.

* `bounceID` a bounce's ID
* `callback`
