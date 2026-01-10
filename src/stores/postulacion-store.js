import { defineStore } from 'pinia'
import { api } from 'boot/axios'

export const usePostulacionStore = defineStore('postulacion', {
  state: () => ({
    // Estado del proceso
    step: 1,
    loading: false,
    error: null,

    // Datos del postulante
    ci: '',
    postulante: {
      nombres: '',
      apellidos: '',
      email: '',
      celular: '',
      foto_perfil: null,
    },
    esPostulanteExistente: false,
    tieneExpediente: false,

    // Convocatorias y ofertas
    convocatorias: [],
    convocatoriaActual: null,
    ofertasSeleccionadas: [],

    // Expediente
    formaciones: [],
    experiencias: [],
    capacitaciones: [],
    producciones: [],
    reconocimientos: [],

    // Resultado de postulación
    resultado: null,
  }),

  getters: {
    nombreCompleto: (state) =>
      `${state.postulante.nombres} ${state.postulante.apellidos}`.trim(),

    totalOfertasSeleccionadas: (state) =>
      state.ofertasSeleccionadas.length,

    expedienteCompleto: (state) =>
      state.formaciones.length > 0,

    ofertasAgrupadasPorSede: (state) => {
      if (!state.convocatoriaActual?.ofertas_por_sede) return []
      return state.convocatoriaActual.ofertas_por_sede
    },
  },

  actions: {
    // Resetear todo el estado
    reset() {
      this.step = 1
      this.ci = ''
      this.postulante = {
        nombres: '',
        apellidos: '',
        email: '',
        celular: '',
        foto_perfil: null,
      }
      this.esPostulanteExistente = false
      this.tieneExpediente = false
      this.ofertasSeleccionadas = []
      this.formaciones = []
      this.experiencias = []
      this.capacitaciones = []
      this.producciones = []
      this.reconocimientos = []
      this.resultado = null
    },

    // Cargar convocatorias abiertas
    async cargarConvocatorias() {
      this.loading = true
      try {
        const { data } = await api.get('/convocatorias/abiertas')
        this.convocatorias = data
      } catch (error) {
        this.error = 'Error al cargar convocatorias'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Cargar convocatoria específica
    async cargarConvocatoria(slug) {
      this.loading = true
      try {
        const { data } = await api.get(`/convocatorias/${slug}`)
        this.convocatoriaActual = data
        return data
      } catch (error) {
        this.error = 'Convocatoria no encontrada'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Verificar CI
    async verificarCI(ci) {
      this.loading = true
      this.error = null

      try {
        const { data } = await api.post('/check-ci', { ci })
        this.ci = ci

        if (data.status === 'existente') {
          this.esPostulanteExistente = true
          this.tieneExpediente = data.tiene_expediente

          // Cargar datos existentes
          const p = data.postulante
          this.postulante = {
            nombres: p.nombres,
            apellidos: p.apellidos,
            email: p.email || '',
            celular: p.celular,
            foto_perfil: p.foto_perfil,
          }

          // Cargar expediente existente
          this.formaciones = p.formaciones || []
          this.experiencias = p.experiencias || []
          this.capacitaciones = p.capacitaciones || []
          this.producciones = p.producciones || []
          this.reconocimientos = p.reconocimientos || []
        } else {
          this.esPostulanteExistente = false
          this.tieneExpediente = false
        }

        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al verificar CI'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Seleccionar/deseleccionar oferta
    toggleOferta(ofertaId) {
      const index = this.ofertasSeleccionadas.indexOf(ofertaId)
      if (index === -1) {
        this.ofertasSeleccionadas.push(ofertaId)
      } else {
        this.ofertasSeleccionadas.splice(index, 1)
      }
    },

    // Agregar registro a una sección
    agregarRegistro(seccion, datos) {
      this[seccion].push({ ...datos, _nuevo: true })
    },

    // Eliminar registro de una sección
    eliminarRegistro(seccion, index) {
      this[seccion].splice(index, 1)
    },

    // Enviar postulación completa
    async enviarPostulacion() {
      this.loading = true
      this.error = null

      try {
        // Construir FormData para archivos
        const formData = new FormData()

        // Datos básicos
        formData.append('ci', this.ci)
        formData.append('nombres', this.postulante.nombres)
        formData.append('apellidos', this.postulante.apellidos)
        formData.append('email', this.postulante.email || '')
        formData.append('celular', this.postulante.celular)

        // Foto de perfil
        if (this.postulante.foto_perfil instanceof File) {
          formData.append('foto_perfil', this.postulante.foto_perfil)
        }

        // Ofertas seleccionadas
        this.ofertasSeleccionadas.forEach((id, i) => {
          formData.append(`ofertas[${i}]`, id)
        })

        // Formaciones
        this.formaciones.forEach((item, i) => {
          formData.append(`formaciones[${i}][nivel]`, item.nivel)
          formData.append(`formaciones[${i}][titulo_profesion]`, item.titulo_profesion)
          formData.append(`formaciones[${i}][universidad]`, item.universidad)
          formData.append(`formaciones[${i}][anio_emision]`, item.anio_emision)
          if (item.archivo instanceof File) {
            formData.append(`formaciones[${i}][archivo]`, item.archivo)
          }
        })

        // Experiencias
        this.experiencias.forEach((item, i) => {
          formData.append(`experiencias[${i}][cargo_desempenado]`, item.cargo_desempenado)
          formData.append(`experiencias[${i}][empresa_institucion]`, item.empresa_institucion)
          formData.append(`experiencias[${i}][anio_inicio]`, item.anio_inicio)
          formData.append(`experiencias[${i}][anio_fin]`, item.anio_fin || '')
          formData.append(`experiencias[${i}][funciones]`, item.funciones || '')
          if (item.archivo instanceof File) {
            formData.append(`experiencias[${i}][archivo]`, item.archivo)
          }
        })

        // Capacitaciones (Solo las que tengan nombre)
        const capsFiltradas = this.capacitaciones.filter(c => c.nombre_curso && c.nombre_curso.trim() !== '')
        capsFiltradas.forEach((item, i) => {
          formData.append(`capacitaciones[${i}][nombre_curso]`, item.nombre_curso)
          formData.append(`capacitaciones[${i}][institucion_emisora]`, item.institucion_emisora || '')
          formData.append(`capacitaciones[${i}][carga_horaria]`, item.carga_horaria || '')
          formData.append(`capacitaciones[${i}][anio]`, item.anio)
          if (item.archivo instanceof File) {
            formData.append(`capacitaciones[${i}][archivo]`, item.archivo)
          }
        })

        // Producciones (Solo las que tengan título)
        const prodsFiltradas = this.producciones.filter(p => p.titulo && p.titulo.trim() !== '')
        prodsFiltradas.forEach((item, i) => {
          formData.append(`producciones[${i}][tipo]`, item.tipo)
          formData.append(`producciones[${i}][titulo]`, item.titulo)
          formData.append(`producciones[${i}][descripcion]`, item.descripcion || '')
          formData.append(`producciones[${i}][anio]`, item.anio)
          if (item.archivo instanceof File) {
            formData.append(`producciones[${i}][archivo]`, item.archivo)
          }
        })

        // Reconocimientos (Solo los que tengan título o tipo)
        const recsFiltrados = this.reconocimientos.filter(r => (r.titulo && r.titulo.trim() !== '') || (r.tipo_reconocimiento && r.tipo_reconocimiento.trim() !== ''))
        recsFiltrados.forEach((item, i) => {
          formData.append(`reconocimientos[${i}][tipo_reconocimiento]`, item.tipo_reconocimiento || '')
          formData.append(`reconocimientos[${i}][titulo]`, item.titulo || '')
          formData.append(`reconocimientos[${i}][otorgado_por]`, item.otorgado_por || '')
          formData.append(`reconocimientos[${i}][anio]`, item.anio)
          if (item.archivo instanceof File) {
            formData.append(`reconocimientos[${i}][archivo]`, item.archivo)
          }
        })

        const { data } = await api.post('/postulante/proceso-completo', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        this.resultado = data
        return data
      } catch (error) {
        this.error = error.response?.data?.message || 'Error al enviar postulación'
        throw error
      } finally {
        this.loading = false
      }
    },

    // Consultar estado de postulaciones
    async consultarEstado(ci) {
      try {
        const { data } = await api.post('/consultar-estado', { ci })
        return data
      } finally {
        this.loading = false
      }
    },
  },
})
