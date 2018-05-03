/****
HOLO ORACLE 

An oracle is an agent that finds and verifies real-world occurrences 
and submits this information to be used in a network natively unable to do so
The HOLO ORACLE is a very simple zome to facilitate API calls from HoloApps.

Author : Ludovic Désert (ReversedK)
Date first version : 2018/05/03
version : 1.0.0
 *****/


// receives an APICall, queues it, sends back the hash as receipt
function queueAPICall(APICall) {
    var receipt = commit('APICall', APICall);
    // callQueue is a collection of APICalls
    commit('callQueue', {
        Links: [{
            Base: App.Key.Hash,
            Link: receipt,
            Tag: 'callQueue'
        }]
    })
    debug('********* QUEUED APICall ' + receipt + '*****************')
    return receipt;   // the receipt will be used to retrieve the call result
}

// Poll fn, to be regularly called by the remote agent
function pollMe() {
	var APICallQueue = [];
    var t = 1;
    APICallQueue = doGetLinkLoad(App.Key.Hash, 'callQueue')
    debug('********* POLL RESULT *****************')
    debug(APICallQueue.slice(0, t))
    debug('********* POLL RESULT *****************')
    var calls = APICallQueue.slice(0, t)
    var callqueue_links2delete = [];
    // unlinks them to avoid useless calls    
    for(var j=0;j<calls.length;j++) callqueue_links2delete.push({
            Base: App.Key.Hash,
            Link: calls[j].H,
            Tag: "callQueue",
            LinkAction: HC.LinkAction.Del
        })

    // actually unlink them    
    commit("callQueue", {
        Links: callqueue_links2delete
    });
    // sends the t next APICall(s) in queue to be treated by agent
    return calls
}


// receives the API call result from the agent, stores the result and links it in  "CallResults" with the receipt hash as tag
function receive(callResult) {    
    var hash = commit("callResult", callResult);
    
    commit("callResults", {
        Links: [{
            Base: App.Key.Hash,
            Link: hash,
            Tag: callResult.hash
        }]
    });
    debug('******************** RESULT STORED ON ' + callResult.hash + "***************************")
    return true;
}

// retrieves the API call result for the given receipt, returns the result and deletes it
function getResult(receipt) {
	 var r = doGetLinkLoad(App.Key.Hash, receipt)
    debug('-----------------GET RESULT FOR' + receipt + '--------------------')   
    debug(r);
    debug('--------------------------------------------------')
    if (!r.length) return false;
    // efface le link		
    commit("callResults", {
        Links: [{
            Base: App.Key.Hash,
            Link: r[0].H,
            Tag: receipt,
            LinkAction: HC.LinkAction.Del
        }]
    });
    // efface le resultat
    remove(receipt, "removed receipt "+receipt);
    return JSON.stringify(r);
}


/****
HELPER FUNCTIONS, shamelessly stolen from "clutter" *****/

// helper function to do getLinks call, handle the no-link error case, and copy the returned entry values into a nicer array
function doGetLinkLoad(base, tag) {
    // get the tag from the base in the DHT
    var links = getLinks(base, tag, { Load: true });
    var links_filled = [];
    for (var i = 0; i < links.length; i++) {
        var link = { H: links[i].Hash };
        link[tag] = links[i].Entry;
        links_filled.push(link);
    }
    return links_filled;
}

// helper function to call getLinks, handle the no links entry error, and build a simpler links array.
function doGetLink(base, tag) {
    // get the tag from the base in the DHT
    var links = getLinks(base, tag, { Load: false });
    // debug("Links:"+JSON.stringify(links));
    var links_filled = [];
    for (var i = 0; i < links.length; i++) {
        links_filled.push(links[i].Hash);
    }
    return links_filled;
}


/****
HOLOCHAIN FUNCTIONS *****/


function genesis() {
    return true
}

function validateCommit() {
    return true
}

function validatePut() {
    return true
}

function validateLink() {
    return true
}

function validateDel() {
    return true
}

function validateLinkPkg() {
    return null
}