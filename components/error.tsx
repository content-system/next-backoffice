export interface Props {
  title: string
  message: string
  description?: string
}

export function Error(props: Props) {
  return (
    <div>
      <header>
        <h2>{props.title}</h2>
      </header>
      <div className="error-body">
        <h4 className="h4">{props.message}</h4>
        {props.description && <p>{props.description}</p>}
      </div>
    </div>
  )
}
