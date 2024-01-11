# HomeHub Proof of Concept

Overview
========

This is a simple proof of concept for a REST API to control home appliances. It uses a simple
web server using express for typescript. Undo functionality is implemented. All data exchanged with the API is in json format. The API is exposed as

Returns a list of devices and their current state
* GET / 

Changes a device state
* PATCH / 
* Payload {id: string, state: boolean}

Undo previous state changes
* GET /undo

Currently supported devices are 
* garage_door
* dish_washer
* lights


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
`{"dish_washer":{"state":false},"garage_door":{"state":false},"lights":{"state":false}}`

Turn the Garage Door on
`curl --header "Content-Type: application/json" --request PATCH --data '{"id": "garage_door", "state": true}' http://localhost:8080/`
Expected result:
`{"message":"Device garage_door has changed state to ON"}`

Undo the Garage Door change
`curl http://localhost:8080/undo`
Expected Result:
`{"message":"Device garage_door has changed state to OFF"}`
