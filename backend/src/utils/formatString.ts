export const formatDateForComparison = (date: Date): string => {
    return date.toISOString().replace('T', ' ').slice(0, -1); // Remove o 'Z' no final
};