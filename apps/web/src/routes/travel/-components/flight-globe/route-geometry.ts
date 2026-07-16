export type Coordinate = [number, number];

type CreateRouteSegmentsOptions = {
  from: Coordinate;
  to: Coordinate;
};

export function createRouteSegments(
  opts: CreateRouteSegmentsOptions
): Coordinate[][] {
  const { from, to } = opts;
  const [fromLongitude, fromLatitude] = from;
  const [toLongitude, toLatitude] = to;
  const unwrappedToLongitude = unwrapLongitude({
    longitude: toLongitude,
    relativeTo: fromLongitude,
  });

  if (unwrappedToLongitude >= -180 && unwrappedToLongitude <= 180) {
    return [[from, to]];
  }

  const boundaryLongitude = unwrappedToLongitude > 180 ? 180 : -180;
  const wrappedBoundaryLongitude = boundaryLongitude === 180 ? -180 : 180;
  const progress =
    (boundaryLongitude - fromLongitude) /
    (unwrappedToLongitude - fromLongitude);
  const boundaryLatitude =
    fromLatitude + (toLatitude - fromLatitude) * progress;

  return [
    [from, [boundaryLongitude, boundaryLatitude]],
    [[wrappedBoundaryLongitude, boundaryLatitude], to],
  ];
}

type UnwrapLongitudeOptions = {
  longitude: number;
  relativeTo: number;
};

function unwrapLongitude(opts: UnwrapLongitudeOptions) {
  const { longitude, relativeTo } = opts;
  const delta = longitude - relativeTo;

  if (delta > 180) {
    return longitude - 360;
  }

  if (delta < -180) {
    return longitude + 360;
  }

  return longitude;
}
