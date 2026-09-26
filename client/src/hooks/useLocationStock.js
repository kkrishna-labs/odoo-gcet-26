import { stockApi } from '../services/productApi.js';
import useAsync from './useAsync.js';

/**
 * Live stock at one location, keyed by product id:
 *   { byProduct: { [productId]: { quantity, reserved, freeToUse } }, loading, reload }
 * Used for availability hints on deliveries/transfers and recorded quantities on adjustments.
 */
export default function useLocationStock(locationId) {
  const { data, loading, reload } = useAsync(
    () => (locationId ? stockApi.list({ location: locationId, includeZero: 'true', limit: 100 }) : Promise.resolve(null)),
    [locationId]
  );
  const byProduct = Object.fromEntries(
    (data?.items ?? []).map((q) => [q.product._id, { quantity: q.quantity, reserved: q.reserved, freeToUse: q.freeToUse }])
  );
  return { byProduct, loading, reload };
}
