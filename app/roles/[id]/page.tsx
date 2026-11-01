import { BackButton } from "@components/client"
import { Error } from "@components/error"
import { Input, SubmitButton } from "@components/form"
import { formatText } from "@components/ui"
import { getCurrentUser } from "@lib/account"
import { authorize, hasPrivilege } from "@lib/authorizor"
import { logError, logForbidden, logger } from "@lib/logger"
import { getResource, Status } from "@resources"
import { getPrivilegesReader, getRoleService, Role } from "@service/role"
import { create, read, write } from "web-one"

interface Privilege {
  id: string
  name: string
  actions: number
  children?: Privilege[]
}
interface Permission {
  id: string
  actions: number
  permissions: number
}

interface ShownItem {
  action: number
  shown: boolean
}
function buildAll(privileges: string[], all: Privilege[]): void {
  for (const root of all) {
    privileges.push(root.id)
    if (root.children && root.children.length > 0) {
      buildAll(privileges, root.children)
    }
  }
}

function buildActionAll(actions: Map<string, number>, all: Privilege[]): void {
  for (const root of all) {
    actions.set(root.id, +root.actions)
    if (root.children && root.children.length > 0) {
      buildActionAll(actions, root.children)
    }
  }
}

function getMax(map: Map<string, number>): number {
  let max = -Infinity
  map.forEach((value, key) => {
    if (value > max) {
      max = value
    }
  })
  return max
}

function mergeArray(dest: Permission[], src: Permission[], allowPermission0?: Boolean) {
  for (let i = 0; i < src.length; i++) {
    const item = src[i]
    const index = dest.findIndex((k) => k.id === item.id)
    if (index !== -1) {
      dest.splice(index, 1)
    }
    if (allowPermission0) {
      dest.push(item)
    } else {
      if (item.permissions > 0) {
        dest.push(item)
      }
    }
  }
}

function isChecked(id: string, privileges: Permission[]): boolean {
  if (!privileges) return false
  return privileges && privileges.find((item) => item.id === id && item.permissions > 0) ? true : false
}
function isCheckedAll(privileges: string[] | undefined, all: string[]): boolean | undefined {
  const checkedAll = privileges && all && privileges.length === all.length
  return checkedAll
}

function checked(id: string, action: number, privileges: Permission[]): boolean {
  const privilege = privileges.find((item) => item.id === id)
  if (!privilege) return false
  return Boolean(privilege?.permissions & action)
}

function bitwiseAnd(numbers: number[], result: number): number {
  for (let num of numbers) {
    result &= num
  }
  return result
}

function mapPermissionOfParent(id: string, childPermissions: Permission[], actions: Map<string, number>) {
  const groupActionAndPermission = new Map<number, number[]>()
  // check permission of parent
  let permission = 0
  if (childPermissions.length === 1) {
    permission = childPermissions[0].permissions
  } else {
    for (let i = 0; i < childPermissions.length; i++) {
      const item = childPermissions[i]
      let a = groupActionAndPermission.get(item.actions) || []
      a.push(item.permissions)
      groupActionAndPermission.set(item.actions, a)
    }
    groupActionAndPermission.forEach((value, key) => {
      const f = bitwiseAnd(value, key)
      permission = permission | f
    })
  }
  const maxAction = actions.get(id) || 0
  childPermissions.push({ id: id, actions: maxAction, permissions: permission & maxAction })
  return childPermissions
}

function mapPermission(actions: Map<string, number>, item: Permission, pCheckedValue: number, uChecked: boolean): Permission {
  const actionMax = actions.get(item.id) || 1
  const id = item.id
  let v = item.permissions | pCheckedValue
  if (!uChecked) {
    if (pCheckedValue === 1) {
      v = item.permissions & 0 // OR
    } else {
      v = item.permissions ^ pCheckedValue // XOR
    }
  }
  if (pCheckedValue > actionMax) {
    return { id: item.id, actions: actionMax, permissions: actionMax }
  }
  return { id: id, actions: actionMax, permissions: v }
}

function getColumns(maxAction: number): number[] {
  let i = 0
  let total = 0
  let rs = []
  while (total < maxAction) {
    const action = 1 << i
    total = total + action
    rs.push(action)
    i++
  }
  return rs
}

function binaryStringToArray(binaryString: string): string[] {
  // Use the split method to convert the binary string to an array of characters
  return binaryString.split("")
}

function decimalToBinary(decimal: number): string {
  // Convert decimal to binary using the toString method with base 2
  return (decimal >>> 0).toString(2)
}

function padLeft(str: string, num: number) {
  return str.padStart(num, "0")
}
function buildPermissions(actions: Map<string, number>, privileges?: string[]): Permission[] {
  if (!privileges || privileges.length === 0) {
    return []
  }
  return privileges.map((privilege) => {
    let permissions: number = 1
    const p = privilege.split(" ")
    if (p.length > 1) {
      permissions = +p[1] // convert string to number
    } else {
      permissions = 0
    }
    const id = p[0]
    return { id: id, actions: actions.get(id) || 0, permissions: permissions || 0 }
  })
}

export default async function RoleForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const newMode = id === Status.New
  const account = await getCurrentUser()
  const resource = getResource(account?.language)
  const permission = await authorize(1)
  const canRead = hasPrivilege(permission, read)
  const canWrite = hasPrivilege(permission, write)
  let privileges: Permission[] = []
  let seq = 1

  if (!canRead || (newMode && !canWrite)) {
    logForbidden(account)
    return <Error title={resource.error_403_title} message={resource.error_403_message} />
  }

  const isParentChecked = (id: string, child: Privilege[], privileges: Permission[], actions: Map<string, number>) => {
    if (!privileges) {
      return false
    }
    if (child === undefined) {
      return false
    }
    const ids = child?.filter((i) => i.id !== id).map((i) => i.id) || []
    if (privileges.length < ids.length) {
      return false
    }
    const checked = privileges.filter((item) => ids.includes(item.id) && item.permissions === actions.get(item.id))
    return checked.length === ids.length
  }

  const getColumnsOfRow = (action: number): ShownItem[] => {
    const maxActionAll = 16
    let binaryString = decimalToBinary(action)
    let maxLen = decimalToBinary(maxActionAll)
    binaryString = padLeft(binaryString, maxLen.length)
    let binaryArray = binaryStringToArray(binaryString)
    const cols = getColumns(action)
    binaryArray.reverse()
    return binaryArray.map((item, i) => {
      return { shown: item === "1", action: cols[i] }
    })
  }

  const service = getRoleService()
  try {
    let role: Role | null = create<Role>(Status.Active)
    if (!newMode) {
      role = await service.load(id)
      if (!role) {
        logger.warn(`Role not found: ${id}`)
        return <Error title={resource.error_404_title} message={resource.error_404_message} />
      }
    }
    const loader = getPrivilegesReader()
    const allPrivileges = await loader.privileges()
    const all: string[] = []
    const actions = new Map<string, number>()
    buildAll(all, allPrivileges as any)
    buildActionAll(actions, allPrivileges as any)
    privileges = buildPermissions(actions, role.privileges)

    const renderForms = (modules: Privilege[] | undefined, parentId: string, disabled: boolean, isChild?: boolean) => {
      if (!modules || modules.length === 0) {
        return ""
      }
      return modules.map((m) => renderForm(m, parentId, disabled, isChild))
    }

    const renderForm = (p: Privilege, parentId: string, disabled: boolean, isChild?: boolean) => {
      if (p.children && p.children.length > 0) {
        return (
          <div className={"row"} key={p.id}>
            <div className="row">
              <div className="flex-gap-2 col s4">
                {seq++} .
                <input type="checkbox" disabled={disabled} defaultChecked={isParentChecked(p.id, p.children, privileges, actions)} />
                <p>{p.name}</p>
                {resource.select_all}
              </div>
            </div>
            {renderForms(p.children, p.id, disabled, true)}
          </div>
        )
      } else {
        return (
          <div className={`row ${isChild && "sub-menu-level-2"}`} key={p.id}>
            <div className={`col s6 m3 inline flex-gap-2`}>
              {seq++} .<input type="checkbox" value={p.actions} disabled={disabled} defaultChecked={isChecked(p.id, privileges)}></input>
              <p>{p.name}</p>
            </div>
            {getColumnsOfRow(p.actions).map((item, index) => {
              const action = item.action
              const c = checked(p.id, action, privileges)
              return (
                <input
                  key={"item " + index}
                  value={action}
                  type="checkbox"
                  defaultChecked={item.shown ? c : false}
                  disabled={disabled}
                  className="col s1 m2 center"
                  style={{ visibility: item.shown ? "unset" : "hidden" }}
                ></input>
              )
            })}
          </div>
        )
      }
    }

    return (
      <form id="roleForm" name="roleForm" className="form" noValidate={true} data-required-error={resource.error_required}>
        <header>
          <BackButton id="backBtn" name="backBtn" className="btn-back" />
          <h2>{resource.role}</h2>
        </header>
        <div>
          <section className="row section">
            <label className="col s12 m6 required">
              {resource.role_id}
              <Input
                type="text"
                id="roleId"
                name="roleId"
                defaultValue={role.roleId}
                readOnly={!newMode}
                maxLength={100}
                required={true}
                requiredError={formatText(resource.error_required, resource.role_id)}
                placeholder={resource.role_id}
              />
            </label>
            <label className="col s12 m6 required">
              {resource.role_name}
              <Input
                type="text"
                id="roleName"
                name="roleName"
                defaultValue={role.roleName}
                maxLength={100}
                required={true}
                requiredError={formatText(resource.error_required, resource.role_name)}
                placeholder={resource.role_name}
              />
            </label>
            <label className="col s12 m6">
              {resource.remark}
              <Input type="text" id="remark" name="remark" defaultValue={role.remark} maxLength={120} placeholder={resource.email} />
            </label>
            <label className="col s12 m6">
              {resource.status}
              <div className="radio-group">
                <label>
                  <input type="radio" id="active" name="status" value={Status.Active} defaultChecked={role.status === Status.Active} />
                  {resource.active}
                </label>
                <label>
                  <input type="radio" id="inactive" name="status" value={Status.Inactive} defaultChecked={role.status === Status.Inactive} />
                  {resource.inactive}
                </label>
              </div>
            </label>
          </section>
          <section className="tree-view section">
            <div className="row">
              <div className="col s6 m4 inline flex-gap-2 col-header">
                <input type="checkbox" />
                <p>{resource.module}</p>
              </div>
              <p className="col s1 m2">{resource.read}</p>
              <p className="col s1 m2">{resource.write}</p>
              <p className="col s1 m2">{resource.delete}</p>
              <p className="col s1 m2">{resource.approve}</p>
            </div>
            {renderForms(allPrivileges as any, "", false)}
          </section>
        </div>
        <footer>
          <SubmitButton
            type="submit"
            id="btnSubmit"
            name="btnSubmit"
            api={`/api/roles/${id}`}
            confirmHeader={resource.header_confirm}
            confirmMessage={resource.msg_confirm_save}
            successMessage={resource.msg_save_success}
            errorHeader={resource.header_error}
            forbiddenError={resource.error_403}
            parsingError={resource.error_response_body}
            networkError={resource.error_network}
            conflictError={resource.error_409}
            goneError={resource.error_410}
            successUrl="back"
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
