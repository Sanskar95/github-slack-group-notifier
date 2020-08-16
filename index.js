const { Octokit } = require("@octokit/rest");

const octokit = new Octokit({



  userAgent: 'myApp v1.2.3',


  previews: ['jean-grey', 'symmetra'],

  timeZone: 'Europe/Amsterdam',


  baseUrl: 'https://api.github.com',


  log: {
    debug: () => {},
    info: () => {},
    warn: console.warn,
    error: console.error
  },

  request: {
    agent: undefined,
    fetch: undefined,
    timeout: 0
  }
})

 function getPullRequest() {
let data= null
       octokit.pulls.get({
  owner: "facebook",
  repo: "react",
  pull_number: 19617,
}).then(respone=>{
  data= respone.data
       })

   return data
}

console.log(getPullRequest)
