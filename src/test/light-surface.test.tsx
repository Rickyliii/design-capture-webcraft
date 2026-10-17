import { render, cleanup } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { useLightSurface } from "@/hooks/use-light-surface";
function Surface({ color }: { color: string }) { useLightSurface(color); return null; }
afterEach(cleanup);
it("replaces personal violet with show rose across exposed page areas and restores on exit", () => {
  const before = document.documentElement.style.getPropertyValue("--concert-light");
  const previousBody = document.body.style.backgroundColor;
  const { rerender, unmount } = render(<Surface color="#8B5CF6" />);
  expect(document.documentElement.style.getPropertyValue("--concert-light")).toBe("#8B5CF6");
  rerender(<Surface color="#F43F8C" />);
  expect(document.documentElement.style.getPropertyValue("--concert-light")).toBe("#F43F8C");
  expect(document.querySelector('meta[name="theme-color"]')?.getAttribute("content")).toBe("#F43F8C");
  expect(document.body.style.backgroundColor).toBe("rgb(244, 63, 140)");
  expect(document.documentElement.style.backgroundColor).toBe("rgb(244, 63, 140)");
  unmount();
  expect(document.documentElement.style.getPropertyValue("--concert-light")).toBe(before);
  expect(document.documentElement.hasAttribute("data-concert-light")).toBe(false);
  expect(document.body.style.backgroundColor).toBe(previousBody);
});