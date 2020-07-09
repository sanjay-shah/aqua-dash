import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import moment from 'moment'
const login = {
  id: 'administrator',
  password: 'NzgxYzll'
}
// Function to compute timestamp 
// from mongodb's document _id 
function getTimestamp (objectId) {
  return moment(
    new Date(
      parseInt(objectId.substring(0, 8), 16) * 1000)
  ).format('DD-MM-YY HH:mm')
}

//axios.defaults.baseURL = 'http://138.68.36.184/api'
//axios.defaults.headers.common['Authorization'] = AUTH_TOKEN;
//axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    namespaces: [],
    registries: [],
    imagesText: [],
    images: [],
    vulnCount: 0,
    accessToken: "",
    vulnAck: [],
    vulnUnAck: 0,
    vulnCritical: 0,
    vulnHigh: 0,
    vulnMedium: 0,
    vulnLow: 0,
    imageSelected: null,
    repoSelected: null,
    timeseriesData: null,
    from: moment().subtract(1, 'months'),
    to: moment(),
    risks: [],
    riskTableLoading: false
  },
  getters: {
    namespaces (state) {
      return state.namespaces
    },
    registries (state) {
      return state.registries
    },
    imagesText (state) {
      return state.imagesText
    },
    images (state) {
      return state.images
    },
    vulnCount (state) {
      return state.vulnCount
    },
    accessToken (state) {
      return state.accessToken
    },
    vulnAck (state) {
      return state.vulnAck
    },
    vulnUnAck (state) {
      return state.vulnUnAck
    },
    vulnCritical (state) {
      return state.vulnCritical
    },
    vulnHigh (state) {
      return state.vulnHigh
    },
    vulnMedium (state) {
      return state.vulnMedium
    },
    vulnLow (state) {
      return state.vulnLow
    },
    imageSelected (state) {
      return state.imageSelected
    },
    repoSelected (state) {
      return state.repoSelected
    },
    timeseriesData (state) {
      return state.timeseriesData
    },
    risks (state) {
      return state.risks
    },
    riskTableLoading (state) {
      return state.riskTableLoading
    }
  },
  mutations: {
    SET_NAMESPACES (state, namespaces) {
      if (namespaces) {
        state.namespaces = namespaces
      }
    },
    SET_REGISTRIES (state, registries) {
      if (registries) {
        state.registries = registries
      }
    },
    SET_IMAGES_TEXT (state, imagesText) {
      if (imagesText) {
        state.imagesText = imagesText
      }
    },
    SET_IMAGES (state, images) {
      if (images) {
        state.images = images
      }
    },
    SET_VULN_COUNT (state, vulnCount) {
      if (vulnCount) {
        state.vulnCount = vulnCount
      }
    },
    SET_ACCESS_TOKEN (state, accessToken) {
        state.accessToken = accessToken
    },
    SET_VULN_ACK (state, vulnAck) {
      if (vulnAck) {
        state.vulnAck = vulnAck
      }
    },
    SET_VULN_UNACK (state, vulnUnAck) {
      if (vulnUnAck) {
        state.vulnUnAck = vulnUnAck
      }
    },
    SET_VULN_SEV (state, vulnSev) {
      if (vulnSev.severity === 'critical') {
        state.vulnCritical = vulnSev.count
      } else if (vulnSev.severity === 'high') {
        state.vulnHigh = vulnSev.count
      } else if (vulnSev.severity === 'medium') {
        state.vulnMedium = vulnSev.count
      } else if (vulnSev.severity === 'low') {
        state.vulnLow = vulnSev.count
      }
    },
    SET_IMAGE_SELECTED (state, imageSelected) {
      if (imageSelected) {
        state.imageSelected = imageSelected
      }
    },
    SET_REPO_SELECTED (state, repoSelected) {
      if (repoSelected) {
        state.repoSelected = repoSelected
      }
    },
    SET_TIMESERIES_DATA (state, timeseriesData) {
      if (timeseriesData) {
        state.timeseriesData = timeseriesData
      }
    },
    SET_RISKS (state, risks) {
      if (risks) {
        state.risks = risks
      }
    },
    SET_RISK_TABLE_LOADING (state, riskTableLoading) {
      if (riskTableLoading) {
        state.riskTableLoading = riskTableLoading
      }
    }
  },
  actions: {
    async fetchAccessToken ({commit}) {
      let result = await axios.post(
          'http://localhost:9090/api/v1/login', 
          login
        )
      await commit('SET_ACCESS_TOKEN', result.data.token)
    },
    async fetchNamespaces ({commit, state}) {
      let tokenString = "Bearer " + state.accessToken
      let response = await axios.get('http://localhost:9090/api/v1/orchestrator/namespaces/names?orderby=name%2Basc', 
        { headers: { Authorization: tokenString } 
      })
      console.log('namespaces: ')
      console.log(response.data.result)
      let names = ['All Projects']
      for (var i = 0; i < response.data.result.length; i++) {
        names.push(response.data.result[i].name)
      }
      await commit('SET_NAMESPACES', names)
    },
    async fetchRegistries ({commit, state}) {
      let tokenString = "Bearer " + state.accessToken
      //console.log(tokenString)
      let response = await axios.get('http://localhost:9090/api/v1/registries', 
        { headers: { Authorization: tokenString } 
      })
      console.log('registries: ')
      console.log(response.data)
      let names = ['All Registries']
      for (var i = 0; i < response.data.length; i++) {
        names.push(response.data[i].name)
      }
      await commit('SET_REGISTRIES', names)
      //console.log(result.data)
    },
    async fetchImages ({commit, state}, repo) {
      let tokenString = "Bearer " + state.accessToken
      /////////////////////////////////////
      //**** PUT LOGIC FOR PAGINATION    //
      //**** TEMP HACK - PAGE_SIZE: 1000 //
      /////////////////////////////////////
      /*
      let response = await axios.get('http://localhost:9090/api/v2/images?registry=Host+Images&page=1&include_totals=true&order_by=name&page_size=1000', 
        { headers: { Authorization: tokenString } 
      })*/
      repo = repo.replace(/ /g, '+')
      console.log('REPO: ')
      console.log(repo)
      let response = null
      if (repo !== 'All+Registries') {
        response = await axios.get('http://localhost:9090/api/v2/images?registry=' + repo + '&page=1&include_totals=true&order_by=name&page_size=1000', 
          { headers: { Authorization: tokenString } 
        })
      } else {
        response = await axios.get('http://localhost:9090/api/v2/images?page=1&include_totals=true&order_by=name&page_size=1000', 
          { headers: { Authorization: tokenString } 
        })
      }

      console.log('images: ')
      console.log(response.data.result)

      let names = ['All Images']
      for (var i = 0; response.data.result && i < response.data.result.length; i++) {
        names.push(response.data.result[i].name)
      }
      await commit('SET_IMAGES_TEXT', response.data.result ? names : [])
      await commit('SET_IMAGES', response.data.result ? response.data.result : [])
      //console.log(result.data)
    },
    async fetchRisks ({commit, state}) {
      //https://testdrive656.aquasec.com/api/v2/images/aquademo/malware-example/latest/malware
      //https://testdrive656.aquasec.com/api/v2/images/aquademo/malware-example/latest/sensitive
      await commit('SET_RISKS', [])
      await commit('SET_RISK_TABLE_LOADING', true)
      let tokenString = "Bearer " + state.accessToken
      let vulnResponse = await axios.get('http://localhost:9090/api/v2/risks/vulnerabilities', 
        { 
          headers: { 
            Authorization: tokenString 
          },
          params: {
            include_vpatch_info: 'true',
            page: 1,
            pagesize: 1000,
            skip_count: false,
            hide_base_image: false,
            image_name: state.imageSelected,
            show_medium_to_critical: true,
            order_by: '-aqua_severity'
          }
      })
      let riskArray = []
      //response.data.result ? response.data.result : []
      for (let i = 0; i < vulnResponse.data.result.length; i++) {
        if (vulnResponse.data.result[i].aqua_severity !== 'medium') {
          riskArray.push(vulnResponse.data.result[i])
        }
      }
      
      console.log('RISKS: ')
      console.log(riskArray)
      let cleansedImageName = state.imageSelected
      cleansedImageName = cleansedImageName.replace(/:/g, '/')
      let malwareResponse = await axios.get(`http://localhost:9090/api/v2/images/${state.repoSelected}/${cleansedImageName}/malware`, 
      { 
        headers: { 
          Authorization: tokenString 
        }
      })
      console.log('Malware:')
      console.log(malwareResponse.data.result)
      let sensitiveResponse = await axios.get(`http://localhost:9090/api/v2/images/${state.repoSelected}/${cleansedImageName}/sensitive`, 
      { 
        headers: { 
          Authorization: tokenString 
        }
      })
      console.log('Sensitive:')
      console.log(sensitiveResponse.data.result)
      let malwareObject = {
        name: "Malware",
        aqua_severity: "Malware",
        solution: "Delete these files",
        nvd_url: "https://malware.fix"
      }
      for (let i = 0; i < malwareResponse.data.result.length; i++) {
          malwareObject.description 
            = 'Malware: ' + malwareResponse.data.result[i].malware 
            + ' Path: ' + malwareResponse.data.result[i].paths
          riskArray.push(malwareObject)
      }

      let sensitiveObject = {
        name: "Sensitive",
        aqua_severity: "Sensitive",
        solution: "Delete these files",
        nvd_url: "https://sensitive.fix"
      }
      for (let j = 0; j < sensitiveResponse.data.result.length; j++) {
          sensitiveObject.description 
            = 'Type: ' + sensitiveResponse.data.result[j].type 
            + ' Path: ' + sensitiveResponse.data.result[j].path
          riskArray.push(sensitiveObject)
          console.log('sensitiveObject')
          console.log(sensitiveObject)
      }
      // add id to riskArray
      console.log('Risk Array Length')
      console.log(riskArray.length)
      for (var i = 0; i < riskArray.length; i++) {
        console.log(i)
        riskArray[i].id = i
      }
      console.log('riskArray with malware')
      console.log(riskArray)
      await commit('SET_RISKS', riskArray)
      await commit('SET_RISK_TABLE_LOADING', false)
      
      
    },
    async fetchVulnAck ({commit, state}) {
      /////////////////////////////////////
      //**** PUT LOGIC FOR PAGINATION    //
      //**** TEMP HACK - PAGE_SIZE: 1000 //
      //count: X, page: 1, pagesize: 1000//
      /////////////////////////////////////
      let tokenString = "Bearer " + state.accessToken
      let response = await axios.get('http://localhost:9090/api/v2/risks/vulnerabilities?include_vpatch_info=true&show_negligible=true&page=1&pagesize=1000&skip_count=false&hide_base_image=false&acknowledge_status=true&order_by=-vendor_severity', 
        { headers: { Authorization: tokenString } 
      })
      console.log('fetchVulnAck: ')
      console.log(response.data.result)
      await commit('SET_VULN_ACK', response.data.result)
    },
    async fetchVulnSeverity ({commit, state}, severity) {
      let tokenString = "Bearer " + state.accessToken
      let result = await axios.get('http://localhost:9090/api/v2/risks/vulnerabilities?include_vpatch_info=true&show_negligible=false&page=1&pagesize=50&skip_count=true&hide_base_image=false&severity=' + severity + '&order_by=-vendor_severity', 
        { headers: { Authorization: tokenString } 
      })
      await commit('SET_VULN_SEV', { 
        severity: severity, 
        count: result.data.result.length 
      })
      console.log(result.data.result.length)
    },
    async selectImage ({commit}, image) {
      await commit('SET_IMAGE_SELECTED', image)
      console.log('Selected Image: ')
      console.log(image)
    },
    async selectRepo ({commit}, repo) {
      await commit('SET_REPO_SELECTED', repo)
      console.log('Selected Repo: ')
      console.log(repo)
    },
    async fetchTimeseriesData ({commit, state}) {
      let imageName = state.imageSelected
      let repoName = state.repoSelected
      let timeseriesData = {}
      console.log('attempting to fetch timeseriesData: ')
      console.log('imageName: ' + imageName)
      console.log('repoName: ' + repoName)
      let response = await axios.get(`http://localhost:8559/risks?from=${state.from}&to=${state.to}&imageName=${imageName}&repoName=${repoName}`)
      console.log('timeseriesData')
      console.log(response.data)
      timeseriesData.critVuln = response.data.map(image => image.critVulns)
      timeseriesData.highVuln = response.data.map(image => image.highVulns)
      timeseriesData.medVuln = response.data.map(image => image.medVulns)
      timeseriesData.labels = response.data.map(image => getTimestamp(image._id))
      await commit('SET_TIMESERIES_DATA', timeseriesData)
    }
  }
})
