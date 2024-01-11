const express = require("express");
const app = express();
const port = 8080;

import { Device, Devices, DeviceEvent } from "./interfaces";

let devices: Devices = {
  "dish_washer": {
    state: false
  },
  "garage_door": {
    state: false
  },
  "lights": {
    state: false 
  }
};

let deviceEvents: DeviceEvent[] = [] 

app.use(express.json());

app.get("/", (req, res) => {
  let json = JSON.stringify(devices);
  res.send(json);
});

app.patch("/", (req, res) => {
  //console.log(req.body.id);
  if (!req.body.id) {
    res.status(400).send({message:"Device ID is missing"});
  } else if (!req.body.state) {
    res.status(400).send({message:"State boolean is missing"});
  } else if (!devices[req.body.id]) {
    res.status(400).send({message:"The requests Device is not found"});
  } else // is there a state change?
  if (devices[req.body.id].state == req.body.state) {
    // Same state, we'll ignore
    res.send({message:"This request does not change Device state"});
  } else {
    deviceEvents.push({id: req.body.id, state: req.body.state});
    res.send({message: dispatchEvent(req.body.id, req.body.state)});
  } 
});

app.get("/undo", (req, res) => {
  if (deviceEvents.length <= 0) {
    res.send({message: "No more events to undo"})
  } else {
    let event = deviceEvents.pop();
    res.send({message: dispatchEvent(event.id, !event.state)});
  }
});

app.listen(port, () => {
  console.log(`HomeHub is listening on port ${port}`);
});

function dispatchEvent(id: string, state: boolean) {
  // This code would be more robust if devices needed more individual code
  devices[id].state = state;
  let msg = "Device " + id + " has changed state to " + (state ? "ON" : "OFF");
  // This console log is the event action
  console.log(msg);
  return msg
}