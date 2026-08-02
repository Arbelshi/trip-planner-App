import {
  flattenActivities,
  getFilteredActivities,
  getBudgetData,
  deleteActivityFromTrip,
  addActivityToTrip,
} from "./tripHelpers";


test("flattenActivities should return an empty array when there are no activities", () => {
  const trip = {};

  const result = flattenActivities(trip);

  expect(result).toEqual([]);
});

test("flattenActivities should flatten activities and add city and date", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-02": [
          {
            id: "1",
            description: "Museum",
            startTime: "10:00",
          },
        ],
      },
    },
  };

  const result = flattenActivities(trip);

  expect(result).toHaveLength(1);

  expect(result[0]).toEqual({
    id: "1",
    description: "Museum",
    startTime: "10:00",
    city: "Rome",
    date: "2026-08-02",
  });
});

test("flattenActivities should sort activities by date", () => {
  // Arrange
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-03": [
          {
            id: "later",
            description: "Museum",
            startTime: "10:00",
          },
        ],
        "2026-08-01": [
          {
            id: "earlier",
            description: "Restaurant",
            startTime: "12:00",
          },
        ],
      },
    },
  };

  // Act
  const result = flattenActivities(trip);

  // Assert
  expect(result[0].id).toBe("earlier");
  expect(result[1].id).toBe("later");
});

test("flattenActivities should sort activities by time on the same date", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "later",
            description: "Lunch",
            startTime: "13:00",
          },
          {
            id: "earlier",
            description: "Museum",
            startTime: "09:00",
          },
        ],
      },
    },
  };

  const result = flattenActivities(trip);

  expect(result[0].id).toBe("earlier");
  expect(result[1].id).toBe("later");
});


test("flattenActivities should combine activities from multiple cities and dates", () => {
  // Arrange
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "rome-1",
            description: "Museum",
            startTime: "10:00",
          },
        ],
        "2026-08-02": [
          {
            id: "rome-2",
            description: "Restaurant",
            startTime: "12:00",
          },
        ],
      },
      Milan: {
        "2026-08-03": [
          {
            id: "milan-1",
            description: "Shopping",
            startTime: "09:00",
          },
        ],
      },
    },
  };


  const result = flattenActivities(trip);


  expect(result).toHaveLength(3);

  expect(result.map((activity) => activity.id)).toEqual([
    "rome-1",
    "rome-2",
    "milan-1",
  ]);

  expect(result[0].city).toBe("Rome");
  expect(result[1].city).toBe("Rome");
  expect(result[2].city).toBe("Milan");
});

test("flattenActivities should ignore empty activity lists", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [],
      },
    },
  };

  const result = flattenActivities(trip);

  expect(result).toEqual([]);
});


test("getFilteredActivities should filter activities by category", () => {
  const activities = [
    {
      id: "1",
      category: "Museum",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      category: "Restaurant",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "12:00",
    },
  ];

  const filters = {
    categoryFilter: "Museum",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("1");
  expect(result[0].category).toBe("Museum");
});

test("getFilteredActivities should filter activities by status", () => {
  const activities = [
    {
      id: "1",
      category: "Museum",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      category: "Restaurant",
      isReserved: true,
      status: "booked",
      reservationType: "required",
      date: "2026-08-01",
      startTime: "12:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "booked",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("2");
  expect(result[0].status).toBe("booked");
});

test("getFilteredActivities should filter reserved activities", () => {
  const activities = [
    {
      id: "1",
      category: "Museum",
      isReserved: true,
      status: "booked",
      reservationType: "required",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      category: "Restaurant",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "12:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "reserved",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("1");
  expect(result[0].isReserved).toBe(true);
});


test("getFilteredActivities should filter activities that are not reserved", () => {
  const activities = [
    {
      id: "1",
      isReserved: true,
      status: "booked",
      reservationType: "required",
      category: "Museum",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      category: "Restaurant",
      date: "2026-08-01",
      startTime: "12:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "not_reserved",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("2");
  expect(result[0].isReserved).toBe(false);
});

test("getFilteredActivities should filter activities by reservation type", () => {
  // Arrange
  const activities = [
    {
      id: "1",
      category: "Museum",
      isReserved: false,
      status: "planned",
      reservationType: "required",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      category: "Restaurant",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "12:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "required",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("1");
  expect(result[0].reservationType).toBe("required");
});

test("getFilteredActivities should sort activities by cost", () => {
  const activities = [
    {
      id: "expensive",
      category: "Museum",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "10:00",
      cost: 50,
    },
    {
      id: "cheap",
      category: "Restaurant",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "12:00",
      cost: 20,
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "cost",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result[0].id).toBe("cheap");
  expect(result[1].id).toBe("expensive");
});

test("getFilteredActivities should sort activities by status", () => {
  const activities = [
    {
      id: "1",
      status: "done",
      category: "Museum",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      status: "planned",
      category: "Restaurant",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "3",
      status: "cancelled",
      category: "Shopping",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
      startTime: "10:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "status",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result[0].id).toBe("2");
  expect(result[1].id).toBe("1");
  expect(result[2].id).toBe("3");
});


test("getFilteredActivities should sort activities by date and time", () => {
  const activities = [
    {
      id: "later",
      category: "Museum",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-02",
      startTime: "12:00",
    },
    {
      id: "earlier",
      category: "Restaurant",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "09:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result[0].id).toBe("earlier");
  expect(result[1].id).toBe("later");
});

test("getFilteredActivities should return all activities when all filters are set to all", () => {
  const activities = [
    {
      id: "1",
      category: "Museum",
      isReserved: false,
      status: "planned",
      reservationType: "none",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "2",
      category: "Restaurant",
      isReserved: true,
      status: "booked",
      reservationType: "required",
      date: "2026-08-02",
      startTime: "12:00",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(2);
});


test("getFilteredActivities should return an empty array when activities are empty", () => {
  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  const result = getFilteredActivities([], filters);

  expect(result).toEqual([]);
});


test("getFilteredActivities should apply multiple filters together", () => {
  const activities = [
    {
      id: "match",
      category: "Museum",
      isReserved: true,
      status: "booked",
      reservationType: "required",
      date: "2026-08-01",
      startTime: "10:00",
    },
    {
      id: "wrong-status",
      category: "Museum",
      isReserved: true,
      status: "planned",
      reservationType: "required",
      date: "2026-08-01",
      startTime: "11:00",
    },
  ];

  const filters = {
    categoryFilter: "Museum",
    reservedFilter: "reserved",
    statusFilter: "booked",
    reservationNeedFilter: "required",
    sortBy: "date",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result).toHaveLength(1);
  expect(result[0].id).toBe("match");
});

test("getFilteredActivities should not modify the original array", () => {
  const activities = [
    {
      id: "later",
      category: "Museum",
      status: "planned",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-02",
      startTime: "10:00",
    },
    {
      id: "earlier",
      category: "Restaurant",
      status: "planned",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
      startTime: "10:00",
    },
  ];

  const originalOrder = activities.map((activity) => activity.id);

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "date",
  };

  getFilteredActivities(activities, filters);

  expect(activities.map((activity) => activity.id)).toEqual(originalOrder);
});

test("getFilteredActivities should treat missing or invalid cost as zero", () => {
  const activities = [
    {
      id: "priced",
      cost: 20,
      category: "Museum",
      status: "planned",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
    },
    {
      id: "missing-cost",
      category: "Restaurant",
      status: "planned",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
    },
    {
      id: "invalid-cost",
      cost: "abc",
      category: "Shopping",
      status: "planned",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "cost",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result[2].id).toBe("priced");
  expect(result.slice(0, 2).map((activity) => activity.id)).toEqual(
    expect.arrayContaining(["missing-cost", "invalid-cost"])
  );
});

test("getFilteredActivities should place unknown statuses last", () => {
  const activities = [
    {
      id: "unknown",
      status: "custom",
      category: "Museum",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
    },
    {
      id: "planned",
      status: "planned",
      category: "Restaurant",
      reservationType: "none",
      isReserved: false,
      date: "2026-08-01",
    },
  ];

  const filters = {
    categoryFilter: "all",
    reservedFilter: "all",
    statusFilter: "all",
    reservationNeedFilter: "all",
    sortBy: "status",
  };

  const result = getFilteredActivities(activities, filters);

  expect(result.map((activity) => activity.id)).toEqual([
    "planned",
    "unknown",
  ]);
});


test("getBudgetData should calculate total and filtered budgets", () => {
  const activities = [
    {
      id: "1",
      category: "Museum",
      cost: 50,
    },
    {
      id: "2",
      category: "Restaurant",
      cost: 100,
    },
    {
      id: "3",
      category: "Museum",
      cost: 20,
    },
  ];

  const filteredActivities = [activities[0], activities[2]];

  const result = getBudgetData(activities, filteredActivities);

  expect(result.totalBudget).toBe(170);
  expect(result.filteredBudget).toBe(70);
  expect(result.budgetByCategory).toEqual({
    Museum: 70,
  });
});

test("getBudgetData should group filtered budget by category", () => {
  const activities = [
    {
      id: "1",
      category: "Museum",
      cost: 50,
    },
    {
      id: "2",
      category: "Restaurant",
      cost: 100,
    },
    {
      id: "3",
      category: "Museum",
      cost: 20,
    },
  ];

  const result = getBudgetData(activities, activities);

  expect(result.budgetByCategory).toEqual({
    Museum: 70,
    Restaurant: 100,
  });
});

test("getBudgetData should handle missing values and use Other as category", () => {
  const activities = [
    {
      id: "1",
      cost: "30",
    },
    {
      id: "2",
      category: "Museum",
      cost: "invalid",
    },
    {
      id: "3",
      category: "Museum",
    },
  ];

  const result = getBudgetData(activities, activities);

  expect(result.totalBudget).toBe(30);
  expect(result.filteredBudget).toBe(30);
  expect(result.budgetByCategory).toEqual({
    Other: 30,
    Museum: 0,
  });
});

test("getBudgetData should return zero values for empty arrays", () => {
  const result = getBudgetData([], []);

  expect(result).toEqual({
    totalBudget: 0,
    filteredBudget: 0,
    budgetByCategory: {},
  });
});

test("deleteActivityFromTrip should delete the selected activity", () => {
  const trip = {
    id: "trip-1",
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "1",
            description: "Museum",
          },
          {
            id: "2",
            description: "Restaurant",
          },
        ],
      },
    },
  };

  const result = deleteActivityFromTrip(trip, "1");

  expect(result.activitiesByCity.Rome["2026-08-01"]).toEqual([
    {
      id: "2",
      description: "Restaurant",
    },
  ]);
});

test("deleteActivityFromTrip should remove an empty date after deletion", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "1",
            description: "Museum",
          },
        ],
        "2026-08-02": [
          {
            id: "2",
            description: "Restaurant",
          },
        ],
      },
    },
  };

  const result = deleteActivityFromTrip(trip, "1");

  expect(result.activitiesByCity.Rome["2026-08-01"]).toBeUndefined();
  expect(result.activitiesByCity.Rome["2026-08-02"]).toBeDefined();
});


test("deleteActivityFromTrip should remove an empty city after deletion", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "1",
            description: "Museum",
          },
        ],
      },
      Milan: {
        "2026-08-02": [
          {
            id: "2",
            description: "Shopping",
          },
        ],
      },
    },
  };

  const result = deleteActivityFromTrip(trip, "1");

  expect(result.activitiesByCity.Rome).toBeUndefined();
  expect(result.activitiesByCity.Milan).toBeDefined();
});

test("deleteActivityFromTrip should not modify the original trip", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          { id: "1", description: "Museum" },
          { id: "2", description: "Restaurant" },
        ],
      },
    },
  };

  deleteActivityFromTrip(trip, "1");

  expect(trip.activitiesByCity.Rome["2026-08-01"]).toHaveLength(2);
});

test("deleteActivityFromTrip should keep activities unchanged when id does not exist", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "1",
            description: "Museum",
          },
        ],
      },
    },
  };

  const result = deleteActivityFromTrip(trip, "999");

  expect(result).toEqual(trip);
});

test("addActivityToTrip should add an activity to an empty trip", () => {
  const trip = {
    id: "trip-1",
  };

  const activity = {
    id: "1",
    city: "Rome",
    date: "2026-08-01",
    description: "Museum",
  };

  const result = addActivityToTrip(trip, activity);

  expect(result.activitiesByCity.Rome["2026-08-01"]).toEqual([
    activity,
  ]);
});

test("addActivityToTrip should add the new activity before existing activities", () => {
  const existingActivity = {
    id: "old",
    city: "Rome",
    date: "2026-08-01",
    description: "Restaurant",
  };

  const newActivity = {
    id: "new",
    city: "Rome",
    date: "2026-08-01",
    description: "Museum",
  };

  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [existingActivity],
      },
    },
  };

  const result = addActivityToTrip(trip, newActivity);

  expect(result.activitiesByCity.Rome["2026-08-01"]).toEqual([
    newActivity,
    existingActivity,
  ]);
});

test("addActivityToTrip should add a new date to an existing city", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "old",
            city: "Rome",
            date: "2026-08-01",
          },
        ],
      },
    },
  };

  const activity = {
    id: "new",
    city: "Rome",
    date: "2026-08-02",
  };

  const result = addActivityToTrip(trip, activity);

  expect(result.activitiesByCity.Rome["2026-08-01"]).toHaveLength(1);
  expect(result.activitiesByCity.Rome["2026-08-02"]).toEqual([activity]);
});


test("addActivityToTrip should add a new city without removing existing cities", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "rome-1",
            city: "Rome",
            date: "2026-08-01",
          },
        ],
      },
    },
  };

  const activity = {
    id: "milan-1",
    city: "Milan",
    date: "2026-08-02",
  };

  const result = addActivityToTrip(trip, activity);

  expect(result.activitiesByCity.Rome).toBeDefined();
  expect(result.activitiesByCity.Milan["2026-08-02"]).toEqual([
    activity,
  ]);
});

test("addActivityToTrip should not modify the original trip", () => {
  const trip = {
    activitiesByCity: {
      Rome: {
        "2026-08-01": [
          {
            id: "old",
          },
        ],
      },
    },
  };

  const activity = {
    id: "new",
    city: "Rome",
    date: "2026-08-01",
  };

  addActivityToTrip(trip, activity);

  expect(trip.activitiesByCity.Rome["2026-08-01"]).toEqual([
    {
      id: "old",
    },
  ]);
});


