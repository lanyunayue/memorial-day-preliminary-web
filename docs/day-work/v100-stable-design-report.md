# Shike v1.0.0 Stable Design Report

## Decision

This release is a promotion gate, not an architecture or feature release. The single-file application remains intact so the stable release does not combine version promotion with structural risk.

## Compatibility

- No record fields changed.
- No localStorage keys changed.
- No parser behavior changed.
- No import/export format changed.
- No CSS layout or theme behavior changed.
- Existing release surfaces and language dictionaries remain in place.

## Test Infrastructure Adjustment

Historical feature tests previously hard-coded the current RC version and cache. Their feature assertions remain intact; only the expected active release baseline was updated. The Edge CDP runner now reads the declared version from `index.html`, allowing later version gates to test runtime identity without weakening product assertions.
