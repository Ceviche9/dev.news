import React, {cloneElement} from 'react'
import Link from "next/link"
import { useRouter } from 'next/router'
import { ActiveLinkProps } from "../../protocols/componentsProtocols"

export const ActiveLink = ({children, activeClassName, ...rest}: ActiveLinkProps) => {
  // Para saber qual rota está sendo acessada.
  const { asPath } = useRouter()

  // Verificando se a rota é igual ao href do link para adicionar a classe.
  const className = asPath === rest.href
    ? activeClassName
    : '';

  return(
    <Link {...rest}>
      {
        // Utilizando o cloneElemente é possivel modificar o comportamento de um elemento filho.
        // Nesse caso, uma classe está sendo adicionada ao componente.
        cloneElement(children, {
          className
        })}
    </Link>
  )
}