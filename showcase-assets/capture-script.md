# Medication Inventory showcase capture script

## Capture contract

- Route: `http://localhost:5173/`
- Viewport: `1440x900`
- Browser: managed Chromium, clean profile
- Opening state: empty inventory
- Capture date: use the browser's current local date as `today`
- Date fixtures: expiring medication uses `today + 20 days`; expired medication uses `today - 30 days`
- Recording target: one short product demo, approximately 30–45 seconds before editing
- Font readiness: before recording interactions, await `document.fonts.ready`, load/check the Inter and Manrope weights used by the UI, and do not treat `networkidle` or a fixed delay as sufficient
- Final editorial direction: direct cuts, with one short subtle transition only at the approved context change; no opening fade, fadeout, zoom, captions, music, narration, screenshots, or internal URLs

## Demo data

Create these four medications through the real Add medication flow:

1. **Paracetamol 500mg**
   - Batch: `DEMO-HEALTHY`
   - Manufacturer: `Medication Inventory Labs`
   - Stock: `24`
   - Minimum stock: `5`
   - Expiration: `today + 120 days`
   - Expected status: `healthy`

2. **Ibuprofen 400mg**
   - Batch: `DEMO-LOW-01`
   - Manufacturer: `Medication Inventory Labs`
   - Stock: `2`
   - Minimum stock: `5`
   - Expiration: `today + 120 days`
   - Expected status: `low stock`

3. **Vitamin C 1g**
   - Batch: `DEMO-EXPIRING`
   - Manufacturer: `Medication Inventory Labs`
   - Stock: `18`
   - Minimum stock: `5`
   - Expiration: `today + 20 days`
   - Expected status: `expiring soon`

4. **Aspirin 100mg**
   - Batch: `DEMO-EXPIRED`
   - Manufacturer: `Medication Inventory Labs`
   - Stock: `12`
   - Minimum stock: `5`
   - Expiration: `today - 30 days`
   - Expected status: `expired`

Before recording the next take, verify the rendered status labels. If any label differs from the expected status, stop the capture, correct the classification rule and its tests, rerun lint/tests/build, then restart from an empty inventory.

## Flow

### Take 1 — Dashboard overview

1. Open the app with an empty inventory.
2. Add all four demo medications through the real form.
3. Pause on the dashboard long enough to show:
   - Total medications: `4`
   - Healthy: `1`
   - Low stock: `1`
   - Expiring 30d: `1`
   - Expired: `1`

### Take 2 — Inventory states

1. Show the full inventory table.
2. Keep all four rows visible.
3. Let the viewer read the different status badges, batches, stock values, minimum stock values, and expiration dates.

### Take 3 — Search and filtered workflow

1. Search for `Ibuprofen`.
2. Show the filtered row and its `low stock` status.
3. Keep the filter active for all subsequent operations.

### Take 4 — Refill flow

1. Open Add stock for `Ibuprofen 400mg` and hold the modal for reading.
2. Add `8` units.
3. Hold the updated quantity on screen, changing from `2` to `10`.
4. Show its status changing from `low stock` to `healthy`.
5. Show the dashboard metrics updating from `Low stock: 1` to `Low stock: 0` and `Healthy: 2`.

### Take 5 — Stock withdrawal

1. Open Remove stock for `Ibuprofen 400mg` and hold the modal for reading.
2. Remove `3` units and hold the new quantity of `7` on screen.
3. Confirm that the stock remains non-negative and the medication remains valid.

### Take 6 — Edit flow

1. Edit the filtered `Ibuprofen 400mg`.
2. Change the manufacturer to `Medication Inventory Health Labs`.
3. Save and show the updated manufacturer in the table.

### Take 7 — Filtered deletion and final state

1. Delete the filtered `Ibuprofen 400mg`.
2. Show the internal confirmation modal and confirm deletion.
3. Show the filtered result disappearing and the metrics updating to `Total medications: 3`.
4. Clear the search and show the final inventory.

## Timing guidance

- Initial load: `700 ms`
- Modal open/close: `500 ms`
- After save or stock movement: `400 ms`
- Between takes: `800 ms`
- Stock movement modal open: `850 ms`
- Stock movement result: `1,600 ms`
- Preserve the complete interaction and its result reveal in every take.
- If a status is incorrect, do not continue recording; fix the implementation and tests first.
