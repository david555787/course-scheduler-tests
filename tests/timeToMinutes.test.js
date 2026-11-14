import { test } from "node:test";
import assert from "node:assert/strict";
import { timeToMinutes } from "../logic.js";

test("timeToMinutes returns zero at midnight", () => {
  assert.equal(timeToMinutes("00:00"), 0);
});

test("timeToMinutes includes both the hour and minute portions", () => {
  assert.equal(timeToMinutes("12:34"), 754);
});

test("timeToMinutes converts the final minute of the day", () => {
  assert.equal(timeToMinutes("23:59"), 1439);
});
