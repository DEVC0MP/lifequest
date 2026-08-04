import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PwaStatus } from "../../src/components/PwaStatus";

const pwa = vi.hoisted(() => ({
  offlineReady: false,
  needRefresh: false,
  setOfflineReady: vi.fn(),
  setNeedRefresh: vi.fn(),
  updateServiceWorker: vi.fn(),
}));

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: () => ({
    offlineReady: [pwa.offlineReady, pwa.setOfflineReady],
    needRefresh: [pwa.needRefresh, pwa.setNeedRefresh],
    updateServiceWorker: pwa.updateServiceWorker,
  }),
}));

function setOnline(value: boolean) {
  Object.defineProperty(navigator, "onLine", { configurable: true, value });
}

describe("PwaStatus", () => {
  beforeEach(() => {
    pwa.offlineReady = false;
    pwa.needRefresh = false;
    pwa.setOfflineReady.mockClear();
    pwa.setNeedRefresh.mockClear();
    pwa.updateServiceWorker.mockClear();
    setOnline(true);
  });

  it("stays hidden during normal online work", () => {
    render(<PwaStatus hasStorageFailure={false} onOpenData={vi.fn()} />);
    expect(screen.queryByRole("complementary")).not.toBeInTheDocument();
  });

  it("explains that local changes remain available after going offline", () => {
    render(<PwaStatus hasStorageFailure={false} onOpenData={vi.fn()} />);
    setOnline(false);
    fireEvent(window, new Event("offline"));
    expect(screen.getByText("Pracujesz offline")).toBeVisible();
    expect(screen.getByText(/zapisują się lokalnie/)).toBeVisible();
  });

  it("blocks an update and links to data recovery when local saving has failed", () => {
    pwa.needRefresh = true;
    const onOpenData = vi.fn();
    render(<PwaStatus hasStorageFailure onOpenData={onOpenData} />);

    expect(screen.getByRole("button", { name: "Zaktualizuj" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Przejdź do danych" }));
    expect(onOpenData).toHaveBeenCalledOnce();
  });
});
