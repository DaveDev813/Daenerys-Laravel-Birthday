const GODPARENT_SEGMENT = 'gp';

type RouteValue = string | Array<string | null | undefined> | null | undefined;

type GuestRouteLike = {
  params?: Record<string, RouteValue>;
  query?: Record<string, RouteValue>;
};

const getRouteString = (value: RouteValue) => {
  const routeValue = Array.isArray(value)
    ? value.find((item) => typeof item === 'string' && item.trim())
    : value;

  return typeof routeValue === 'string' ? routeValue.trim() : '';
};

const hasQueryKey = (
  query: GuestRouteLike['query'] | undefined,
  key: string
) => Boolean(query && Object.prototype.hasOwnProperty.call(query, key));

export const getGuestNameFromRoute = (route: GuestRouteLike) => {
  const guestNameFromPath = getRouteString(route.params?.guestName);

  return guestNameFromPath || getRouteString(route.query?.n);
};

export const isGodparentGuestRoute = (route: GuestRouteLike) => {
  const guestTypeFromPath = getRouteString(route.params?.guestType);

  return (
    guestTypeFromPath.toLowerCase() === GODPARENT_SEGMENT ||
    hasQueryKey(route.query, 'isgp')
  );
};

export const getGuestPathFromLegacyQuery = (route: GuestRouteLike) => {
  const guestName = getRouteString(route.query?.n);

  if (!guestName) {
    return '';
  }

  return `/guest/${encodeURIComponent(guestName)}${
    hasQueryKey(route.query, 'isgp') ? `/${GODPARENT_SEGMENT}` : ''
  }`;
};
