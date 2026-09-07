"use client";

import { Button } from "./button";
import { format, isValid, parseISO } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import * as React from "react";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "../lib/utils";

interface DatePickerProps {
  className?: string;
  disabled?: boolean;
  onChange?: (date: string) => void;
  placeholder?: string;
  value?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled,
}: DatePickerProps) {
  const date = value ? parseISO(value) : undefined;
  const isDateValid = date && isValid(date);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "w-full justify-start text-left font-normal",
            !isDateValid && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          variant={"outline"}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isDateValid ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          captionLayout="dropdown"
          endMonth={new Date(new Date().getFullYear() + 10, 11)}
          initialFocus
          mode="single"
          onSelect={(newDate) => {
            if (newDate) {
              // Format as YYYY-MM-DD for consistency with native date inputs
              onChange?.(format(newDate, "yyyy-MM-dd"));
            } else {
              onChange?.("");
            }
          }}
          selected={isDateValid ? date : undefined}
          startMonth={new Date(1900, 0)}
        />
      </PopoverContent>
    </Popover>
  );
}
