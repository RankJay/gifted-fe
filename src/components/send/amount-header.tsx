"use client";

interface AmountHeaderProps {
  amount: string;
  message: string;
}

export function AmountHeader({ amount, message }: AmountHeaderProps) {
  const formatted = amount
    ? Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : "0.00";

  return (
    <div className="flex flex-col items-center gap-2 pt-12 pb-8">
      <span className="text-7xl font-bold tracking-tighter">{formatted}</span>
      {message && (
        <p className="text-base text-neutral-500 font-medium tracking-tight text-center max-w-72">
          {message}
        </p>
      )}
    </div>
  );
}
