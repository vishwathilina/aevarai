import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  endTime: Date;
  className?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const CountdownTimer = ({ endTime, className }: CountdownTimerProps) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - Date.now();
      
      if (difference <= 0) {
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);
      setIsUrgent(newTimeLeft.days === 0 && newTimeLeft.hours < 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  const TimeBlock = ({ value, label }: { value: number; label: string }) => (
    <div className="text-center">
      <div className={cn(
        "text-2xl md:text-3xl font-bold font-serif tabular-nums",
        isUrgent && "text-destructive"
      )}>
        {value.toString().padStart(2, '0')}
      </div>
      <div className="text-xs text-muted-foreground uppercase tracking-wider">
        {label}
      </div>
    </div>
  );

  return (
    <div className={cn("bg-muted/50 rounded-xl p-6", className)}>
      <div className="flex items-center justify-center gap-2 mb-4">
        <Clock className={cn("h-5 w-5", isUrgent && "text-destructive animate-pulse")} />
        <span className={cn("font-medium", isUrgent && "text-destructive")}>
          {isUrgent ? "Ending soon!" : "Time remaining"}
        </span>
      </div>
      
      <div className="flex items-center justify-center gap-4 md:gap-6">
        <TimeBlock value={timeLeft.days} label="Days" />
        <span className="text-2xl text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.hours} label="Hours" />
        <span className="text-2xl text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.minutes} label="Mins" />
        <span className="text-2xl text-muted-foreground">:</span>
        <TimeBlock value={timeLeft.seconds} label="Secs" />
      </div>
    </div>
  );
};

export default CountdownTimer;
