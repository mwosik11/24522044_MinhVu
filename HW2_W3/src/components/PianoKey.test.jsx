
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import PianoKey from "./PianoKey.jsx";

describe("PianoKey", () => {
  it("should render the piano note", () => {
    render(
      <PianoKey
        midi={60}
        note="C4"
        isBlack={false}
        isActive={false}
        onNoteOn={vi.fn()}
        onNoteOff={vi.fn()}
      />
    );

    expect(screen.getByRole("button", { name: "C4 piano key" }))
      .toBeInTheDocument();
  });

  it("should call onNoteOn when pointer is pressed", () => {
    const onNoteOn = vi.fn();

    render(
      <PianoKey
        midi={60}
        note="C4"
        isBlack={false}
        isActive={false}
        onNoteOn={onNoteOn}
        onNoteOff={vi.fn()}
      />
    );

    fireEvent.pointerDown(screen.getByRole("button"));

    expect(onNoteOn).toHaveBeenCalledWith(60);
  });

  it("should call onNoteOff when pointer is released", () => {
    const onNoteOff = vi.fn();

    render(
      <PianoKey
        midi={60}
        note="C4"
        isBlack={false}
        isActive={false}
        onNoteOn={vi.fn()}
        onNoteOff={onNoteOff}
      />
    );

    fireEvent.pointerUp(screen.getByRole("button"));

    expect(onNoteOff).toHaveBeenCalledWith(60);
  });

  it("should apply active styling when the key is pressed", () => {
    render(
      <PianoKey
        midi={60}
        note="C4"
        isBlack={false}
        isActive={true}
        onNoteOn={vi.fn()}
        onNoteOff={vi.fn()}
      />
    );

    expect(screen.getByRole("button")).toHaveClass("active");
  });
});
