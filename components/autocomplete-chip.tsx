"use client"

import { KeyboardEvent, useState } from "react"

interface Props {
  id: string
  name: string
  values?: string[]
  suggestions?: string[]
  placeholder?: string
}

export function AutocompleteChip({ id, name, values = [], suggestions = [], placeholder }: Props) {
  const [selected, setSelected] = useState(values)
  const [input, setInput] = useState("")
  const normalizedInput = input.trim().toLocaleLowerCase()
  const matchingSuggestions = normalizedInput
    ? suggestions.filter((suggestion) => {
        const normalizedSuggestion = suggestion.toLocaleLowerCase()
        return normalizedSuggestion.includes(normalizedInput) && !selected.some((tag) => tag.toLocaleLowerCase() === normalizedSuggestion)
      })
    : []

  function addTag(value: string) {
    const tag = value.trim()
    if (!tag) {
      return
    }
    if (!selected.some((item) => item.toLocaleLowerCase() === tag.toLocaleLowerCase())) {
      setSelected((current) => [...current, tag])
    }
    setInput("")
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault()
      addTag(input)
    } else if (event.key === "Backspace" && input.length === 0 && selected.length > 0) {
      setSelected((current) => current.slice(0, -1))
    }
  }

  return (
    <div className="autocomplete-chip">
      <div className="chip-list" data-name={name}>
        {selected.map((tag) => (
          <span className="chip" data-value={tag} key={tag}>
            {tag}
            <button
              type="button"
              className="close"
              aria-label={`Remove ${tag}`}
              onClick={() => setSelected((current) => current.filter((item) => item !== tag))}
            />
          </span>
        ))}
      </div>
      <input
        id={id}
        type="text"
        value={input}
        placeholder={placeholder}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={matchingSuggestions.length > 0}
        aria-controls={`${id}-suggestions`}
        onChange={(event) => setInput(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          if (input.trim()) {
            addTag(input)
          }
        }}
      />
      {matchingSuggestions.length > 0 && (
        <ul id={`${id}-suggestions`} className="autocomplete-chip-suggestions" role="listbox">
          {matchingSuggestions.map((suggestion) => (
            <li key={suggestion} role="option" aria-selected={false}>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => addTag(suggestion)}>
                {suggestion}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
