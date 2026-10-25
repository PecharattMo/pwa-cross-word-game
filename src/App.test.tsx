/* @vitest-environment jsdom */

import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import App from "./App";

describe("game feedback", () => {
  beforeEach(() => window.localStorage.clear());
  afterEach(() => cleanup());

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
    await waitFor(() => expect(screen.queryByText("ถูกต้อง!")).toBeNull(), {
      timeout: 1_500,
    });
  });
});
