type Props = {
  searchParams: {
    tab?: string
  }
}

async function getData(tab: string) {
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/${tab}`
  )

  return res.json()
}

export default async function SettingsPage({
  searchParams,
}: Props) {
  const tab =
    searchParams.tab || 'todos'

  const data = await getData(tab)

  return (
    <div>
      <h1>Current tab: {tab}</h1>

      <pre>
        {JSON.stringify(
          data.slice(0, 3),
          null,
          2
        )}
      </pre>
    </div>
  )
}