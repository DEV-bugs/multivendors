# Security Spec: MarketSaaS Firestore Rule Validation

This specification establishes security boundaries for high-stakes transactions (onboarding, sales ledger updates, stock management, and admin oversight).

## 1. Data Invariants
1. **Product Integrity**: A product must belong to an active, validated vendor. Only the owner of the `vendorId` or an Admin can alter products. Product stock must be a non-negative integer.
2. **Onboarding Isolation**: A vendor application can only be created by the prospective seller (`ownerEmail` must match verified email if logged in). Only Admin portals can update `status` (Approve/Reject).
3. **Receipt Immutability**: Once an order is generated, its primary financial attributes (`totalAmount`, `commission`, `vendorId`, `date`) are strictly immutable. Its status can only change from `Pending` -> `Shipped` -> `Delivered` or `Cancelled` by authorized participants.
4. **Platform Commission Splitting**: Platform commission must always equal exactly 10% of the total checkout value.

---

## 2. The "Dirty Dozen" Threat Payloads
These payloads represent malicious injection vectors that the security rules must reject:

1. **Spoofed Vendor Product Registration (ID Spoofing)**: A user logs in as `attacker_uid` and tries to post or edit a product with `vendorId: "v1"` (belonging to Apex Labs) to redirect customers' money or hijack metadata.
2. **Self-Approve Onboarding Application (Privilege Escalation)**: A prospective vendor writes directly to `/applications/app123` setting `status: "Approved"` without administrator oversight.
3. **Exaggerated Reviews (State Shortcutting)**: A customer attempts to update a product record setting `rating: 99.9` (violating the boundary `rating <= 5.0`).
4. **Infinite Stock Allocation (Value Poisoning)**: An external entity sets a product's stock count to `-100` or a very large non-numerical string to crash the store ledger.
5. **Direct Ledger Modification (Identity Spoofing)**: A non-owner user attempts to hijack the Vendor's revenue by overwriting or resetting `/vendors/v1` `revenue: 999999`.
6. **Fake Commision Captures**: A customer checks out and sets `commission: 0` to bypass platform escrow commission.
7. **Bypass KYC Review (Resource Poisoning)**: A user creates a vendor application with a massive 15MB document string instead of a valid attachment URL.
8. **Malicious Order Hijacking**: Attacker tries to modify customer order items in `/orders/ORD-X` to steal products or change destinations.
9. **Order Deletion/Coverup**: A merchant attempts to delete an order record inside `/orders/` to cover up poor ratings or hide platform fee commissions.
10. **Junk Characters as ID (ID Poisoning)**: Probing the API by submitting a product update request with `productId` as a 10KB string filled with emoji characters to trigger stack overflows.
11. **Negative Price Exploit**: Writing a product with a negative price (`price: -50`) to exploit the checkout math.
12. **Unverified Account System Access**: Attempting to write an onboarding application with an unverified email structure.

---

## 3. Test Runner Specification (firestore.rules.test.ts)
Verification suite which will assert `PERMISSION_DENIED` on all malicious threat vectors:

```typescript
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment,
} from "@firebase/rules-unit-testing";

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "scenic-antler-4mln4",
    firestore: {
      rules: require("fs").readFileSync("firestore.rules", "utf8"),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe("MarketSaaS Zero-Trust Rules Audit", () => {
  test("Assert fails: Spoofed Product Registration (attacker writing into v1)", async () => {
    const context = testEnv.authenticatedContext("attacker_john", { email_verified: true });
    const db = context.firestore();
    await assertFails(
      db.doc("products/p_test").set({
        id: "p_test",
        name: "Malicious Core Charger",
        price: 99,
        sku: "MAL-CHARG",
        stock: 10,
        category: "Wearables & Electronics",
        vendorId: "v1" // Attempt to hijack v1
      })
    );
  });

  test("Assert fails: Self Onboarding Approval bypassing escrow administrators", async () => {
    const context = testEnv.authenticatedContext("applicant_sam", { email_verified: true });
    await assertFails(
      context.firestore().doc("applications/app_sam").set({
        id: "app_sam",
        vendorName: "Sam LLC",
        ownerEmail: "sam@sam.com",
        category: "Athletics",
        appliedDate: "2026-06-01",
        status: "Approved" // Unauthorized status change
      })
    );
  });
});
```
