
function DrumPad({ pad, isPressed = false, onTrigger }) {
  const handleClick = () => {
    onTrigger?.(pad);
  };

  return (
    <button
      type="button"
      className={`drum-pad ${isPressed ? "drum-pad--pressed" : ""}`}
      onClick={handleClick}
      aria-label={`${pad.label} drum pad, keyboard shortcut ${pad.key}`}
      aria-pressed={isPressed}
      data-pad-id={pad.id}
    >
      <span className="drum-pad__key">{pad.key}</span>

      <span className="drum-pad__label">
        {pad.label}
      </span>
    </button>
  );
}

export default DrumPad;
