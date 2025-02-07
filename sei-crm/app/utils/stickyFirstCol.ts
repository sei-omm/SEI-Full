export const stickyFirstCol = (index: number, withoutColor = false) =>
  index === 0
    ? `sticky left-0 z-10 p-0 ${withoutColor ? "" : "bg-gray-100"}`
    : "";
