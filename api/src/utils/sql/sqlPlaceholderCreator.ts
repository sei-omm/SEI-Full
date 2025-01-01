export function sqlPlaceholderCreator(
  colLength: number,
  rowLength: number,
  extraOption?: { placeHolderNumber: number; value: string }
) {
  const placeholders: string[] = [];

  let num = 1;
  for (let i = 0; i < rowLength; i++) {
    const start = num;
    const end = num + colLength - 1;
    placeholders.push(
      `(${Array.from(
        { length: colLength },
        (_, j) =>
          `$${start + j}${
            extraOption && (extraOption.placeHolderNumber * (i + 1)) === (start + j)
              ? extraOption.value
              : ""
          }`
      ).join(", ")})`
    );
    num = end + 1; // Increment `num` to the next sequence
  }

  return { placeholderNum: num, placeholder: placeholders.join(", ") };
}
