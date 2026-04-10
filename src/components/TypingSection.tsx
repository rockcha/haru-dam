import { useState, useEffect } from "react"
import { TypingAnimation } from "@/components/ui/typing-animation"
import { DAILY_MOTIVATIONS } from "@/constants/dailyMotivation"

export function TypingSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [key, setKey] = useState<number>(0)
  const motivation = DAILY_MOTIVATIONS[currentIndex]

  const typeSpeed = 150
  const pauseDelay = 5000

  useEffect(() => {
    const charCount = Array.from(motivation.text).length
    const cycleMs = charCount * typeSpeed + pauseDelay + 350

    const timeout = setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % DAILY_MOTIVATIONS.length)
      setKey((prev) => prev + 1)
    }, cycleMs)

    return () => clearTimeout(timeout)
  }, [motivation.text, typeSpeed, pauseDelay])

  return (
    <section className="flex h-24 w-full flex-col items-center justify-center py-4">
      <TypingAnimation
        key={key}
        typeSpeed={typeSpeed}
        pauseDelay={pauseDelay}
        className="text-center text-sm font-medium text-primary sm:text-xl"
      >
        {motivation.text}
      </TypingAnimation>
      <p className="mt-2 text-xs text-gray-400 sm:text-sm">
        - {motivation.author}
      </p>
    </section>
  )
}

export default TypingSection
