export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#E5DFD3] bg-[#F7F4EF]">
      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-[#6B5E54]">
        
        <div>
          © 2026 Teachings of the Spirit, LLC. All rights reserved.
        </div>

        <div>
          <a
            href="mailto:hello@teachingsofthespirit.com"
            className="hover:text-[#2C2522] transition-colors underline-offset-2 hover:underline"
          >
            Write to Us
          </a>
        </div>

      </div>
    </footer>
  )
}