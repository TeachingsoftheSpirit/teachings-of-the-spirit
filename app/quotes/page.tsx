{/* Quotes */}
<div className="space-y-16">
  {allQuotes.map((quote) => (
    <blockquote key={quote.id} className="border-none">
      <p className="text-[#2C2522] text-lg leading-[1.85] whitespace-pre-wrap mb-4">
        “{quote.quote_text}”
      </p>
      <footer className="text-sm text-[#6B5E54]">
        {quote.teaching_number ? (
          <Link
            href={`/teachings/${quote.teaching_number}`}
            className="hover:text-[#7A3E3E] transition-colors"
          >
            — {quote.title}
          </Link>
        ) : (
          <span>— {quote.title}</span>
        )}
        {quote.date && (
          <span> · {quote.date}</span>
        )}
      </footer>
    </blockquote>
  ))}
</div>