export function sqlPlaceholderCreator(colLength: number, rowLength: number) {
  const placeholders: string[] = [];

  let num = 1;
  for (let i = 0; i < rowLength; i++) {
    const start = num;
    const end = num + colLength - 1;
    placeholders.push(
      `(${Array.from({ length: colLength }, (_, j) => `$${start + j}`).join(
        ", "
      )})`
    );
    num = end + 1; // Increment `num` to the next sequence
  }

  return { placeholderNum: num, placeholder: placeholders.join(", ") };
}
