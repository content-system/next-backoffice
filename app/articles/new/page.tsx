import { BackButton } from "@components/client"
import { Input, SubmitButton } from "@components/form"

export default function NewArticle() {
  return (
    <form className="form">
  <header>
    <BackButton
      id="backBtn"
      name="backBtn"
      className="btn-back"
    />

    <h2>New Article</h2>
  </header>

  <div className="row">

    <label className="col s12 m6 required">
      ID
      <Input
        id="id"
        name="id"
        type="text"
        required
        maxLength={40}
      />
    </label>

    <label className="col s12 m6">
      Slug
      <Input
        id="slug"
        name="slug"
        type="text"
        maxLength={150}
      />
    </label>

    <label className="col s12 required">
      Title
      <Input
        id="title"
        name="title"
        type="text"
        required
        maxLength={255}
      />
    </label>

    <div className="col s12 required">
  <label htmlFor="description">Description</label>
  <textarea
    id="description"
    name="description"
    rows={4}
    style={{ width: "100%" }}
  />
</div>
<div className="col s12 required">
  <label htmlFor="content">Content</label>
  <textarea
    id="content"
    name="content"
    rows={10}
    style={{ width: "100%" }}
  />
</div>

  </div>

  <footer>
    <SubmitButton
  id="btnSubmit"
  name="btnSubmit"
  type="submit"
  api="/api/articles"
>
  Submit
</SubmitButton>
  </footer>

</form>

  )
}