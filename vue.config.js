// vue.config.js file to be place in the root of your repository
// make sure you update `yourProjectName` with the name of your GitLab project

module.exports = {
    baseUrl: '/',
    configureWebpack: config => {
        if (process.env.NODE_ENV === 'production') {
            return {
                devtool: '(none)'
            }
        } else {
            // mutate for development...
        }
    }
}