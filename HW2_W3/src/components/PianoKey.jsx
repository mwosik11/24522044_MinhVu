
import React from "react";

const PianoKey = React.memo(function PianoKey({
  midi,
  note,
  isBlack,
  isActive,
  onNoteOn,
  onNoteOff,
}) {
  const handlePointerDown = () => {
    onNoteOn(midi);
  };

  const handlePointerUp = () => {
    onNoteOff(midi);
  };

  const handlePointerLeave = () => {
    if (isActive) {
      onNoteOff(midi);
    }
  };

  return (
    <button
      type="button"
      className={[
        "piano-key",
        isBlack ? "black-key" : "white-key",
        isActive ? "active" : "",
      ].join(" ")}
      data-midi={midi}
      data-note={note}
      aria-label={`${note} piano key`}
      aria-pressed={isActive}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <span className="key-label">{note}</span>
    </button>
  );
});

export default PianoKey;
