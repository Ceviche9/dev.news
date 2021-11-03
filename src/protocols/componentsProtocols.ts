import React, { ReactElement } from "react"
import Link, {LinkProps} from 'next/link'

export type SubscribeButtonProps = {
  priceId: string
}

export interface ActiveLinkProps extends LinkProps {
  children: ReactElement
  activeClassName: string
}