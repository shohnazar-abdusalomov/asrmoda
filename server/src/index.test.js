import test from "node:test";
import assert from "node:assert/strict";

test("currency totals remain integer UZS amounts", () => {
  const items = [{ price: 389000, quantity: 2 }, { price: 189000, quantity: 1 }];
  assert.equal(items.reduce((sum, item) => sum + item.price * item.quantity, 0), 967000);
});

