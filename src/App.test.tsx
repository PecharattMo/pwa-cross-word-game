/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

describe("game feedback", () => {
  const speak = vi.fn();
  const cancel = vi.fn();

  beforeEach(() => {
    window.localStorage.clear();
    speak.mockClear();
    cancel.mockClear();
    vi.stubGlobal(
      "SpeechSynthesisUtterance",
      class MockSpeechSynthesisUtterance {
        text: string;
        lang = "";
        rate = 1;
        pitch = 1;
        voice: SpeechSynthesisVoice | null = null;

        constructor(text: string) {
          this.text = text;
        }
      },
    );
    vi.stubGlobal("speechSynthesis", {
      cancel,
      getVoices: () => [],
      speak,
    });
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("clears the success message after advancing to the next word", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.type(screen.getByLabelText("ชื่อผู้เล่น"), "Mook");
    await user.click(screen.getByRole("button", { name: "เริ่มการเดินทาง" }));
    await user.click(screen.getByRole("button", { name: /Food/ }));
    await user.click(screen.getByRole("button", { name: /Easy/ }));

    for (const letter of ["M", "E", "N", "U"]) {
      await user.click(screen.getByRole("button", { name: new RegExp(`^${letter}$`) }));
    }
    await user.click(screen.getByRole("button", { name: "ตรวจคำ" }));

    expect(screen.getByText("ถูกต้อง!")).not.toBeNull();
    expect(screen.getByText(/คำที่ 2 จาก 6/)).not.toBeNull();
    expect(cancel).toHaveBeenCalledTimes(1);
    expect(speak).toHaveBeenCalledTimes(1);
    expect(speak.mock.calls[0][0].text).toBe("menu");
    await waitFor(() => expect(screen.queryByText("ถูกต้อง!")).toBeNull(), {
      timeout: 1_500,
    });

    await user.click(screen.getByRole("button", { name: /คะแนนรวม/ }));
    await user.click(
      screen.getByRole("button", { name: "ดูคำศัพท์ที่ได้คะแนนในหมวด Food" }),
    );
    await user.click(
      screen.getByRole("button", { name: "ฟังการออกเสียงคำว่า menu" }),
    );

    expect(cancel).toHaveBeenCalledTimes(2);
    expect(speak).toHaveBeenCalledTimes(2);
    expect(speak.mock.calls[1][0].text).toBe("menu");
  });
});
