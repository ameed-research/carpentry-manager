export const formatPrice = (value: number | null | undefined): string => {
  if (value == null) return '0.00';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};
