import { format, parse } from "date-fns"
import { ko } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type ScheduleDatePickerFieldProps = {
  value: string
  onChange: (value: string) => void
}

function parseDateString(dateString: string) {
  return parse(dateString, "yyyy-MM-dd", new Date())
}

export function ScheduleDatePickerField({
  value,
  onChange,
}: ScheduleDatePickerFieldProps) {
  const selectedDate = value ? parseDateString(value) : undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start font-normal"
        >
          {selectedDate
            ? format(selectedDate, "yyyy년 M월 d일", { locale: ko })
            : "날짜를 선택하세요"}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          locale={ko}
          selected={selectedDate}
          onSelect={(date) => {
            if (!date) return
            onChange(format(date, "yyyy-MM-dd"))
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}
