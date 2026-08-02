import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import AddTrip from "./AddTrip";

const originalFetch = global.fetch;
const originalCrypto = global.crypto;

afterEach(() => {
  jest.clearAllMocks();
  global.fetch = originalFetch;

  Object.defineProperty(global, "crypto", {
    value: originalCrypto,
    configurable: true,
  });
});

function mockCountries(countries = ["Israel", "Italy"]) {
  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({
      data: countries.map((name) => ({ name })),
    }),
  });
}

async function renderLoadedForm(onAddTrip = jest.fn()) {
  mockCountries(["Italy", "Israel"]);

  const renderResult = render(
    <AddTrip onAddTrip={onAddTrip} />,
  );

  await screen.findByRole("option", {
    name: "Italy",
  });

  return {
    ...renderResult,
    onAddTrip,
  };
}

function getFormFields(container) {
  const selects = screen.getAllByRole("combobox");
  const dateInputs =
    container.querySelectorAll('input[type="date"]');

  return {
    countrySelect: selects[0],
    currencySelect: selects[1],
    startDateInput: dateInputs[0],
    endDateInput: dateInputs[1],
    nameInput: screen.getByPlaceholderText("Trip name"),
    budgetInput: screen.getByPlaceholderText("Budget"),
  };
}

function fillValidTrip(container) {
  const fields = getFormFields(container);

  fireEvent.change(fields.nameInput, {
    target: { value: "Rome" },
  });

  fireEvent.change(fields.countrySelect, {
    target: { value: "Italy" },
  });

  fireEvent.change(fields.startDateInput, {
    target: { value: "2026-09-01" },
  });

  fireEvent.change(fields.endDateInput, {
    target: { value: "2026-09-05" },
  });

  fireEvent.change(fields.budgetInput, {
    target: { value: "100" },
  });

  return fields;
}

test("renders the AddTrip form", () => {
  global.fetch = jest.fn(() => new Promise(() => {}));

  render(<AddTrip onAddTrip={jest.fn()} />);

  expect(
    screen.getByRole("button", {
      name: "Create Trip",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByPlaceholderText("Trip name"),
  ).toBeInTheDocument();

  expect(
    screen.getByPlaceholderText("Budget"),
  ).toBeInTheDocument();
});

test("loads countries", async () => {
  mockCountries(["Israel", "Italy"]);

  render(<AddTrip onAddTrip={jest.fn()} />);

  expect(
    await screen.findByRole("option", {
      name: "Israel",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("option", {
      name: "Italy",
    }),
  ).toBeInTheDocument();

  expect(global.fetch).toHaveBeenCalledWith("/api/countries"  );
});

test("submits a valid trip", async () => {
  const onAddTrip = jest.fn();

  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "trip-1"),
    },
    configurable: true,
  });

  const { container } = await renderLoadedForm(onAddTrip);

  fillValidTrip(container);

  fireEvent.submit(container.querySelector("form"));

  expect(onAddTrip).toHaveBeenCalledTimes(1);

  expect(onAddTrip).toHaveBeenCalledWith({
    id: "trip-1",
    name: "Rome",
    country: "Italy",
    startDate: "2026-09-01",
    endDate: "2026-09-05",
    budget: 100,
    currency: "€",
    selectedCities: [],
    activitiesByCity: {},
  });
});

test("shows an error when the trip name is empty", async () => {
  const onAddTrip = jest.fn();

  const { container } = await renderLoadedForm(onAddTrip);

  fireEvent.submit(container.querySelector("form"));

  expect(
    screen.getByText("Please enter trip name"),
  ).toBeInTheDocument();

  expect(onAddTrip).not.toHaveBeenCalled();
});

test("shows an error when no country is selected", async () => {
  const onAddTrip = jest.fn();

  const { container } = await renderLoadedForm(onAddTrip);

  fireEvent.change(
    screen.getByPlaceholderText("Trip name"),
    {
      target: { value: "Rome" },
    },
  );

  fireEvent.submit(container.querySelector("form"));

  expect(
    screen.getByText("Please choose country"),
  ).toBeInTheDocument();

  expect(onAddTrip).not.toHaveBeenCalled();
});

test("shows an error when dates are missing", async () => {
  const onAddTrip = jest.fn();

  const { container } = await renderLoadedForm(onAddTrip);

  const fields = getFormFields(container);

  fireEvent.change(fields.nameInput, {
    target: { value: "Rome" },
  });

  fireEvent.change(fields.countrySelect, {
    target: { value: "Italy" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(
    screen.getByText("Please choose dates"),
  ).toBeInTheDocument();

  expect(onAddTrip).not.toHaveBeenCalled();
});

test("shows an error when the start date is after the end date", async () => {
  const onAddTrip = jest.fn();

  const { container } = await renderLoadedForm(onAddTrip);

  const fields = getFormFields(container);

  fireEvent.change(fields.nameInput, {
    target: { value: "Rome" },
  });

  fireEvent.change(fields.countrySelect, {
    target: { value: "Italy" },
  });

  fireEvent.change(fields.startDateInput, {
    target: { value: "2026-09-10" },
  });

  fireEvent.change(fields.endDateInput, {
    target: { value: "2026-09-05" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(
    screen.getByText(
      "Start date must be before end date",
    ),
  ).toBeInTheDocument();

  expect(onAddTrip).not.toHaveBeenCalled();
});

test("shows an error when the budget is empty", async () => {
  const onAddTrip = jest.fn();

  const { container } = await renderLoadedForm(onAddTrip);

  const fields = getFormFields(container);

  fireEvent.change(fields.nameInput, {
    target: { value: "Rome" },
  });

  fireEvent.change(fields.countrySelect, {
    target: { value: "Italy" },
  });

  fireEvent.change(fields.startDateInput, {
    target: { value: "2026-09-01" },
  });

  fireEvent.change(fields.endDateInput, {
    target: { value: "2026-09-05" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(
    screen.getByText("Budget must be 0 or more"),
  ).toBeInTheDocument();

  expect(onAddTrip).not.toHaveBeenCalled();
});

test("allows a budget of zero", async () => {
  const onAddTrip = jest.fn();

  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "trip-zero"),
    },
    configurable: true,
  });

  const { container } = await renderLoadedForm(onAddTrip);

  const fields = fillValidTrip(container);

  fireEvent.change(fields.budgetInput, {
    target: { value: "0" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(onAddTrip).toHaveBeenCalledWith(
    expect.objectContaining({
      budget: 0,
    }),
  );
});

test("submits the selected currency", async () => {
  const onAddTrip = jest.fn();

  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "trip-dollar"),
    },
    configurable: true,
  });

  const { container } = await renderLoadedForm(onAddTrip);

  const fields = fillValidTrip(container);

  fireEvent.change(fields.currencySelect, {
    target: { value: "$" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(onAddTrip).toHaveBeenCalledWith(
    expect.objectContaining({
      currency: "$",
    }),
  );
});

test("resets the form after a successful submission", async () => {
  const onAddTrip = jest.fn();

  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "trip-1"),
    },
    configurable: true,
  });

  const { container } = await renderLoadedForm(onAddTrip);

  const fields = fillValidTrip(container);

  fireEvent.change(fields.currencySelect, {
    target: { value: "$" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(onAddTrip).toHaveBeenCalledTimes(1);

  expect(fields.nameInput).toHaveValue("");
  expect(fields.countrySelect).toHaveValue("");
  expect(fields.startDateInput).toHaveValue("");
  expect(fields.endDateInput).toHaveValue("");
  expect(fields.budgetInput.value).toBe("");
  expect(fields.currencySelect).toHaveValue("€");
});

test("shows an error when loading countries fails", async () => {
  const consoleErrorSpy = jest
    .spyOn(console, "error")
    .mockImplementation(() => {});

  global.fetch = jest.fn().mockRejectedValue(
    new Error("Network error"),
  );

  render(<AddTrip onAddTrip={jest.fn()} />);

  expect(
    await screen.findByText("Failed to load countries"),
  ).toBeInTheDocument();

  await waitFor(() => {
    expect(
      screen.getAllByRole("combobox")[0],
    ).toBeEnabled();
  });

  consoleErrorSpy.mockRestore();
});