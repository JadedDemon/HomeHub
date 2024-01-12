# HomeHub Proof of Concept

Overview
========

This is a simple proof of concept for a REST API to control home appliances. It uses a simple web server using
express for typescript. Undo functionality is implemented and will return the last state change that it will undo.
All data exchanged with the API is in json format. The API is exposed as

Returns a list of devices and their current state
* GET / 

Changes a device state
* PATCH /:device_id 
* Payload {state: boolean}

Undo previous state changes
* POST /undo

Currently supported devices are 
* id = 1 name = Dish Washer
* id = 2 name = Garage Door
* id = 3 name = Living Room Lights


Assumptions
===========

There is basic error checking but nothing too strong, especially regarding the http protocol and
security. State is kept as a boolean as all devices only implement On/Off. True is consider On. 
Device state changes are written to the console. This and other error information is passed back 
to the client HTTP request in JSON format. The logic for devices not changing to the same state is
kept in the wrong place for simplicity. The device would typically decide and report back what it does.
All data exchanged is in json because this is not intended to be read by humans and computers like json.

Usage
=====

To run the application simple from the root directory
`npm run start`

To test here are some curl examples

List all devices on the HomeHub
`curl http://localhost:8080/`
Expected result:
`[{"id":"1","name":"Dish Washer","state":false},{"id":"2","name":"Garage Door","state":false},{"id":"3","name":"Living Room Lights","state":false}]`

Turn the Garage Door on
`curl --header "Content-Type: application/json" --request PATCH --data '{"state": true}' http://localhost:8080/2`
Expected result:
`{"name":"Garage Door","state":true}`

Undo the Garage Door change
`curl --request POST http://localhost:8080/undo`
Expected Result:
`{"name":"Garage Door","state":true}`
