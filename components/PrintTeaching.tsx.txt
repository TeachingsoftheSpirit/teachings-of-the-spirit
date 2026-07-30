'use client'

export default function PrintTeaching() {
  return (
    <button
      type="button"
      data-print-hide
      onClick={() => window.print()}
      title="Print this Teaching"
      className="text-[12px] text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
    >
      Print
    </button>
  )
}