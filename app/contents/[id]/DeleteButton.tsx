"use client"

import { useRouter } from "next/navigation"

type Props = {
  id: string
  lang: string
}

export default function DeleteButton({ id, lang }: Props) {
  const router = useRouter()

  async function handleDelete() {
    const ok = confirm("Are you sure you want to delete this content?")

    if (!ok) return

    const res = await fetch("/api/contents/delete", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({id,lang,}),
    })

    if (res.ok) {
      alert("Delete successfully!")
      router.push("/contents")
      router.refresh()
    } else {
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