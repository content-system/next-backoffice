import { Error } from "@components/error"
import { SubmitButton } from "@components/form"
import { getCurrentUser } from "@lib/account"
import { logError } from "@lib/logger"
import { getResource } from "@resources"
import { getItemService } from "@service/settings"

export default async function SettingsForm() {
  const account = await getCurrentUser()
  const resource = getResource(account?.language)

  const itemService = getItemService()
  try {
    const languages = await itemService.load("language")
    const dateFormats = await itemService.load("date_format")
    return (
      <form id="settingsForm" name="settingsForm" className="form" noValidate={true}>
        <header>
          <h2>{resource.currency}</h2>
        </header>
        <div className="row">
          <label className="col s12 m6 required">
            {resource.language}
            <select id="language" name="language" defaultValue={account?.language} required={true}>
              {languages.map((item, i) => {
                return (
                  <option key={item.value} value={item.value}>
                    {item.text}
                  </option>
                )
              })}
            </select>
          </label>
          <label className="col s12 m6 required">
            {resource.date_format}
            <select id="dateFormat" name="dateFormat" defaultValue={account?.dateFormat} required={true}>
              {dateFormats.map((item, i) => {
                return (
                  <option key={item.value} value={item.value}>
                    {item.text}
                  </option>
                )
              })}
            </select>
          </label>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api="/api/settings"
            confirmMessage={resource.msg_confirm_save}
            successMessage={resource.msg_save_success}
            forbiddenError={resource.error_403}
            parsingError={resource.error_response_body}
            networkError={resource.error_network}
            conflictError={resource.error_409}
            goneError={resource.error_410}
          >
            {resource.submit}
          </SubmitButton>
        </footer>
      </form>
    )
  } catch (err) {
    logError(err)
    return <Error title={resource.error_500_title} message={resource.error_500_message} />
  }
}
