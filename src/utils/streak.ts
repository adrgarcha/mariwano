interface StreakMultiplier {
   threshold: number;
   multiplier: number;
}

interface StreakResult {
   canClaim: boolean;
   newStreak: number;
   message?: string;
}

interface MilestoneInfo {
   current: number;
   nextThreshold: number;
   remaining: number;
   nextMultiplier: number;
}

const DAILY_MULTIPLIERS: StreakMultiplier[] = [
   { threshold: 30, multiplier: 2.0 },
   { threshold: 7, multiplier: 1.5 },
   { threshold: 3, multiplier: 1.2 },
];

const WEEKLY_MULTIPLIERS: StreakMultiplier[] = [
   { threshold: 20, multiplier: 2.0 },
   { threshold: 7, multiplier: 1.5 },
   { threshold: 3, multiplier: 1.2 },
];

export function getMultiplier(streak: number, type: 'daily' | 'weekly'): number {
   const multipliers = type === 'daily' ? DAILY_MULTIPLIERS : WEEKLY_MULTIPLIERS;

   for (const { threshold, multiplier } of multipliers) {
      if (streak >= threshold) {
         return multiplier;
      }
   }

   return 1.0;
}

export function getNextMilestone(streak: number, type: 'daily' | 'weekly'): MilestoneInfo | null {
   const multipliers = type === 'daily' ? DAILY_MULTIPLIERS : WEEKLY_MULTIPLIERS;
   const sortedAsc = [...multipliers].sort((a, b) => a.threshold - b.threshold);

   for (const { threshold, multiplier } of sortedAsc) {
      if (streak < threshold) {
         return {
            current: streak,
            nextThreshold: threshold,
            remaining: threshold - streak,
            nextMultiplier: multiplier,
         };
      }
   }

   return null;
}

function startOfDayUTC(date: Date): Date {
   const d = new Date(date);
   d.setUTCHours(0, 0, 0, 0);
   return d;
}

function differenceInDays(date1: Date, date2: Date): number {
   const start1 = startOfDayUTC(date1);
   const start2 = startOfDayUTC(date2);
   const diffMs = start1.getTime() - start2.getTime();
   return Math.floor(diffMs / (24 * 60 * 60 * 1000));
}

export function calculateDailyStreak(lastDaily: Date | null | undefined, currentStreak: number): StreakResult {
   const now = new Date();

   if (!lastDaily) {
      return { canClaim: true, newStreak: 1 };
   }

   const daysDiff = differenceInDays(now, lastDaily);

   if (daysDiff === 0) {
      return { canClaim: false, newStreak: currentStreak, message: 'Ya has reclamado tu recompensa diaria hoy.' };
   }

   if (daysDiff === 1) {
      return { canClaim: true, newStreak: currentStreak + 1 };
   }

   return { canClaim: true, newStreak: 1 };
}

export function calculateWeeklyStreak(lastWeekly: Date | null | undefined, currentStreak: number): StreakResult {
   const now = new Date();

   if (!lastWeekly || lastWeekly.getTime() === 0) {
      return { canClaim: true, newStreak: 1 };
   }

   const timeDiff = now.getTime() - lastWeekly.getTime();
   const daysDiff = timeDiff / (24 * 60 * 60 * 1000);

   if (daysDiff < 7) {
      const remaining = 7 * 24 * 60 * 60 * 1000 - timeDiff;
      const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
      const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
      const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

      return {
         canClaim: false,
         newStreak: currentStreak,
         message: `Debes esperar ${days}d ${hours}h ${minutes}m para reclamar tu recompensa semanal.`,
      };
   }

   if (daysDiff < 14) {
      return { canClaim: true, newStreak: currentStreak + 1 };
   }

   return { canClaim: true, newStreak: 1 };
}

export function formatNumber(num: number): string {
   return num.toLocaleString('es-ES');
}

export function buildRewardMessage(params: {
   baseAmount: number;
   multiplier: number;
   finalAmount: number;
   streak: number;
   balance: number;
   type: 'daily' | 'weekly';
}): string {
   const { baseAmount, multiplier, finalAmount, streak, balance, type } = params;
   const unit = type === 'daily' ? 'días' : 'semanas';
   const milestone = getNextMilestone(streak, type);

   const lines = [
      `🎉 **+${formatNumber(finalAmount)}** gramos de cocaína (${formatNumber(baseAmount)} base × ${multiplier})`,
      `🔥 **Racha actual:** ${streak} ${unit}`,
      `💰 **Balance total:** ${formatNumber(balance)}`,
   ];

   if (milestone) {
      const remaining = milestone.remaining;
      const unitSingular = type === 'daily' ? 'día' : 'semana';
      const unitPlural = type === 'daily' ? 'días' : 'semanas';
      const unitText = remaining === 1 ? unitSingular : unitPlural;
      lines.push(`📈 ¡${remaining} ${unitText} más para alcanzar x${milestone.nextMultiplier}!`);
   } else {
      lines.push(`🏆 ¡Has alcanzado el multiplicador máximo!`);
   }

   return lines.join('\n');
}
