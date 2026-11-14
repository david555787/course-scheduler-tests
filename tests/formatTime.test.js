import { test } from "node:test";
import assert from "node:assert/strict";
import { formatTime } from "../logic.js";

test("formatTime displays midnight using 12-hour AM convention", () => {
  assert.equal(formatTime("00:00"), "12:00 AM");
});

test("formatTime displays a morning time without a leading zero", () => {
  assert.equal(formatTime("09:05"), "9:05 AM");
});

test("formatTime displays noon as PM", () => {
  assert.equal(formatTime("12:00"), "12:00 PM");
});

test("formatTime converts a late-evening boundary time to PM", () => {
  assert.equal(formatTime("23:59"), "11:59 PM");
});
