import React from 'react'
import { ActiveLink } from '../ActiveLink'
import {SingInButton} from '../SingInButton'

import styles from './styles.module.scss'

export const Header = () => {
  return(
    <header className={styles.headerContainer} >
      <div className={styles.headerContent} >
        <h2>dev.news</h2>
        <nav>
          <ActiveLink 
            href="/"
            activeClassName={styles.active}
            >
            <a className={styles.active}>Home</a>
          </ActiveLink>
          <ActiveLink 
            href="/posts" 
            activeClassName={styles.active}
            prefetch>
            <a>Posts</a>
          </ActiveLink>
        </nav>
        <SingInButton />
      </div>
    </header>
  )
}