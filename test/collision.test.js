import test from "node:test";
import assert from "node:assert/strict";

import { checkCollision } from "../src/systems/collision.js";

test("checkCollision returns true for overlapping rectangles", () => {
  assert.equal(
    checkCollision(
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 50, y: 50, width: 40, height: 40 },
    ),
    true,
  );
});

test("checkCollision returns false for separated rectangles", () => {
  assert.equal(
    checkCollision(
      { x: 0, y: 0, width: 100, height: 100 },
      { x: 101, y: 0, width: 40, height: 40 },
    ),
    false,
  );
});
