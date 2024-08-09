export function isDateAfterDays(date: Date, days: number) {
   const currentDate = new Date();
   const difference = currentDate.getTime() - date.getTime();
   const daysDifference = difference / (1000 * 3600 * 24);

   return daysDifference > days;
}

export function isDateBeforeDays(date: Date, days: number) {
   return !isDateAfterDays(date, days);
}
