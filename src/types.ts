export type GungnirElement =
  keyof JSX.IntrinsicElements extends infer T ?
    T extends `gungnir-${infer Y}` ? Y : never
  : never;

export type PropsWithChildren<T extends GungnirElement> =
  `gungnir-${T}` extends keyof JSX.IntrinsicElements ? JSX.IntrinsicElements[`gungnir-${T}`] : never;

export type Props<T extends GungnirElement> = Omit<NonNullable<PropsWithChildren<T>>, "children">;
export type Children<T extends GungnirElement> =
  NonNullable<PropsWithChildren<T>> extends {children?: any} ?
    NonNullable<PropsWithChildren<T>>["children"]
    : never;