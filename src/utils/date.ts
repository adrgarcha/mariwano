export function getIsoWeekId(date: Date = new Date()): string {
   const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
   const dayOfWeek = d.getUTCDay() || 7;
   d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
   const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
   const weekNumber = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
   return `${d.getUTCFullYear()}-W${weekNumber < 10 ? '0' : ''}${weekNumber}`;
}

export function isDateAfterDays(date: Date, days: number) {
   const currentDate = new Date();
   const difference = currentDate.getTime() - date.getTime();
   const daysDifference = difference / (1000 * 3600 * 24);

   return daysDifference > days;
}

export function isDateBeforeDays(date: Date, days: number) {
   return !isDateAfterDays(date, days);
}
