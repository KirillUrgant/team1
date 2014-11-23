var expect = require('chai').expect;


/**
 * @param {Object} functions
 * @param {{socket: socket-io.Socket}} socketObj
 */
module.exports = function websocketImplementationTests(functions, socketObj) {
    describe('server.websocket', function () {
        var socket;

        before(functions.before);
        after(functions.after);
        beforeEach(function (done) {
            functions.beforeEach(function () {
                socket = socketObj.socket;
                done();
            });
        });
        afterEach(functions.afterEach);

        it('bad json', function (done) {
            socket.on('message', function (msg) {
                expect(msg).to.equal('{"error":"Bad JSON"}');
                done();
            });
            socket.send({});
        });

        it('syntax error', function (done) {
            socket.on('message', function (msg) {
                expect(msg).to.equal('{"error":"syntax error"}');
                done();
            });
            socket.send('{}');
        });

        it('unknow method', function (done) {
            socket.on('message', function (msg) {
                expect(msg).to.equal('{"id":0,"error":"unknow method"}');
                done();
            });
            socket.send('{"id": 0}');
        });

        it('weather.get: bad getid', function (done) {
            socket.on('message', function (msg) {
                expect(msg).to.equal('{"id":0,"error":"Invalid region GeoID"}');
                done();
            });
            socket.send('{"id": 0, "method": "weather.get", "params": [-1]}');
        });

        it('weather.get: return data', function (done) {
            socket.on('message', function (msg) {
                var data = JSON.parse(msg);
                expect(data.id).to.equal(0);

                expect(data.result).to.be.an('object');
                expect(data.result).to.have.deep.property('info.geoid').and.equal(54);
                done();
            });
            socket.send('{"id": 0, "method": "weather.get", "params": [54]}');
        });

        it('weather.subscribe: bad geoid', function (done) {
            socket.on('message', function (msg) {
                expect(msg).to.equal('{"id":0,"error":"Invalid region GeoID"}');
                done();
            });
            socket.send('{"id": 0, "method": "weather.subscribe", "params": [-1]}');
        });

        it('weather.subscribe: return ok', function (done) {
            var isSubscribed = false;
            socket.on('message', function (msg) {
                if (!isSubscribed) {
                    expect(msg).to.equal('{"id":0,"result":"ok"}');
                    return (isSubscribed = true);
                }

                var data = JSON.parse(msg);
                expect(data.id).to.equal(null);
                expect(data.method).to.equal('weather.subscribe');

                expect(data.result).to.be.an('object');
                expect(data.result).to.have.deep.property('info.geoid').and.equal(54);
                done();
            });
            socket.send('{"id": 0, "method": "weather.subscribe", "params": [54]}');
        });
    });
};