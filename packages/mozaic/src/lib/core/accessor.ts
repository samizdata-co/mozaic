/** Data values that can be mapped through a position scale. */
export type Value = string | number | Date | boolean | null | undefined;

/** A constant, or a function of the datum and its index. (Avoid `V = any`: it erases the callback's types.) */
export type Accessor<T, V> = V | ((d: T, i: number) => V);

export function access<T, V>(accessor: Accessor<T, V>, d: T, i: number): V {
	return typeof accessor === 'function' ? (accessor as (d: T, i: number) => V)(d, i) : accessor;
}
