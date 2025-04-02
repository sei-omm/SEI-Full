export const distributeAmount = (amount : number, people : number) => {
  let remaining = amount;
  let distribution = [];

  for (let i = 0; i < people - 1; i++) {
    let share = Math.floor(((Math.random() * remaining) / (people - i)) * 2); // Random allocation
    distribution.push(share);
    remaining -= share;
  }
  distribution.push(remaining); // Assign the last remaining amount

  return distribution;
};
