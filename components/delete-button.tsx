"use client"

import { useRouter } from "next/navigation"

type Props = {
  id: string
}

export default function DeleteButton({ id }: Props) {
  const router = useRouter()

  async function handleDelete() {
    const ok = confirm(
      "Are you sure you want to delete this article?"
    )

    if (!ok) return

    try {
      const res = await fetch("/api/articles/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
        }),
      })

      if (res.ok) {
        alert("Delete successfully!")
        router.push("/articles")
        router.refresh()
      } else {
        const message = await res.text()
        console.error("Delete failed:", message)
        alert("Delete failed!")
      }
    } catch (error) {
      console.error("Delete error:", error)
      alert("Delete failed!")
    }
  }

  return (
    <a
      href="#"
      onClick={(e) => {
        e.preventDefault()
        handleDelete()
      }}
      style={{
        color: "#d32f2f",
        textDecoration: "none",
        cursor: "pointer",
        fontWeight: 500,
      }}
    >
      Delete
    </a>
  )
}