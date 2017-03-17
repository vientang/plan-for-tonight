var httpMock = require('node-mocks-http');
var expect = require('chai').expect;
var storeController = require('../server/store_controller.js');

function buildResponse() {
  return httpMock.createResponse({eventEmitter: require('events').EventEmitter})
}

describe("Store controller", function () {
  var req, res

  //create a response object before every test
  beforeEach(function(done) {
    res = buildResponse();
    done()
  })
  
  //basic happy path test using coordinates of Grove's SF office
  it("Correctly returns nearest store name when valid data is provided", function(done) {
    req  = httpMock.createRequest({
      method: 'POST',
      url: '/store',

      body: {
        city: " San Francisco",
        lat: 37.79823040000001,
        lng: -122.4284337,
        state: "CA"
      }
    })

    storeController.findNearestStore(req, res, function(err) {
      var nearestStore = res._getData();
      expect(nearestStore.name).to.equal('San Francisco West');
      done()
    })
  })

  //basic sad path test with incorrect state
  it("Correctly returns error when invalid data is provided", function(done) {
    req  = httpMock.createRequest({
      method: 'POST',
      url: '/store',

      body: {
        city: " San Francisco",
        lat: 37.79823040000001,
        lng: -122.4284337,
        state: "United States"
      }
    })

    storeController.findNearestStore(req, res, function(err) {
      var nearestStore = res._getData();
      expect(nearestStore.name).to.equal(undefined);
      done()
    })
  })
})