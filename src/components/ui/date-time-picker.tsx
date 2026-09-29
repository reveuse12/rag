'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DateTimePickerProps {
  value: string; // ISO or YYYY-MM-DDTHH:mm format
  onChange: (isoString: string) => void;
  className?: string;
  placeholder?: string;
  minDate?: Date;
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export function DateTimePicker({
  value,
  onChange,
  className,
  placeholder = 'Select date & time...',
  minDate = new Date(),
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse initial selected date or default to next day 6:00 PM
  const initialDate = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());
  
  // Time state (12-hour format)
  const initialHours = initialDate.getHours();
  const [hour, setHour] = useState(initialHours % 12 === 0 ? 12 : initialHours % 12);
  const [minute, setMinute] = useState(Math.floor(initialDate.getMinutes() / 15) * 15);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialHours >= 12 ? 'PM' : 'AM');

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Compute ISO date string and notify parent
  const emitDateTime = (
    y: number,
    m: number,
    d: number,
    h: number,
    min: number,
    p: 'AM' | 'PM'
  ) => {
    let militaryHour = h % 12;
    if (p === 'PM') militaryHour += 12;

    const dateObj = new Date(y, m, d, militaryHour, min, 0, 0);
    onChange(dateObj.toISOString());
  };

  // Calendar helpers
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    setSelectedDay(day);
    emitDateTime(selectedYear, selectedMonth, day, hour, minute, period);
  };

  const handleHourChange = (newHour: number) => {
    setHour(newHour);
    emitDateTime(selectedYear, selectedMonth, selectedDay, newHour, minute, period);
  };

  const handleMinuteChange = (newMinute: number) => {
    setMinute(newMinute);
    emitDateTime(selectedYear, selectedMonth, selectedDay, hour, newMinute, period);
  };

  const handlePeriodChange = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
    emitDateTime(selectedYear, selectedMonth, selectedDay, hour, minute, newPeriod);
  };

  // Preset Shortcuts
  const applyPreset = (daysFromNow: number, targetHour: number, targetMinute: number, p: 'AM' | 'PM') => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + daysFromNow);
    setSelectedYear(targetDate.getFullYear());
    setSelectedMonth(targetDate.getMonth());
    setSelectedDay(targetDate.getDate());
    setHour(targetHour);
    setMinute(targetMinute);
    setPeriod(p);
    emitDateTime(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), targetHour, targetMinute, p);
  };

  // Format label for button
  const formattedLabel = value
    ? (() => {
        try {
          const d = new Date(value);
          return d.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          });
        } catch (e) {
          return placeholder;
        }
      })()
    : placeholder;

  return (
    <div className={cn('relative w-full', className)} ref={containerRef}>
      {/* ShadCN Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl border border-input bg-background hover:bg-muted/50 text-foreground text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary shadow-2xs transition-all text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon className="w-4 h-4 text-primary shrink-0" />
          <span className={cn(value ? 'text-foreground font-semibold' : 'text-muted-foreground')}>
            {formattedLabel}
          </span>
        </div>
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0 ml-2" />
      </button>

      {/* Popover Dropdown Calendar & Time Picker */}
      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 rounded-3xl bg-card border border-border shadow-2xl w-[320px] sm:w-[350px] animate-in fade-in zoom-in-95 duration-150 right-0 sm:left-0">
          {/* Quick Presets */}
          <div className="flex items-center gap-1.5 pb-3 mb-3 border-b border-border/60 overflow-x-auto scrollbar-none">
            <button
              type="button"
              onClick={() => applyPreset(1, 9, 0, 'AM')}
              className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-[10px] font-bold text-muted-foreground whitespace-nowrap transition-colors"
            >
              Tomorrow 9 AM
            </button>
            <button
              type="button"
              onClick={() => applyPreset(1, 6, 30, 'PM')}
              className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-[10px] font-bold text-muted-foreground whitespace-nowrap transition-colors"
            >
              Tomorrow 6:30 PM
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                const daysUntilSaturday = (6 - now.getDay() + 7) % 7 || 7;
                applyPreset(daysUntilSaturday, 5, 30, 'PM');
              }}
              className="px-2.5 py-1 rounded-lg bg-muted hover:bg-primary/10 hover:text-primary text-[10px] font-bold text-muted-foreground whitespace-nowrap transition-colors"
            >
              This Saturday
            </button>
          </div>

          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-3 px-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-xs font-heading text-foreground">
              {MONTH_NAMES[selectedMonth]} {selectedYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Days of Week Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {DAYS_OF_WEEK.map((day) => (
              <span key={day} className="text-[10px] font-bold text-muted-foreground/70">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center mb-4">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-7 w-7" />
            ))}

            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected =
                day === selectedDay &&
                selectedMonth === initialDate.getMonth() &&
                selectedYear === initialDate.getFullYear();

              const currentDate = new Date(selectedYear, selectedMonth, day, 23, 59, 59);
              const isPast = currentDate < minDate;

              return (
                <button
                  key={day}
                  type="button"
                  disabled={isPast}
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'h-7 w-7 rounded-lg text-xs font-semibold flex items-center justify-center transition-all mx-auto',
                    isSelected
                      ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                      : isPast
                      ? 'text-muted-foreground/30 cursor-not-allowed'
                      : 'hover:bg-muted text-foreground'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time Picker Section */}
          <div className="pt-3 border-t border-border/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-muted-foreground flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-primary" /> Time of Meetup
              </span>
              <span className="text-xs font-black text-primary">
                {hour}:{minute.toString().padStart(2, '0')} {period}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Hour Selector */}
              <div>
                <label className="block text-[10px] text-muted-foreground mb-0.5">Hour</label>
                <select
                  value={hour}
                  onChange={(e) => handleHourChange(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {Array.from({ length: 12 }).map((_, i) => {
                    const h = i + 1;
                    return (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Minute Selector */}
              <div>
                <label className="block text-[10px] text-muted-foreground mb-0.5">Minute</label>
                <select
                  value={minute}
                  onChange={(e) => handleMinuteChange(Number(e.target.value))}
                  className="w-full px-2 py-1.5 rounded-lg border border-input bg-background text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                >
                  {[0, 15, 30, 45].map((m) => (
                    <option key={m} value={m}>
                      {m.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              {/* AM/PM Toggle */}
              <div>
                <label className="block text-[10px] text-muted-foreground mb-0.5">Period</label>
                <div className="flex rounded-lg border border-input overflow-hidden bg-background">
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('AM')}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-bold transition-colors',
                      period === 'AM'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePeriodChange('PM')}
                    className={cn(
                      'flex-1 py-1.5 text-xs font-bold transition-colors',
                      period === 'PM'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    )}
                  >
                    PM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Confirm Button */}
          <div className="mt-3 pt-2">
            <Button
              size="xs"
              type="button"
              onClick={() => setIsOpen(false)}
              className="w-full bg-primary text-primary-foreground text-xs font-bold h-8"
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
