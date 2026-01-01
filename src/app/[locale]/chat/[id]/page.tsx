'use client'

export default async function ChatIdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  console.log(id)

  return (
    <main className="flex flex-1 flex-col overflow-hidden p-4 pt-0">123</main>
  )
}
