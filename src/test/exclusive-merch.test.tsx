import { fireEvent, render, screen, cleanup } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { ExclusiveMerch } from "@/components/ExclusiveMerch";

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () { this.setAttribute("open", ""); };
  HTMLDialogElement.prototype.close = function () { this.removeAttribute("open"); };
});
afterEach(cleanup);

describe("Merchandise demo state", () => {
  it("resets selected size and completion when a product is reopened", () => {
    render(<ExclusiveMerch />);
    fireEvent.click(screen.getByRole("button", { name: "View First Light Hoodie" }));
    fireEvent.click(screen.getByRole("button", { name: "XL", exact: true }));
    expect(screen.getByRole("button", { name: "XL", exact: true })).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "Try demo purchase" }));
    expect(screen.getByRole("status")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Back to the show" }));
    fireEvent.click(screen.getByRole("button", { name: "View First Light Hoodie" }));
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "S", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  it("completes a demo order without contacting an order or payment service", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    try {
      render(<ExclusiveMerch />);
      fireEvent.click(screen.getByRole("button", { name: "View Your Star Keychain" }));
      fireEvent.click(screen.getByRole("button", { name: "Try demo purchase" }));
      expect(screen.getByRole("status")).toBeInTheDocument();
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally { fetchSpy.mockRestore(); }
  });
});