export function flattenActivities(trip) {
  if (!trip?.activitiesByCity) return [];

  const out = [];
  for (const [city, byDate] of Object.entries(trip.activitiesByCity)) {
    for (const [date, list] of Object.entries(byDate)) {
      for (const a of list) {
        out.push({ ...a, city, date });
      }
    }
  }

  out.sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return (a.startTime || "").localeCompare(b.startTime || "");
  });

  return out;
}

export function getFilteredActivities(
  activities,
  {
    categoryFilter,
    reservedFilter,
    statusFilter,
    reservationNeedFilter,
    sortBy,
  }
) {
  const STATUS_ORDER = {
    planned: 1,
    pending: 2,
    booked: 3,
    done: 4,
    cancelled: 5,
  };

  return [...activities]
    .filter((a) => {
      const okCat = categoryFilter === "all" || a.category === categoryFilter;

      const okRes =
        reservedFilter === "all" ||
        (reservedFilter === "reserved" ? !!a.isReserved : !a.isReserved);

      const okStatus = statusFilter === "all" || a.status === statusFilter;

      const rt = a.reservationType || "none";
      const okNeed =
        reservationNeedFilter === "all" || rt === reservationNeedFilter;

      return okCat && okRes && okStatus && okNeed;
    })
    .sort((a, b) => {
      const toDateTime = (x) => {
        const t = x.startTime || "00:00";
        return new Date(`${x.date}T${t}`);
      };

      if (sortBy === "cost") {
        return (Number(a.cost) || 0) - (Number(b.cost) || 0);
      }

      if (sortBy === "status") {
        return (
          (STATUS_ORDER[a.status] ?? 999) - (STATUS_ORDER[b.status] ?? 999)
        );
      }

      return toDateTime(a) - toDateTime(b);
    });
}

export function getBudgetData(activities, filteredActivities) {
  const totalBudget = activities.reduce(
    (sum, activity) => sum + (Number(activity.cost) || 0),
    0
  );

  const filteredBudget = filteredActivities.reduce(
    (sum, activity) => sum + (Number(activity.cost) || 0),
    0
  );

  const budgetByCategory = filteredActivities.reduce((acc, activity) => {
    const key = activity.category || "Other";
    acc[key] = (acc[key] || 0) + (Number(activity.cost) || 0);
    return acc;
  }, {});

  return { totalBudget, filteredBudget, budgetByCategory };
}

export function deleteActivityFromTrip(trip, activityId) {
  const byCity = trip.activitiesByCity || {};
  const nextByCity = {};

  for (const [city, byDate] of Object.entries(byCity)) {
    const nextByDate = {};

    for (const [date, list] of Object.entries(byDate)) {
      const filteredList = (list || []).filter((a) => a.id !== activityId);

      if (filteredList.length > 0) {
        nextByDate[date] = filteredList;
      }
    }

    if (Object.keys(nextByDate).length > 0) {
      nextByCity[city] = nextByDate;
    }
  }

  return {
    ...trip,
    activitiesByCity: nextByCity,
  };
}

export function addActivityToTrip(trip, activity) {
  const city = activity.city;
  const date = activity.date;

  const byCity = trip.activitiesByCity || {};
  const byDate = byCity[city] || {};
  const dayList = byDate[date] || [];

  return {
    ...trip,
    activitiesByCity: {
      ...byCity,
      [city]: {
        ...byDate,
        [date]: [activity, ...dayList],
      },
    },
  };
}