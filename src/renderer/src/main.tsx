// import './assets/main.css'
import '../../index.css'
// Supports weights 100-900
import '@fontsource-variable/inter'

import { render } from 'solid-js/web'
import App from './App'

render(() => <App />, document.getElementById('root') as HTMLElement)
