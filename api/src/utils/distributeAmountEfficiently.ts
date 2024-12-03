type Batch = {
  course_id: number;
  batch_id: number;
  due_amount: number;
};
type ValueReturnType = {
  course_id: number;
  batch_id: number;
  distributedAmount: number;
};

export function distributeAmountEfficiently(
  batches: Batch[],
  amount: number
): ValueReturnType[] {
  // Calculate total eligible dueAmount and count eligible batches
  let totalDue = 0;
  let eligibleCount = 0;

  for (const batch of batches) {
    if (batch.due_amount > 0) {
      totalDue += batch.due_amount;
      eligibleCount++;
    }
  }

  if (totalDue === 0 || eligibleCount === 0) {
    // No dues to distribute
    return [];
  }

  // Determine per-batch share for distribution
  const perBatchShare = Math.abs(amount) / eligibleCount;

  // Store the distribution result
  const distributionResult: ValueReturnType[] = [];

  // Distribute the amount
  for (const batch of batches) {
    if (batch.due_amount > 0) {
      const deduction = Math.min(perBatchShare, batch.due_amount);
      const distributedAmount = amount > 0 ? deduction : -deduction; // Positive or negative adjustment
      distributionResult.push({
        batch_id: batch.batch_id,
        course_id: batch.course_id,
        distributedAmount,
      });
    }
  }

  return distributionResult;
}
