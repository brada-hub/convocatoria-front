
import { ref } from 'vue'
import { useQuasar } from 'quasar'

// Constantes de configuración (inyectadas vía variable de entorno)
const API_KEY = process.env.GOOGLE_API_KEY
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const SCOPES = 'https://www.googleapis.com/auth/drive.file'
// Discovery doc para API de Drive
const DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'

let tokenClient = null
let gapiInited = false
let gisInited = false

export function useGoogleDrive() {
  const $q = useQuasar()
  const isLoaded = ref(false)
  const isPicking = ref(false)

  // Cargar scripts dinámicamente si no existen
  let loadingPromise = null

  const loadGoogleScripts = () => {
    if (gapiInited && gisInited) return Promise.resolve(true)
    if (loadingPromise) return loadingPromise

    loadingPromise = new Promise((resolve, reject) => {
      // Cargar API Client (GAPI)
      const scriptGapi = document.createElement('script')
      scriptGapi.src = 'https://apis.google.com/js/api.js'
      scriptGapi.onload = () => {
        window.gapi.load('client:picker', async () => {
          try {
            await window.gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: [DISCOVERY_DOC],
            })
            gapiInited = true
            checkLoaded(resolve)
          } catch (err) {
            reject(err)
          }
        })
      }
      scriptGapi.onerror = reject
      document.body.appendChild(scriptGapi)

      // Cargar Identity Services (GIS)
      const scriptGis = document.createElement('script')
      scriptGis.src = 'https://accounts.google.com/gsi/client'
      scriptGis.onload = () => {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES,
          callback: '', // definido dinámicamente
        })
        gisInited = true
        checkLoaded(resolve)
      }
      scriptGis.onerror = reject
      document.body.appendChild(scriptGis)
    })
    return loadingPromise
  }

  const checkLoaded = (resolve) => {
    if (gapiInited && gisInited) {
      isLoaded.value = true
      resolve(true)
    }
  }

  // Descargar archivo desde Drive para obtener el Blob (Backend Safe)
  const downloadFile = async (fileId, accessToken) => {
    try {
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      })
      if (!response.ok) throw new Error('Error descargando archivo')
      return await response.blob()
    } catch (e) {
      console.error(e)
      throw e
    }
  }

  // Abrir Selector
  const openDrivePicker = async (onFileSelected, mimeTypes = 'application/pdf') => {
    if (!API_KEY || !CLIENT_ID) {
      $q.notify({ type: 'negative', message: 'Falta configuración de Google API' })
      return
    }

    isPicking.value = true

    // Asegurar que scripts estén cargados
    await loadGoogleScripts()

    // 1. Pedir Token (Auth Popup)
    tokenClient.callback = async (response) => {
      if (response.error !== undefined) {
        $q.notify({ type: 'negative', message: 'Error de autenticación Google' })
        isPicking.value = false
        throw (response)
      }
      createPicker(response.access_token, onFileSelected, mimeTypes)
    }

    // Si no tenemos token válido o queremos asegurar permisos, pedimos token
    // Prompt only if needed normally, but for Picker we need fresh usually
    tokenClient.requestAccessToken({ prompt: '' })
  }

  const createPicker = (accessToken, onFileSelected, mimeTypes) => {
    const view = new window.google.picker.View(window.google.picker.ViewId.DOCS)
    view.setMimeTypes(mimeTypes)

    const picker = new window.google.picker.PickerBuilder()
      .enableFeature(window.google.picker.Feature.NAV_HIDDEN)
      .setDeveloperKey(API_KEY)
      .setAppId(CLIENT_ID)
      .setOAuthToken(accessToken)
      .addView(view)
      // .addView(new window.google.picker.DocsUploadView()) // Opción para subir, si se desea
      .setCallback(async (data) => {
        if (data.action === window.google.picker.Action.PICKED) {
          const doc = data.docs[0]
          const fileId = doc.id
          const fileName = doc.name

          $q.loading.show({ message: 'Descargando desde Drive...' })

          try {
            // Descargar el binario real
            const blob = await downloadFile(fileId, accessToken)
            const jsFile = new File([blob], fileName, { type: 'application/pdf' })

            onFileSelected(jsFile)
            $q.notify({ type: 'positive', message: 'Archivo de Drive importado correctamente' })
          } catch {
            $q.notify({ type: 'negative', message: 'Error al importar desde Drive' })
          } finally {
            $q.loading.hide()
            isPicking.value = false
          }
        } else if (data.action === window.google.picker.Action.CANCEL) {
          isPicking.value = false
        }
      })
      .build()
    picker.setVisible(true)
  }

  return {
    openDrivePicker,
    loadGoogleScripts, // Exponer para precarga
    isPicking
  }
}
