import { useState } from "react";
import { format, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DateRange } from "@/lib/dashboard-analytics";

interface DateRangeFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (dateRange: DateRange) => void;
  className?: string;
}

// Predefined date range presets
const DATE_PRESETS = [
  {
    label: "Last 7 days",
    value: "7d",
    getRange: () => ({
      from: subDays(new Date(), 7),
      to: new Date()
    })
  },
  {
    label: "Last 30 days", 
    value: "30d",
    getRange: () => ({
      from: subDays(new Date(), 30),
      to: new Date()
    })
  },
  {
    label: "Last 3 months",
    value: "3m",
    getRange: () => ({
      from: subDays(new Date(), 90),
      to: new Date()
    })
  },
  {
    label: "This month",
    value: "tm",
    getRange: () => ({
      from: startOfMonth(new Date()),
      to: endOfMonth(new Date())
    })
  },
  {
    label: "Last month",
    value: "lm", 
    getRange: () => {
      const lastMonth = subDays(startOfMonth(new Date()), 1);
      return {
        from: startOfMonth(lastMonth),
        to: endOfMonth(lastMonth)
      };
    }
  },
  {
    label: "This year",
    value: "ty",
    getRange: () => ({
      from: startOfYear(new Date()),
      to: endOfYear(new Date())
    })
  },
  {
    label: "Last year",
    value: "ly",
    getRange: () => {
      const lastYear = new Date(new Date().getFullYear() - 1, 0, 1);
      return {
        from: startOfYear(lastYear),
        to: endOfYear(lastYear)
      };
    }
  }
];

export default function DateRangeFilter({ 
  dateRange, 
  onDateRangeChange, 
  className 
}: DateRangeFilterProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("30d");
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (presetValue: string) => {
    const preset = DATE_PRESETS.find(p => p.value === presetValue);
    if (preset) {
      const newRange = preset.getRange();
      onDateRangeChange(newRange);
      setSelectedPreset(presetValue);
    }
  };

  const handleCustomDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (range?.from && range?.to) {
      onDateRangeChange({
        from: range.from,
        to: range.to
      });
      setSelectedPreset("custom");
      setIsOpen(false);
    }
  };

  const formatDateRange = () => {
    if (!dateRange.from || !dateRange.to) {
      return "Select date range";
    }
    
    const preset = DATE_PRESETS.find(p => p.value === selectedPreset);
    if (preset && selectedPreset !== "custom") {
      return preset.label;
    }
    
    return `${format(dateRange.from, "MMM d, yyyy")} - ${format(dateRange.to, "MMM d, yyyy")}`;
  };

  const getDaysCount = () => {
    if (!dateRange.from || !dateRange.to) return 0;
    return Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className={cn("flex items-center gap-3", className)} data-testid="date-range-filter">
      {/* Quick Preset Selector */}
      <Select value={selectedPreset} onValueChange={handlePresetChange}>
        <SelectTrigger className="w-[180px]" data-testid="select-date-preset">
          <SelectValue placeholder="Select period" />
        </SelectTrigger>
        <SelectContent>
          {DATE_PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom Range</SelectItem>
        </SelectContent>
      </Select>

      {/* Custom Date Range Picker */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal min-w-[240px]",
              !dateRange && "text-muted-foreground"
            )}
            data-testid="button-custom-date-range"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
            <ChevronDown className="ml-auto h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            selected={{
              from: dateRange.from,
              to: dateRange.to
            }}
            onSelect={handleCustomDateSelect}
            numberOfMonths={2}
            disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {/* Date Range Info Badge */}
      {dateRange.from && dateRange.to && (
        <Badge variant="outline" className="text-xs whitespace-nowrap" data-testid="badge-date-range-info">
          {getDaysCount()} day{getDaysCount() !== 1 ? 's' : ''}
        </Badge>
      )}

      {/* Reset Button */}
      {selectedPreset !== "30d" && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => handlePresetChange("30d")}
          className="text-xs"
          data-testid="button-reset-date-range"
        >
          Reset
        </Button>
      )}
    </div>
  );
}