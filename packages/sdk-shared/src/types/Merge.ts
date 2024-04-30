/**
 * Merge two types together. The resulting type will have all properties of both types, but if a property is present in
 * both types, the type of the second type will be used.
 */
export type Merge<T, U> = Omit<T, keyof U> & U;
