import { fireEvent, render, screen } from "@testing-library/react";
import AddTrip from "./AddTrip";

const originalFetch = global.fetch;
const originalCrypto = global.crypto;

afterEach(() => {
  global.fetch = originalFetch;

  Object.defineProperty(global, "crypto", {
    value: originalCrypto,
    configurable: true,
  });
});

test("renders the AddTrip form", () => {
  global.fetch = jest.fn(() => new Promise(() => {}));

  render(<AddTrip onAddTrip={jest.fn()} />);

  expect(
    screen.getByRole("button", { name: "Create Trip" }),
  ).toBeInTheDocument();
});

test("loads countries", async () => {
  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      data: [{ name: "Israel" }, { name: "Italy" }],
    }),
  });

  render(<AddTrip onAddTrip={jest.fn()} />);

  expect(
    await screen.findByRole("option", { name: "Israel" }),
  ).toBeInTheDocument();
});

test("submits a valid trip", async () => {
  const onAddTrip = jest.fn();

  Object.defineProperty(global, "crypto", {
    value: { randomUUID: () => "trip-1" },
    configurable: true,
  });

  global.fetch = jest.fn().mockResolvedValue({
    json: async () => ({
      data: [{ name: "Italy" }],
    }),
  });

  render(<AddTrip onAddTrip={onAddTrip} />);

  await screen.findByRole("option", { name: "Italy" });

  fireEvent.change(screen.getByPlaceholderText("Trip name"), {
    target: { value: "Rome" },
  });

  fireEvent.change(screen.getAllByRole("combobox")[0], {
    target: { value: "Italy" },
  });

  const dateInputs = document.querySelectorAll('input[type="date"]');

  fireEvent.change(dateInputs[0], {
    target: { value: "2026-09-01" },
  });

  fireEvent.change(dateInputs[1], {
    target: { value: "2026-09-05" },
  });

  fireEvent.change(screen.getByPlaceholderText("Budget"), {
    target: { value: "100" },
  });

  fireEvent.click(
    screen.getByRole("button", { name: "Create Trip" }),
  );

  expect(onAddTrip).toHaveBeenCalledWith(
    expect.objectContaining({
      name: "Rome",
      country: "Italy",
      startDate: "2026-09-01",
      endDate: "2026-09-05",
      budget: 100,
      currency: "€",
    }),
  );
});