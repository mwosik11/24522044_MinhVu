# AI Failure Audit – HW1: React 19 Production Studio Drum Machine

## 1. Introduction

This document records the AI-generated implementation issue identified during the development and testing of HW1.

The purpose of this audit is to evaluate the correctness of AI-generated code, identify implementation problems, document their root causes, and describe the corrective actions taken.

Only issues that were actually identified and verified are documented as confirmed bugs.

## 2. Verified AI-Generated Bug

### Bug 1: Incorrect Audio Meter Measurement and Display Unit

**Affected files:**

- `src/App.jsx`
- `src/audio/drumAudioEngine.js`

**Description:**

The initial implementation of the Visual Audio Meter displayed audio activity as a percentage (`%`) instead of using a decibel measurement.

Although the meter responded to audio playback, the displayed percentage did not represent an actual decibel measurement.

**Root Cause:**

The initial implementation used the Web Audio API method `getByteFrequencyData()` to retrieve frequency-domain data.

It then calculated the average frequency magnitude and converted that value into a percentage.

This approach measured relative frequency activity rather than the audio signal level in decibels.

**Detection Method:**

The issue was identified through:

- Reviewing the Audio Meter implementation.
- Comparing the implementation with the Visual Decibel Meter requirement.
- Inspecting the calculation method and displayed measurement unit.

**Corrective Action:**

The measurement implementation was revised to use time-domain audio data.

The following changes were made:

1. Replaced `getByteFrequencyData()` with `getFloatTimeDomainData()`.
2. Calculated the Root Mean Square (RMS) of the audio samples.
3. Converted the RMS value into decibels relative to Full Scale (dBFS).
4. Updated the interface to display dBFS instead of percentage.
5. Changed the meter scale to represent the range from -60 dBFS to 0 dBFS.

The measurement formula is:

\[
RMS = \sqrt{\frac{1}{N}\sum\_{i=1}^{N}x_i^2}
\]

\[
dBFS = 20\log\_{10}(RMS)
\]

The resulting value is constrained to the displayed range of -60 dBFS to 0 dBFS.

**Verification:**

The corrected implementation was tested by triggering all seven drum pads.

The following behaviors were checked:

- The Audio Meter responds when a drum sound is played.
- The displayed measurement uses dBFS.
- The meter decreases after audio playback ends.
- The meter returns toward its minimum displayed level when no sound is playing.

**Result:** The measurement issue was corrected and the updated implementation passed the functional checks performed.

**Status:** Fixed and verified.

**Evidence:** Attach the screenshot of the corrected Audio Meter and its DevTools inspection here.

---

## 3. Additional Testing and Bug Investigation

Additional test scenarios were investigated to determine whether other implementation issues could be reproduced.

| Test scenario                                | Verification result              |
| -------------------------------------------- | -------------------------------- |
| Keyboard release behavior                    | No additional bug reproduced     |
| Audio Meter recovery after repeated playback | No additional bug reproduced     |
| Drum pad interaction                         | Passed functional testing        |
| Hit Log updates                              | Passed functional testing        |
| Responsive layout at 375px                   | Passed horizontal overflow check |
| Accessibility attributes                     | Passed the inspected checks      |

The keyboard release and repeated audio playback scenarios were tested as potential problem areas. However, no additional reproducible bugs were identified.

Therefore, these scenarios are not classified as confirmed AI-generated failures.

---

## 4. Impact Analysis

The identified issue affected the accuracy and interpretation of the Visual Audio Meter.

Although the initial meter provided visual feedback during audio playback, its percentage-based measurement did not satisfy the intended decibel measurement requirement.

After correction, the application uses an RMS-based dBFS measurement, providing a more appropriate representation of the digital audio signal level.

---

## 5. Conclusion

During the development of HW1, one verified AI-generated implementation issue was identified and corrected.

The issue involved an incorrect Audio Meter measurement method and the use of percentage values instead of dBFS.

The implementation was corrected using time-domain audio analysis and RMS-based dBFS conversion.

Additional keyboard and audio playback scenarios were tested, but no further reproducible bugs were identified.

This audit documents the verified issue and its corrective action without reporting unconfirmed problems as actual bugs.

**Final verified AI-generated bugs: 1**

**Final status:** The identified issue has been fixed and verified through functional testing.
