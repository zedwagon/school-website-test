import * as React from "react"
import { NumericFormat, type NumericFormatProps } from "react-number-format"
import { Input } from "./input"
import { cn } from "../lib/utils"

export type CurrencyInputProps = NumericFormatProps & {
  className?: string;
  hideSymbol?: boolean;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, hideSymbol, ...props }, ref) => {
    return (
      <div className="relative">
        {!hideSymbol && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none pointer-events-none">
            ₱
          </span>
        )}
        <NumericFormat
          customInput={Input}
          getInputRef={ref}
          thousandSeparator=","
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          className={cn(!hideSymbol && "pl-7", className)}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"
