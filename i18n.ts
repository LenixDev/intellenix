import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import translation from './locales/en.json'
import { raise } from 'lenix'

i18next
	.use(initReactI18next)
	.init({ resources: { en: { translation } }, lng: 'en', fallbackLng: 'en' })
	.catch(raise)

export default i18next
