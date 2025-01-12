export const formatDateForComparison = (date: Date | null | undefined): string => {
    if (!date) {
        return '';
    }
    return date.toISOString().replace('T', ' ').slice(0, -1);
};
