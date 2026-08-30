"use client"

import { useRouter } from "next/navigation"

type Props = {
  id: string
}

export default function DeleteButton({ id }: Props) {
  const router = useRouter()

  async function handleDelete() {
    const ok = confirm("Are you sure you want to delete this category?")

    if (!ok) return

    const res = await fetch(`/api/categories/${id}`, {
      method: "DELETE",
    })

    if (res.ok) {
      alert("Delete successfully!")
      router.push("/categories")
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