const request = require('superagent');

let OracleAgent = {
    poll: function() {
        console.log("--------------------- polling " + HOLO_ORACLE_URL + '/pollMe ---------------------')
        request
            .post(HOLO_ORACLE_URL + '/pollMe')
            .end((err, res) => {
                if (err === null) {
                    try {
                        var APICalls = JSON.parse(res.text); // receive the APICall objects
                        for (var i = 0; i < APICalls.length; i++) this.resolveAPICall(APICalls[i]) // actually make the API call asynchronously
                    } catch (e) {
                        //console.log(e);
                    }
                }
                // else console.log(err) ;    
            });
    },

    resolveAPICall: function(APICall) {
        console.log("---------------------resolving API call---------------------------")
        console.log(APICall)

        var callRequest;

        if (APICall.callQueue.payload.method.toLowerCase() == "post") {
            callRequest = request.post(APICall.callQueue.uri).send(APICall.callQueue.payload.data)
                .set('Accept', 'application/json')
        } else {
            callRequest = request.get(APICall.callQueue.uri).query(APICall.callQueue.payload.data)
                .set('Accept', 'application/json');
        }

        // sets the headers 		
        for (var h in APICall.callQueue.payload.headers) {
            callRequest.set(h, APICall.callQueue.payload.headers[h]);
        }

        callRequest.end((err, res) => this.sendToHoloApp(err, res, APICall));
    },

    sendToHoloApp: function(err, res, APICall) {        
            var result = {
                hash: APICall.H,
                result: { text: JSON.parse(res.text) },
                status: res.status,
                error: res.error,
                stamp: Date.now()
            }
            console.log("-------------------------  CALL RESULT " + JSON.stringify(res.text) + "-------------------------");
            // now call the "receive" endpoint of the HoloApp with the result    		
            request.post(HOLO_ORACLE_URL + '/receive').send(result).set('Accept', 'application/json').end((err, res) => {
                console.log("-------------------------  RESULT SENT TO HOLOAPP ----------------------------------");
                // do something here if needed

            });
        },

    run: function() {
        setInterval(() => this.poll(), POLL_EVERY_MS)
    }
}


const HOLO_ORACLE_URL = 'http://localhost:4141/fn/oracle',
    POLL_EVERY_MS = 2000;

OracleAgent.run();