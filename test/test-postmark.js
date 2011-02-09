var nodeunit = require('nodeunit');
var config = require('./config.js');

exports['invalid api key'] = function (test) {
  test.expect(2);
  var postmark = require('../lib/postmark')('POSTMARK_API_TEST_INVALID');
  postmark.send({}, function (err, res) {
    test.equal(err, 401);
    test.strictEqual(res.ErrorCode, 0);
    test.done();
  });
};

exports['valid api key'] = function (test) {
  test.expect(2);
  var postmark = require('../lib/postmark')('POSTMARK_API_TEST');
  postmark.send({}, function (err, res) {
    test.equal(err, 422);
    test.notStrictEqual(res.ErrorCode, 0);
    test.done();
  });
}

exports['send'] = nodeunit.testCase({
  setUp: function (callback) {
    this.postmark = require('../lib/postmark')('POSTMARK_API_TEST');
    this.message = { From: 'q@w.e', Subject: 'S', TextBody: 'TB', To: 'q@w.e' };
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  'valid message': function (test) {
    test.expect(2);
    this.postmark.send(this.message, function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res.ErrorCode, 0);
      test.done();
    });
  },
  // Incompatible content should be stripped, response should be identical to a valid message.
  'incompatible message': function (test) {
    test.expect(2);
    this.message.unknown = 1;
    this.postmark.send(this.message, function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res.ErrorCode, 0);
      test.done();
    });
  },
  'invalid email request': function (test) {
    test.expect(2);
    delete this.message.To;
    this.postmark.send(this.message, function (err, res) {
      test.equal(err, 422);
      test.equal(res.ErrorCode, 300);
      test.done();
    });
  },
  'multiple recipients array': function (test) {
    test.expect(3);
    this.message.To = [ 'q@w.e', 'a@s.d' ];
    this.postmark.send(this.message, function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res.ErrorCode, 0);
      test.equal(res.To, 'q@w.e,a@s.d');
      test.done();
    });
  },
});

exports['send default message'] = nodeunit.testCase({
  setUp: function (callback) {
    this.postmark = require('../lib/postmark')('POSTMARK_API_TEST', { message: { From: 'q@w.e', Subject: 'S', TextBody: 'TB', To: 'q@w.e' } });
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  'without changes': function (test) {
    test.expect(2);
    this.postmark.send({}, function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res.ErrorCode, 0);
      test.done();
    });
  },
  'with changes': function (test) {
    test.expect(3);
    this.postmark.send({ To: 'a@s.d' }, function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res.ErrorCode, 0);
      test.equal(res.To, 'a@s.d');
      test.done();
    });
  },
});

exports['bounces retrieval api'] = nodeunit.testCase({
  setUp: function (callback) {
    this.postmark = require('../lib/postmark')(config.apiKey);
    callback();
  },
  tearDown: function (callback) {
    callback();
  },
  'deliverystats': function (test) {
    test.expect(2);
    this.postmark.deliverystats(function (err, res) {
      test.equal(err, 0);
      test.notStrictEqual(res.InactiveMails, undefined);
      test.done();
    });
  },
  'bounces - unfiltered': function (test) {
    test.expect(2);
    this.postmark.bounces(25, 0, null, function (err, res) {
      test.equal(err, 0);
      test.notStrictEqual(res.TotalCount, undefined);
      test.done();
    });
  },
  'bounces - filtered': function (test) {
    test.expect(2);
    this.postmark.bounces(25, 0, {emailFilter:'string not contained in any addresses'}, function (err, res) {
      test.equal(err, 0);
      test.equal(res.TotalCount, 0);
      test.done();
    });
  },
  'bounce': function (test) {
    test.expect(2);
    this.postmark.bounce('1', function (err, res) {
      test.equal(err, 422);
      test.equal(res.ErrorCode, 407);
      test.done();
    });
  },
  'bounceDump': function (test) {
    test.expect(2);
    this.postmark.bounceDump('1', function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res.Body, '');
      test.done();
    });
  },
  'bounceTags': function (test) {
    test.expect(2);
    this.postmark.bounceTags(function (err, res) {
      test.equal(err, 0);
      test.strictEqual(res instanceof Array, true);
      test.done();
    });
  },
  'bounceActivate': function (test) {
    test.expect(2);
    this.postmark.bounceActivate(1, function (err, res) {
      test.equal(err, 422);
      test.equal(res.ErrorCode, 407);
      test.done();
    });
  },
//  '': function (test) { test.done() },
});
