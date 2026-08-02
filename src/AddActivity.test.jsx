import {
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import AddActivity from "./AddActivity";

beforeEach(() => {
  jest.clearAllMocks();

  Object.defineProperty(global, "crypto", {
    value: {
      randomUUID: jest.fn(() => "activity-123"),
    },
    configurable: true,
  });

  global.fetch = jest.fn().mockResolvedValue({
    json: jest.fn().mockResolvedValue({
      data: ["Rome", "Milan"],
    }),
  });
});

async function renderAddActivity(onAddActivity = jest.fn()) {
  const renderResult = render(
    <AddActivity
      onAddActivity={onAddActivity}
      tripCountry="Italy"
    />,
  );

  await screen.findByRole("option", {
    name: "Rome",
  });

  const selects = screen.getAllByRole("combobox");

  await waitFor(() => {
    expect(selects[0]).toBeEnabled();
  });

  return {
    ...renderResult,
    selects,
    onAddActivity,
  };
}

function fillRequiredFields(container, selects) {
  const dateInput = container.querySelector('input[type="date"]');
  const timeInputs = container.querySelectorAll('input[type="time"]');

  fireEvent.change(selects[0], {
    target: { value: "Rome" },
  });

  fireEvent.change(dateInput, {
    target: { value: "2026-08-01" },
  });

  fireEvent.change(timeInputs[0], {
    target: { value: "10:00" },
  });

  fireEvent.change(timeInputs[1], {
    target: { value: "12:00" },
  });

  fireEvent.change(screen.getByPlaceholderText("Description"), {
    target: { value: "Visit the museum" },
  });

  fireEvent.change(screen.getByPlaceholderText("Place"), {
    target: { value: "Vatican Museum" },
  });

  fireEvent.change(screen.getByPlaceholderText("Cost (€)"), {
    target: { value: "25" },
  });

  return {
    dateInput,
    timeInputs,
  };
}

test("AddActivity shows an error when no city is selected", () => {
  render(
    <AddActivity
      onAddActivity={jest.fn()}
      tripCountry=""
    />,
  );

  fireEvent.click(
    screen.getByRole("button", {
      name: "Add activity",
    }),
  );

  expect(
    screen.getByText("Please choose city"),
  ).toBeInTheDocument();
});

test("AddActivity loads cities for the selected country", async () => {
  await renderAddActivity();

  expect(
    screen.getByRole("option", {
      name: "Milan",
    }),
  ).toBeInTheDocument();

  expect(
    screen.getByRole("option", {
      name: "Rome",
    }),
  ).toBeInTheDocument();

  expect(global.fetch).toHaveBeenCalledTimes(1);

  expect(global.fetch).toHaveBeenCalledWith("/api/cities",
    expect.objectContaining({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        country: "Italy",
      }),
    }),
  );
});

test("AddActivity shows an error when start time is not before end time", async () => {
  const { container, selects } = await renderAddActivity();

  const dateInput = container.querySelector('input[type="date"]');
  const timeInputs = container.querySelectorAll('input[type="time"]');

  fireEvent.change(selects[0], {
    target: { value: "Rome" },
  });

  fireEvent.change(dateInput, {
    target: { value: "2026-08-01" },
  });

  fireEvent.change(timeInputs[0], {
    target: { value: "14:00" },
  });

  fireEvent.change(timeInputs[1], {
    target: { value: "12:00" },
  });

  fireEvent.submit(container.querySelector("form"));

  expect(
    screen.getByText("Start time must be before end time"),
  ).toBeInTheDocument();
});

test("AddActivity submits a valid activity", async () => {
  const onAddActivity = jest.fn();

  const { container, selects } =
    await renderAddActivity(onAddActivity);

  fillRequiredFields(container, selects);

  fireEvent.change(selects[1], {
    target: { value: "Museum" },
  });

  fireEvent.change(screen.getByPlaceholderText("Notes"), {
    target: { value: "Buy tickets in advance" },
  });

  fireEvent.change(selects[2], {
    target: { value: "booked" },
  });

  fireEvent.change(selects[3], {
    target: { value: "required" },
  });

  fireEvent.click(screen.getByRole("checkbox"));

  fireEvent.change(selects[4], {
    target: { value: "Must do" },
  });

  fireEvent.submit(container.querySelector("form"));


  expect(onAddActivity).toHaveBeenCalledTimes(1);

  expect(onAddActivity).toHaveBeenCalledWith({
    id: expect.any(String),
    city: "Rome",
    date: "2026-08-01",
    startTime: "10:00",
    endTime: "12:00",
    description: "Visit the museum",
    category: "Museum",
    place: "Vatican Museum",
    cost: 25,
    notes: "Buy tickets in advance",
    status: "booked",
    reservationType: "required",
    isReserved: true,
    priority: "Must do",
  });
});

test("AddActivity resets the form after a successful submission", async () => {
  const onAddActivity = jest.fn();

  const { container, selects } =
    await renderAddActivity(onAddActivity);

  const { dateInput, timeInputs } =
    fillRequiredFields(container, selects);

  fireEvent.submit(container.querySelector("form"));

  expect(onAddActivity).toHaveBeenCalledTimes(1);

  expect(
    screen.getByPlaceholderText("Description"),
  ).toHaveValue("");

  expect(
    screen.getByPlaceholderText("Place"),
  ).toHaveValue("");

  expect(
    screen.getByPlaceholderText("Cost (€)").value,
  ).toBe("");

  expect(
    screen.getByPlaceholderText("Notes"),
  ).toHaveValue("");

  expect(dateInput).toHaveValue("");
  expect(timeInputs[0]).toHaveValue("");
  expect(timeInputs[1]).toHaveValue("");

  expect(selects[0]).toHaveValue("");
  expect(selects[1]).toHaveValue("Other");
  expect(selects[2]).toHaveValue("planned");
  expect(selects[3]).toHaveValue("none");
  expect(selects[4]).toHaveValue("Optional");
});

test("AddActivity hides the reservation checkbox when reservation type changes to none", async () => {
  const { selects } = await renderAddActivity();

  const reservationTypeSelect = selects[3];

  fireEvent.change(reservationTypeSelect, {
    target: { value: "required" },
  });

  const checkbox = screen.getByRole("checkbox");

  fireEvent.click(checkbox);

  expect(checkbox).toBeChecked();

  fireEvent.change(reservationTypeSelect, {
    target: { value: "none" },
  });

  expect(
    screen.queryByRole("checkbox"),
  ).not.toBeInTheDocument();
});