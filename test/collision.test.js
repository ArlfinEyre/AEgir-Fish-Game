import test from "node:test";
import assert from "node:assert/strict";

import { checkCollision } from "../src/systems/collision.js";

test("checkCollision returns true for overlapping rectangles", () => {
  assert.equal(
    checkCollision(
      { logicalX: 100, logicalY: 100, width: 100, height: 100 },
      { logicalX: 130, logicalY: 130, width: 40, height: 40 },
    ),
    true,
  );
});

test("checkCollision returns false for separated rectangles", () => {
  assert.equal(
    checkCollision(
      { logicalX: 100, logicalY: 100, width: 100, height: 100 },
      { logicalX: 200, logicalY: 100, width: 40, height: 40 },
    ),
    false,
  );
});
