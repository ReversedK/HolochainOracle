# HolochainOracle

An oracle is an agent that retrieves real-world occurrences 
and submits this information to be used in a network natively unable to do so

Holochain Apps are, at the time of  writing, unable to initiate an API call directly.
HolochainOracle is a very simple HoloApp that aims at addressing this problem. 

# How it works 

The project is composed of 2 parts :

* An Holochain Zome 
* A nodeJs Agent

# Installation 

Download or clone the repository to a directory, then :

    cd oracle-nodejs
    npm install
    node . &

and finally:

    cd oracle-holoapp
    hcdev web
# Usage
Calling an API is done in 2 steps :

## Adding a call to the queue

 ***endpoint*** :  http://yourHoloAppIP:4141/fn/oracle/queueAPICall (POST)
***payload example*** :  `{ "uri": API_URI, "payload": { "headers" : { "Content-Type":"application/x-www-form-urlencoded" },  "method":"post",   "data":{"q":"1"}    } }`
***returns*** : receipt Hash  (*the receipt will be used to retrieve the call result*)

## Retrieving the result of a call
 ***endpoint*** :  http://yourHoloAppIP:4141/fn/oracle/getResults (POST)
***payload example*** :  `{ "uri": API_URI, "payload": { "headers" : { "Content-Type":"application/x-www-form-urlencoded" },  "method":"post",   "data":receiptHash  } }`
***returns*** : API Call result

Not fit for production. Minimal tests have been carried, be warned :)
