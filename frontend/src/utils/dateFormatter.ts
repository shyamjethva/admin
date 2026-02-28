/**
 * Format date to dd/mm/yyyy format
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in dd/mm/yyyy format
 */
export const formatDateDDMMYYYY = (date: string | Date | number | null | undefined): string => {
    if (!date) return '';

    try {
        // Convert to Date object if it's a string or number
        const dateObj = typeof date === 'string' || typeof date === 'number'
            ? new Date(date)
            : date;

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return '';
        }

        // Extract day, month, year
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = dateObj.getFullYear();

        return `${day}/${month}/${year}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

// ...existing code...

/**
 * Format date to yyyy-mm-dd format (for input fields)
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string in yyyy-mm-dd format
 */
export const formatDateYYYYMMDD = (date: string | Date | number | null | undefined): string => {
    if (!date) return '';

    try {
        const dateObj = typeof date === 'string' || typeof date === 'number'
            ? new Date(date)
            : date;

        if (isNaN(dateObj.getTime())) {
            return '';
        }

        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};