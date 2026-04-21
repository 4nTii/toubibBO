/**
 * Days of the week in French
 */
export const DAYS_FR = {
  monday: "Lundi",
  tuesday: "Mardi",
  wednesday: "Mercredi",
  thursday: "Jeudi",
  friday: "Vendredi",
  saturday: "Samedi",
  sunday: "Dimanche",
};

/**
 * Days of the week in order (Monday to Sunday)
 */
export const DAYS_ORDER = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

/**
 * Date utility functions
 */
const DateUtils = {
  /**
   * Parse a string to a Date object
   * @param {string|Date} dateString - The date string or Date object (supports "DD/MM/YYYY", "DD-MM-YYYY", "YYYY-MM-DD", ISO)
   * @returns {Date|null} Parsed Date object or null if invalid
   */
  parseDate(dateString) {
    if (dateString instanceof Date) return dateString;
    if (!dateString || typeof dateString !== "string") return null;

    // DD/MM/YYYY HH:mm:ss or DD-MM-YYYY HH:mm:ss
    const fullMatch = dateString.match(
      /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?$/,
    );

    if (fullMatch) {
      const [, day, month, year, hour = "0", minute = "0", second = "0"] =
        fullMatch;

      const date = new Date(
        Number(year),
        Number(month) - 1,
        Number(day),
        Number(hour),
        Number(minute),
        Number(second),
      );

      if (!isNaN(date.getTime())) return date;
    }

    // ISO format fallback (safe)
    const isoMatch = dateString.match(/^\d{4}-\d{2}-\d{2}/);
    if (isoMatch) {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) return date;
    }

    return null;
  },

  /**
   * Get difference in full days between two dates
   * @param {Date} toDate - Target date
   * @param {Date} [fromDate=new Date()] - Reference date (default today)
   * @returns {number} Number of days difference (negative = past, positive = future, 0 = same day)
   */
  getDateDiff(toDate, fromDate = new Date()) {
    const start = new Date(fromDate);
    const end = new Date(toDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return Math.round((end - start) / (1000 * 60 * 60 * 24));
  },

  /**
   * Get relative time description from a date (e.g., "il y a 5 minutes", "dans 2 jours")
   * @param {Date|string} inputDate - Date object or string "DD/MM/YYYY"
   * @returns {string|null} Relative time string in French or null if invalid date
   */
  getStringDateTimeDiff(inputDate) {
    const date =
      inputDate instanceof Date ? inputDate : this.parseDate(inputDate);

    if (!date || isNaN(date.getTime())) return null;

    const now = new Date();

    const diffMs = date - now;
    const absMs = Math.abs(diffMs);
    const isFuture = diffMs > 0;

    const prefix = isFuture ? "dans" : "il y a";

    const seconds = Math.floor(absMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    // Same calendar day
    const sameDay =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    // < 10 seconds
    if (seconds < 10) {
      return "à l'instant";
    }

    if (sameDay) {
      if (minutes < 1) {
        return `${prefix} ${seconds} ${seconds === 1 ? "seconde" : "secondes"}`;
      }

      if (hours < 1) {
        return `${prefix} ${minutes} ${minutes === 1 ? "minute" : "minutes"}`;
      }

      return `${prefix} ${hours} ${hours === 1 ? "heure" : "heures"}`;
    }

    // Different day
    if (days < 30) {
      return `${prefix} ${days} ${days === 1 ? "jour" : "jours"}`;
    }

    // Months
    let yearsDiff = date.getFullYear() - now.getFullYear();
    let monthsDiff = date.getMonth() - now.getMonth() + yearsDiff * 12;

    if (date.getDate() < now.getDate()) monthsDiff--;

    if (Math.abs(monthsDiff) < 12) {
      return `${prefix} ${Math.abs(monthsDiff)} mois`;
    }

    // >= 1 year → return formatted date
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  },

  /**
   * Convert date string to YYYY-MM-DD format for HTML date input
   * @param {Date|string} inputDate - Date object or date string
   * @returns {string} Date in YYYY-MM-DD format or empty string if invalid
   */
  toInputFormat(inputDate) {
    if (!inputDate) return "";

    // If already a string, try to parse it
    if (typeof inputDate === "string") {
      // Already in YYYY-MM-DD format (exactly 10 chars)
      if (/^\d{4}-\d{2}-\d{2}$/.test(inputDate)) {
        return inputDate;
      }

      // ISO format with time (e.g., "1990-03-15T00:00:00")
      if (/^\d{4}-\d{2}-\d{2}T/.test(inputDate)) {
        return inputDate.substring(0, 10);
      }
    }

    // Parse and convert to ISO format
    const date = this.parseDate(inputDate);
    if (!date || isNaN(date.getTime())) return "";

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");

    return `${year}-${month}-${day}`;
  },

  /**
   * Format a date as "day fullMonth year" (e.g., "15 mars 2024")
   * @param {Date|string} inputDate - Date object or date string
   * @param {string} [locale="fr-FR"] - Locale code (e.g., "fr-FR", "en-US")
   * @param {boolean} [includeDayName=false] - Whether to include day name (e.g., "lundi")
   * @returns {string} Formatted date string or empty string if invalid
   */
  formatDate(inputDate, locale = "fr-FR", includeDayName = false) {
    // Convert string to Date if necessary
    let date =
      inputDate instanceof Date ? inputDate : this.parseDate(inputDate);
    if (!date || isNaN(date.getTime())) return "";

    // Build formatting options
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };

    if (includeDayName) {
      options.weekday = "long"; // adds day name
    }

    // Format date
    return date.toLocaleDateString(locale, options);
  },
};

// Export as default
export default DateUtils;
