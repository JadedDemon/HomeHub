const express = require("express");
const app = express();
const port = 8080;

import type { Device, Devices, DeviceEvent } from "./interfaces";

// Statically set in memory, this would be read from a database or the device itself would register with the API
const devices: Devices = {
  1: {
    name: "Dish Washer",
    state: false,
  },
  2: {
    name: "Garage Door",
    state: false,
  },
  3: {
    name: "Living Room Lights",
    state: false,
  },
};

const deviceEvents: DeviceEvent[] = [];

/**
 * Finds the last event that references to a valid device, and returns it.
 * If an event is returned, it is guaranteed to be valid.
 *
 * @returns The last event, or null if there are no valid events
 */
const findLastValidAction = (): DeviceEvent | null => {
  if (!deviceEvents.length) {
    // There are no events to undo
    return null;
  }

  while (deviceEvents.length) {
    // Keep iterating over events until we found an event which references a real device
    const event = deviceEvents.pop();

    if (!event) {
      // There are no more events to potentially undo, so stop looking
      break;
    }

    if (devices[event.id]) {
      // Found the correct event, return it
      return event;
    }

    // There was an event but it didn't reference an existing device - keep looking
  }

  return null;
};

/**
 * Undoes the last action that changed the state of a device, if a valid action exists.
 * This only undoes state changes, not changes to any other field of a device.
 *
 * @returns The last device whose status has been reverted, or null if none was reverted
 */
const undoLastAction = (): Device | null => {
  const lastEvent = findLastValidAction();

  if (!lastEvent) {
    // There is no last event to undo
    return;
  }

  // Find the last event's device and revert its state
  const device = devices[lastEvent.id];
  devices[lastEvent.id] = { ...device, state: !lastEvent.state };

  return device;
};

app.use(express.json());

app.get("/", (_req, res) => {
  const deviceList = Object.keys(devices).map((id) => ({ id, ...devices[id] }));
  res.send(deviceList);
});

/**
 * Validates the body of a device update request.
 *
 * @param body The fields of a {@link Device} to update
 * @returns A tuple containing if the body is valid, and a dictionary of any field errors
 */
const validateBody = (
  body: Partial<Device>,
): [boolean, Partial<Record<keyof Device, string>>] => {
  const errors: Partial<Record<keyof Device, string>> = {};

  if (typeof body.name === "string" && !body.name.length) {
    // Check that if a name is supplied, that it is not empty
    errors.name = "Name cannot be empty";
  }

  if (body.name && typeof body.name !== "string") {
    // Check that name is a string
    errors.name = "Name must be a string";
  }

  if (body.state && typeof body.state !== "boolean") {
    // Check that state is a boolean
    errors.state = "State must be a boolean";
  }

  const isValid = Object.keys(errors).length === 0;

  return [isValid, errors];
};

app.patch("/:id", (req, res) => {
  const { params, body } = req;
  const { id } = params;

  if (!id) {
    // ID must be provided to retrieve the device
    res.status(400).send({ message: "Device ID is missing" });
  }

  if (!devices[id]) {
    // No device with a matching ID exists
    res.status(404).send({ message: "Device not found" });
  }

  // Check that the request body is valid
  const [isValidBody, errors] = validateBody(body);

  if (!isValidBody) {
    res.status(400).send({ errors });
  }

  // Retrieve the device
  const device = devices[id];
  // Check if the state has changed, if a new state was provided
  const hasStateChanged =
    typeof body.state === "boolean" && device.state !== body.state;

  if (hasStateChanged) {
    // Save the state change event for later, in case the user undoes it
    deviceEvents.push({ id, state: body.state });
  }

  // Update the device
  devices[id] = { ...device, ...body };

  // Return the updated device
  return res.send(devices[id]);
});

app.post("/undo", (_req, res) => {
  const revertedDevice = undoLastAction();

  if (!revertedDevice) {
    res.status(400).send({ message: "No action to undo" });
  }

  // Send back the state of the device before it was changed
  return res.send(revertedDevice);
});

app.listen(port, () => {
  console.log(`HomeHub is listening on port ${port}`);
});
