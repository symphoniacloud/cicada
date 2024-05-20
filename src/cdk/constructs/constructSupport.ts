export interface ConstructNaming {
  name: string
  prefix?: string
}

export interface NamingProps {
  // If defined use custom names on resources, otherwise use CDK-generated names
  readonly naming?: ConstructNaming
}

interface ResourceNameProps extends NamingProps {
  resource?: string
}

// TODO - needs testing
export function resourceName(props: ResourceNameProps | undefined) {
  if (props && props.naming) {
    const prefix = props.naming.prefix ? `${props.naming.prefix}-` : ''
    const resource = props.resource ? `-${props.resource}` : ''
    return `${prefix}${props.naming.name}${resource}`
  }
  return undefined
}
